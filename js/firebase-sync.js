/* =========================================================
   Firebase Auth & Multi-Device Realtime Cloud Sync
   ========================================================= */

(function () {
  const STORAGE_CONFIG_KEY = "kanji_firebase_config_v1";

  let app = null;
  let auth = null;
  let db = null;
  let unsubscribeSnapshot = null;
  let syncTimeout = null;
  let isReceivingRemote = false;

  const firebaseSync = {
    currentUser: null,
    syncStatus: "idle", // 'idle' | 'syncing' | 'synced' | 'error'
    lastSynced: null,
    onAuthStateChanged: null,
    onCloudStateMerged: null,
    onSyncStatusChanged: null,

    getConfig() {
      try {
        const stored = localStorage.getItem(STORAGE_CONFIG_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.apiKey && parsed.projectId) return parsed;
        }
      } catch (e) {
        console.warn("Failed to read firebase config from storage", e);
      }
      if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && window.FIREBASE_CONFIG.projectId) {
        return window.FIREBASE_CONFIG;
      }
      return null;
    },

    isConfigured() {
      const c = this.getConfig();
      return !!(c && c.apiKey && c.projectId);
    },

    saveConfig(cfg) {
      if (!cfg || !cfg.apiKey || !cfg.projectId) {
        throw new Error("Invalid Firebase Config: apiKey and projectId required.");
      }
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(cfg));
      return this.init();
    },

    clearConfig() {
      localStorage.removeItem(STORAGE_CONFIG_KEY);
      if (auth) {
        try { auth.signOut(); } catch {}
      }
      app = null;
      auth = null;
      db = null;
      this.currentUser = null;
      this.syncStatus = "idle";
      if (this.onAuthStateChanged) this.onAuthStateChanged(null);
    },

    init() {
      if (typeof firebase === "undefined") {
        console.warn("Firebase SDK not loaded on this page.");
        return false;
      }

      const config = this.getConfig();
      if (!config) {
        return false;
      }

      try {
        if (!firebase.apps.length) {
          app = firebase.initializeApp(config);
        } else {
          app = firebase.app();
        }

        auth = firebase.auth();
        db = firebase.firestore();

        // Enable offline persistence for Firestore if supported
        try {
          db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
            if (err.code !== "failed-precondition" && err.code !== "unimplemented") {
              console.warn("Firestore persistence warning:", err);
            }
          });
        } catch (e) {
          /* persistence already enabled or unsupported */
        }

        auth.onAuthStateChanged((user) => {
          this.currentUser = user ? {
            uid: user.uid,
            displayName: user.displayName || "Kanji Learner",
            email: user.email,
            photoURL: user.photoURL,
          } : null;

          if (user) {
            this.startRealtimeSync(user.uid);
          } else {
            this.stopRealtimeSync();
          }

          if (typeof this.onAuthStateChanged === "function") {
            this.onAuthStateChanged(this.currentUser);
          }
        });

        return true;
      } catch (err) {
        console.error("Firebase init failed:", err);
        this.syncStatus = "error";
        return false;
      }
    },

    async signInWithGoogle() {
      if (!this.isConfigured()) {
        throw new Error("Firebase is not configured yet.");
      }
      if (!auth) this.init();
      if (!auth) throw new Error("Firebase Auth could not be initialized.");

      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      try {
        const result = await auth.signInWithPopup(provider);
        return result.user;
      } catch (error) {
        // Fallback to redirect if popup is blocked
        if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user") {
          console.warn("Popup blocked or closed, falling back to redirect...");
          await auth.signInWithRedirect(provider);
        } else {
          throw error;
        }
      }
    },

    async signOut() {
      if (auth) {
        await auth.signOut();
        this.stopRealtimeSync();
        this.currentUser = null;
        this.syncStatus = "idle";
        if (typeof this.onAuthStateChanged === "function") {
          this.onAuthStateChanged(null);
        }
      }
    },

    startRealtimeSync(uid) {
      this.stopRealtimeSync();
      if (!db) return;

      const userDocRef = db.collection("users").doc(uid);

      unsubscribeSnapshot = userDocRef.onSnapshot(
        (snapshot) => {
          // If update came from local pending writes, skip re-merging to prevent loops
          if (snapshot.metadata && snapshot.metadata.hasPendingWrites) {
            this.syncStatus = "synced";
            this.lastSynced = Date.now();
            if (this.onSyncStatusChanged) this.onSyncStatusChanged(this.syncStatus, this.lastSynced);
            return;
          }

          if (snapshot.exists) {
            const remoteData = snapshot.data();
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
          } else {
            // First time this user connects: seed cloud document from local progress!
            if (window.state) {
              this.saveToCloud(window.state, true);
            }
          }

          if (this.onSyncStatusChanged) {
            this.onSyncStatusChanged(this.syncStatus, this.lastSynced);
          }
        },
        (error) => {
          console.error("Firestore sync subscription error:", error);
          this.syncStatus = "error";
          if (this.onSyncStatusChanged) {
            this.onSyncStatusChanged(this.syncStatus, this.lastSynced);
          }
        }
      );
    },

    stopRealtimeSync() {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
    },

    saveToCloud(localState, immediate = false) {
      if (!this.currentUser || !db || isReceivingRemote) return;

      clearTimeout(syncTimeout);

      const doSave = async () => {
        try {
          this.syncStatus = "syncing";
          if (this.onSyncStatusChanged) this.onSyncStatusChanged(this.syncStatus, this.lastSynced);

          const payload = {
            learned: Array.isArray(localState.learned) ? localState.learned : [],
            favorites: Array.isArray(localState.favorites) ? localState.favorites : [],
            quiz: localState.quiz || { correct: 0, total: 0 },
            best: Number(localState.best) || 0,
            days: Array.isArray(localState.days) ? localState.days : [],
            prefs: localState.prefs || {},
            srs: localState.srs || {},
            updatedAt: Date.now(),
            userEmail: this.currentUser.email || "",
            userName: this.currentUser.displayName || "",
          };

          await db.collection("users").doc(this.currentUser.uid).set(payload, { merge: true });

          this.syncStatus = "synced";
          this.lastSynced = Date.now();
          if (this.onSyncStatusChanged) this.onSyncStatusChanged(this.syncStatus, this.lastSynced);
        } catch (err) {
          console.error("Failed to sync to Firestore:", err);
          this.syncStatus = "error";
          if (this.onSyncStatusChanged) this.onSyncStatusChanged(this.syncStatus, this.lastSynced);
        }
      };

      if (immediate) {
        doSave();
      } else {
        syncTimeout = setTimeout(doSave, 800);
      }
    },
  };

  window.firebaseSync = firebaseSync;

  // Auto-init on load if script is present and config exists
  document.addEventListener("DOMContentLoaded", () => {
    firebaseSync.init();
  });
})();
