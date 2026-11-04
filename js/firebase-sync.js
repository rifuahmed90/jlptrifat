/* =========================================================
   Firebase Auth & Multi-Device Realtime Cloud Sync
   Provisioned with Firestore Named Database & Google OAuth
   ========================================================= */

(function () {
  const OperationType = {
    CREATE: "create",
    UPDATE: "update",
    DELETE: "delete",
    LIST: "list",
    GET: "get",
    WRITE: "write",
  };

  let app = null;
  let auth = null;
  let db = null;
  let fbModules = null;
  let initPromise = null;
  let unsubscribeSnapshot = null;
  let syncTimeout = null;
  let isReceivingRemote = false;

  function handleFirestoreError(error, operationType, path) {
    const currentUser = auth && auth.currentUser;
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: currentUser ? currentUser.uid : undefined,
        email: currentUser ? currentUser.email : undefined,
        emailVerified: currentUser ? currentUser.emailVerified : undefined,
        isAnonymous: currentUser ? currentUser.isAnonymous : undefined,
        tenantId: currentUser ? currentUser.tenantId : undefined,
        providerInfo: currentUser && currentUser.providerData
          ? currentUser.providerData.map((provider) => ({
              providerId: provider.providerId,
              displayName: provider.displayName,
              email: provider.email,
              photoUrl: provider.photoURL,
            }))
          : [],
      },
      operationType,
      path,
    };
    console.error("Firestore Error: ", JSON.stringify(errInfo));
    return new Error(JSON.stringify(errInfo));
  }

  async function loadModularSdk() {
    if (fbModules) return fbModules;
    const [appMod, authMod, firestoreMod] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
    ]);
    fbModules = { ...appMod, ...authMod, ...firestoreMod };
    return fbModules;
  }

  let lastSyncedFingerprint = "";
  let hasPendingCloudWrite = false;

  function buildPayload(localState, currentUser) {
    return {
      learned: Array.isArray(localState.learned) ? localState.learned.slice(0, 3000) : [],
      favorites: Array.isArray(localState.favorites) ? localState.favorites.slice(0, 3000) : [],
      quiz: {
        correct: Number(localState.quiz && localState.quiz.correct) || 0,
        total: Number(localState.quiz && localState.quiz.total) || 0,
      },
      best: Math.max(0, Math.min(100, Number(localState.best) || 0)),
      days: Array.isArray(localState.days) ? localState.days.slice(-180) : [],
      prefs: localState.prefs || { ruby: true, reading: true, translation: true },
      srs: localState.srs || {},
      userEmail: String((currentUser && currentUser.email) || "").slice(0, 200),
      userName: String((currentUser && currentUser.displayName) || "").slice(0, 100),
    };
  }

  function computeFingerprint(data) {
    if (!data) return "";
    try {
      return JSON.stringify({
        learned: data.learned || [],
        favorites: data.favorites || [],
        quiz: data.quiz || { correct: 0, total: 0 },
        best: Number(data.best) || 0,
        days: data.days || [],
        prefs: data.prefs || {},
        srs: data.srs || {},
      });
    } catch {
      return "";
    }
  }

  const firebaseSync = {
    currentUser: null,
    syncStatus: "idle", // 'idle' | 'syncing' | 'synced' | 'error'
    lastSynced: null,
    onAuthStateChanged: null,
    onCloudStateMerged: null,
    onSyncStatusChanged: null,

    getConfig() {
      if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && window.FIREBASE_CONFIG.projectId) {
        return window.FIREBASE_CONFIG;
      }
      return null;
    },

    isConfigured() {
      const c = this.getConfig();
      return !!(c && c.apiKey && c.projectId);
    },

    async init() {
      if (initPromise) return initPromise;
      const config = this.getConfig();
      if (!config) return false;

      initPromise = (async () => {
        try {
          const sdk = await loadModularSdk();
          app = sdk.getApps().length ? sdk.getApp() : sdk.initializeApp(config);
          auth = sdk.getAuth(app);
          db = config.firestoreDatabaseId
            ? sdk.getFirestore(app, config.firestoreDatabaseId)
            : sdk.getFirestore(app);

          sdk.onAuthStateChanged(auth, (user) => {
            this.currentUser = user
              ? {
                  uid: user.uid,
                  displayName: user.displayName || (user.email ? user.email.split("@")[0] : "Kanji Learner"),
                  email: user.email || "",
                  photoURL: user.photoURL || "",
                }
              : null;

            if (user) {
              this.startRealtimeSync(user.uid);
            } else {
              this.stopRealtimeSync();
              this.syncStatus = "idle";
            }

            if (typeof this.onAuthStateChanged === "function") {
              this.onAuthStateChanged(this.currentUser);
            }
          });

          return true;
        } catch (err) {
          console.error("Firebase init failed:", err);
          this.syncStatus = "error";
          initPromise = null;
          return false;
        }
      })();

      return initPromise;
    },

    async signInWithGoogle() {
      await this.init();
      const sdk = await loadModularSdk();
      if (!auth) throw new Error("Firebase Auth could not be initialized.");

      const provider = new sdk.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await sdk.signInWithPopup(auth, provider);
      return result.user;
    },

    async signOut() {
      await this.init();
      const sdk = await loadModularSdk();
      if (auth) {
        this.stopRealtimeSync();
        await sdk.signOut(auth);
        this.currentUser = null;
        this.syncStatus = "idle";
        lastSyncedFingerprint = "";
        if (typeof this.onAuthStateChanged === "function") {
          this.onAuthStateChanged(null);
        }
      }
    },

    async startRealtimeSync(uid) {
      this.stopRealtimeSync();
      const sdk = await loadModularSdk();
      if (!db || !uid) return;

      const path = `users/${uid}`;
      const userDocRef = sdk.doc(db, "users", uid);

      unsubscribeSnapshot = sdk.onSnapshot(
        userDocRef,
        (snapshot) => {
          if (snapshot.metadata && snapshot.metadata.hasPendingWrites) {
            this.syncStatus = "synced";
            this.lastSynced = Date.now();
            if (this.onSyncStatusChanged) this.onSyncStatusChanged(this.syncStatus, this.lastSynced);
            return;
          }

          if (snapshot.exists()) {
            const remoteData = snapshot.data();
            const remoteFp = computeFingerprint(remoteData);
            if (remoteFp && remoteFp === lastSyncedFingerprint) {
              this.syncStatus = "synced";
              this.lastSynced = Date.now();
              if (this.onSyncStatusChanged) this.onSyncStatusChanged(this.syncStatus, this.lastSynced);
              return;
            }
            lastSyncedFingerprint = remoteFp;
            isReceivingRemote = true;
            try {
              if (typeof this.onCloudStateMerged === "function") {
                this.onCloudStateMerged(remoteData);
              }
              this.syncStatus = "synced";
              this.lastSynced = Date.now();
            } finally {
              isReceivingRemote = false;
            }
          } else if (window.state) {
            this.saveToCloud(window.state, true);
          }

          if (this.onSyncStatusChanged) {
            this.onSyncStatusChanged(this.syncStatus, this.lastSynced);
          }
        },
        (error) => {
          this.syncStatus = "error";
          if (this.onSyncStatusChanged) {
            this.onSyncStatusChanged(this.syncStatus, this.lastSynced);
          }
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    },

    stopRealtimeSync() {
      clearTimeout(syncTimeout);
      hasPendingCloudWrite = false;
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
    },

    saveToCloud(localState, immediate = false) {
      if (!this.currentUser || !db || isReceivingRemote) return;

      const nextFp = computeFingerprint(localState);
      if (!immediate && nextFp && nextFp === lastSyncedFingerprint) {
        return; // Skip network write if nothing changed
      }

      clearTimeout(syncTimeout);
      hasPendingCloudWrite = true;

      const doSave = async () => {
        hasPendingCloudWrite = false;
        const uid = this.currentUser && this.currentUser.uid;
        if (!uid || !db) return;
        const latestState = window.state || localState;
        const currentFp = computeFingerprint(latestState);
        if (!immediate && currentFp && currentFp === lastSyncedFingerprint) {
          return;
        }
        const path = `users/${uid}`;
        try {
          const sdk = await loadModularSdk();
          this.syncStatus = "syncing";
          if (this.onSyncStatusChanged) this.onSyncStatusChanged(this.syncStatus, this.lastSynced);

          const payload = {
            ...buildPayload(latestState, this.currentUser),
            updatedAt: Date.now(),
          };

          lastSyncedFingerprint = currentFp;
          await sdk.setDoc(sdk.doc(db, "users", uid), payload, { merge: true });

          this.syncStatus = "synced";
          this.lastSynced = Date.now();
          if (this.onSyncStatusChanged) this.onSyncStatusChanged(this.syncStatus, this.lastSynced);
        } catch (err) {
          this.syncStatus = "error";
          if (this.onSyncStatusChanged) this.onSyncStatusChanged(this.syncStatus, this.lastSynced);
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      };

      if (immediate) {
        doSave();
      } else {
        // Batch rapid study actions into a single write after 3 seconds of idle time
        syncTimeout = setTimeout(doSave, 3000);
      }
    },
  };

  window.firebaseSync = firebaseSync;

  if (typeof document !== "undefined") {
    // If user switches tab or closes app while a batched write is waiting, flush it immediately
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && hasPendingCloudWrite && window.state) {
        firebaseSync.saveToCloud(window.state, true);
      }
    });

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => firebaseSync.init());
    } else {
      firebaseSync.init();
    }
  }
})();
