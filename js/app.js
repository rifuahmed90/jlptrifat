/* =========================================================
   Kanji — app state, quiz engine and interactions
   ========================================================= */

const STORAGE_KEY = "kanji-dark-v1";
const LEVEL_NAMES = {
  N5: "Beginner",
  N4: "Elementary",
  N3: "Intermediate",
  N2: "Pre-Advanced",
  N1: "Advanced",
};
const byChar = Object.fromEntries(KANJI.map((k) => [k.char, k]));

/* Spaced Repetition (SRS) Intervals */
const SRS_INTERVALS = [
  0,
  4 * 3600 * 1000,       // Stage 1: 4 hours
  24 * 3600 * 1000,      // Stage 2: 1 day
  3 * 24 * 3600 * 1000,  // Stage 3: 3 days
  7 * 24 * 3600 * 1000,  // Stage 4: 7 days
  14 * 24 * 3600 * 1000, // Stage 5: 14 days
  30 * 24 * 3600 * 1000, // Stage 6: 30 days (Mastered)
];

const SRS_STAGES = [
  { stage: 0, id: "new", name: "New", nameBn: "নতুন", intervalText: "শুরু করুন", color: "muted" },
  { stage: 1, id: "apprentice1", name: "Apprentice I", nameBn: "শিক্ষানবিস ১", intervalText: "৪ ঘণ্টা", color: "teal" },
  { stage: 2, id: "apprentice2", name: "Apprentice II", nameBn: "শিক্ষানবিস ২", intervalText: "১ দিন", color: "teal" },
  { stage: 3, id: "guru", name: "Guru", nameBn: "গুরু", intervalText: "৩ দিন", color: "lav" },
  { stage: 4, id: "master", name: "Master", nameBn: "ওস্তাদ", intervalText: "৭ দিন", color: "amber" },
  { stage: 5, id: "enlightened", name: "Enlightened", nameBn: "সিদ্ধহস্ত", intervalText: "১৪ দিন", color: "coral" },
  { stage: 6, id: "burned", name: "Burned", nameBn: "স্থায়ী স্মৃতি", intervalText: "৩০ দিন (Mastered)", color: "gold" },
];

function srsInfoForChar(char) {
  if (!state.learned.includes(char) || !state.srs || !state.srs[char]) {
    return { ...SRS_STAGES[0], isLearned: false, stage: 0, nextReview: 0, streak: 0, isDue: false, dueText: "পড়া শুরু হয়নি" };
  }
  const entry = state.srs[char];
  const stageNum = Math.max(1, Math.min(6, entry.stage || 1));
  const stage = SRS_STAGES[stageNum];
  const now = Date.now();
  const diff = (entry.nextReview || 0) - now;
  const isDue = diff <= 0;

  let dueText = "";
  if (isDue) {
    dueText = "এখনই রিভিশনের সময়!";
  } else {
    const hours = Math.floor(diff / (3600 * 1000));
    const days = Math.floor(hours / 24);
    if (days >= 1) {
      dueText = `${days} দিন পর`;
    } else if (hours >= 1) {
      dueText = `${hours} ঘণ্টা পর`;
    } else {
      const mins = Math.max(1, Math.floor(diff / (60 * 1000)));
      dueText = `${mins} মিনিট পর`;
    }
  }

  return {
    ...stage,
    isLearned: true,
    stage: stageNum,
    nextReview: entry.nextReview || 0,
    streak: entry.streak || 0,
    isDue,
    dueText,
  };
}

function srsStageCounts() {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  if (!state.srs) return counts;
  for (const c of (state.learned || [])) {
    const s = state.srs[c]?.stage || 1;
    if (counts[s] !== undefined) counts[s]++;
  }
  return counts;
}

/* ---------- Icons (inline, Material-style strokes) ---------- */

const ICONS = {
  home: '<path d="M3.5 10.7 12 3.5l8.5 7.2"/><path d="M5.5 9.6V20h13V9.6"/><path d="M9.8 20v-5.4h4.4V20"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
  quiz: '<circle cx="12" cy="12" r="8.7"/><path d="M9.6 9.2a2.5 2.5 0 1 1 3.7 2.2c-.8.5-1.3 1-1.3 1.9"/><path d="M12 17h.01"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.7 20a7.4 7.4 0 0 1 14.6 0"/>',
  search: '<circle cx="11" cy="11" r="6.4"/><path d="m16 16 4.3 4.3"/>',
  star: '<path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>',
  starFilled: '<path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>',
  flame: '<path d="M12 3.2c.9 3.1-2.3 4.6-2.3 7.1a2.3 2.3 0 0 0 4.6 0c0-.7-.2-1.3-.5-1.9 2.2 1.5 3.7 3.6 3.7 6a5.5 5.5 0 0 1-11 0c0-4 2.8-6.3 5.5-11.2z"/>',
  check: '<path d="M5 12.5 9.5 17 19 7"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  refresh: '<path d="M20 11.5A8 8 0 1 0 17.7 18"/><path d="M20 4.5v7h-7"/>',
  book: '<path d="M4 5.6A2.6 2.6 0 0 1 6.6 3H20v18H6.6A2.6 2.6 0 0 1 4 18.4z"/><path d="M4 17.9a2.6 2.6 0 0 1 2.6-2.5H20"/>',
  trophy: '<path d="M8 4h8v4.4a4 4 0 0 1-8 0z"/><path d="M8 5.6H5.2V7a3 3 0 0 0 3 3"/><path d="M16 5.6h2.8V7a3 3 0 0 1-3 3"/><path d="M12 12.4V16"/><path d="M10 16h4"/><path d="M9 20h6"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
  sparkles: '<path d="m12 3 1.7 4.6L18.5 9.3l-4.8 1.7L12 15.6l-1.7-4.6L5.5 9.3l4.8-1.7z"/><path d="m18.4 15.3.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8z"/>',
  trash: '<path d="M4 7h16"/><path d="M9.5 7V4.5h5V7"/><path d="m6.5 7 .9 13h9.2l.9-13"/><path d="M10 11v5"/><path d="M14 11v5"/>',
  info: '<circle cx="12" cy="12" r="8.7"/><path d="M12 11v5"/><path d="M12 7.6h.01"/>',
  alert: '<path d="m10.3 3.9-8.5 14.7A2 2 0 0 0 3.5 21.6h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  chevron: '<path d="M9 5.5l6.5 6.5L9 18.5"/>',
  play: '<path d="M8 5.5 18.5 12 8 18.5z"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
  volume: '<path d="M4.5 9.5h3l4.2-3.4v11.8l-4.2-3.4h-3z"/><path d="M15.4 9.1a4 4 0 0 1 0 5.8"/><path d="M17.9 6.6a7.5 7.5 0 0 1 0 10.8"/>',
  settings: '<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2.1"/><circle cx="9" cy="16" r="2.1"/>',
  eye: '<path d="M2.8 12S6.5 5.9 12 5.9 21.2 12 21.2 12 17.5 18.1 12 18.1 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="3.1"/>',
  lang: '<path d="M4 6h8.5M8.3 6v1.5c0 3.3-2 5.7-4.3 7M6 10.4c1 2 2.7 3.6 4.7 4.4"/><path d="M13.2 20 16.7 11.6 20.2 20"/><path d="M14.4 17.2h4.6"/>',
  pin: '<path d="M12 21s6-5.4 6-10.2A6 6 0 0 0 6 10.8C6 15.6 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.2"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  cloudCheck: '<path d="m8.5 13.5 2.5 2.5 4.5-5"/><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  google: '<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>',
};

function icon(name, size = 22) {
  if (name === "google") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">${ICONS.google}</svg>`;
  }
  const body = ICONS[name] || ICONS.info;
  const filled = name === "starFilled";
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="${filled ? 1.2 : 1.7}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

/* ---------- State ---------- */

const ALL_JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"];

function normalizeStudyLevels(arr) {
  if (!Array.isArray(arr)) return ["N5", "N4"];
  const valid = ALL_JLPT_LEVELS.filter((lvl) => arr.includes(lvl));
  return valid.length ? valid : ["N5", "N4"];
}

function freshState() {
  return {
    learned: [],
    favorites: [],
    quiz: { correct: 0, total: 0 },
    best: 0,
    days: [],
    prefs: { ruby: true, reading: true, translation: true, studyLevels: ["N5", "N4"] },
    srs: {},
    userName: "",
  };
}

function loadState() {
  const base = freshState();
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!raw || typeof raw !== "object") return base;
    const unique = (arr) => [...new Set(Array.isArray(arr) ? arr : [])].filter((c) => byChar[c]);
    const pref = (value, fallback) => (typeof value === "boolean" ? value : fallback);
    const learned = unique(raw.learned);
    const srs = (raw.srs && typeof raw.srs === "object") ? raw.srs : {};
    for (const c of learned) {
      if (!srs[c]) {
        srs[c] = { stage: 1, nextReview: Date.now() + 4 * 3600 * 1000, lastReview: Date.now(), streak: 1 };
      }
    }
    return {
      learned,
      favorites: unique(raw.favorites),
      quiz: {
        correct: Math.max(0, Number(raw.quiz && raw.quiz.correct) || 0),
        total: Math.max(0, Number(raw.quiz && raw.quiz.total) || 0),
      },
      best: Math.max(0, Math.min(10, Number(raw.best) || 0)),
      days: [...new Set(Array.isArray(raw.days) ? raw.days : [])].slice(-180),
      prefs: {
        ruby: pref(raw.prefs && raw.prefs.ruby, true),
        reading: pref(raw.prefs && raw.prefs.reading, true),
        translation: pref(raw.prefs && raw.prefs.translation, true),
        studyLevels: normalizeStudyLevels(raw.prefs && raw.prefs.studyLevels),
      },
      srs,
      userName: typeof raw.userName === "string" ? raw.userName.trim().slice(0, 60) : "",
    };
  } catch {
    return base;
  }
}

let state = loadState();
let currentView = "home";
let heroOffset = 0;
let heroAutoRotate = true;
let heroAutoTimer = null;
let browseFilter = "all";
let browseCategory = "all";
let searchQuery = "";
let kanjiLimit = 72;
let kanjiObserver = null;
let radicalQuery = "";
let wordsQuery = "";
let wordsTopic = "all";
let wordsPos = "all";
let wordsLevel = "all";
let wordsLimit = 60;
let quizLevel = "N5";
let quizMode = "meaning";
let quizCategory = "all";
let quiz = null;
let quizTimer = null;
let mockInterval = null;
let sheetChar = null;
let sheetReturnFocus = null;
let snackbarTimer = null;

/* Stroke viewer interactive state */
let strokeShowNumbers = false;
let strokeCurrentStep = 0;
let strokePlaying = false;
let strokeTimer = null;
let strokeTotal = 0;

function srsDueKanji() {
  const now = Date.now();
  return (state.learned || [])
    .map((c) => byChar[c])
    .filter((k) => k && (!state.srs || !state.srs[k.char] || (state.srs[k.char].nextReview <= now)));
}

function recordSrsAnswer(char, isCorrect) {
  if (!state.srs) state.srs = {};
  const current = state.srs[char] || { stage: 1, nextReview: 0, streak: 0 };
  if (isCorrect) {
    const nextStage = Math.min(6, (current.stage || 1) + 1);
    state.srs[char] = {
      stage: nextStage,
      nextReview: Date.now() + (SRS_INTERVALS[nextStage] || 86400000),
      lastReview: Date.now(),
      streak: (current.streak || 0) + 1,
    };
  } else {
    const nextStage = Math.max(1, (current.stage || 1) - 1);
    state.srs[char] = {
      stage: nextStage,
      nextReview: Date.now() + SRS_INTERVALS[1],
      lastReview: Date.now(),
      streak: 0,
    };
  }
}

function mergeStates(local, remote) {
  if (!remote) return local;
  if (!local) return remote;

  const unique = (arr) => [...new Set(Array.isArray(arr) ? arr : [])].filter((c) => byChar[c]);
  const learned = unique([...(local.learned || []), ...(remote.learned || [])]);
  const favorites = unique([...(local.favorites || []), ...(remote.favorites || [])]);
  const quiz = {
    correct: (Number(local.quiz?.correct) || 0) + (Number(remote.quiz?.correct) || 0),
    total: (Number(local.quiz?.total) || 0) + (Number(remote.quiz?.total) || 0),
  };
  const best = Math.max(Number(local.best) || 0, Number(remote.best) || 0);
  const days = [...new Set([...(local.days || []), ...(remote.days || [])])].sort();
  const prefs = { ...(local.prefs || {}), ...(remote.prefs || {}) };

  const srs = { ...(local.srs || {}) };
  if (remote.srs && typeof remote.srs === "object") {
    for (const [char, rItem] of Object.entries(remote.srs)) {
      if (!byChar[char]) continue;
      const lItem = srs[char];
      if (!lItem) {
        srs[char] = rItem;
      } else {
        const rStage = Number(rItem.stage) || 0;
        const lStage = Number(lItem.stage) || 0;
        if (rStage > lStage) {
          srs[char] = rItem;
        } else if (rStage === lStage) {
          const rTime = Number(rItem.lastReview) || 0;
          const lTime = Number(lItem.lastReview) || 0;
          srs[char] = rTime >= lTime ? rItem : lItem;
        }
      }
    }
  }

  for (const c of learned) {
    if (!srs[c]) {
      srs[c] = { stage: 1, nextReview: Date.now() + SRS_INTERVALS[1], lastReview: Date.now(), streak: 1 };
    }
  }

  return {
    ...local,
    learned,
    favorites,
    quiz,
    best,
    days,
    prefs,
    srs,
    userName: (remote && typeof remote.userName === "string" && remote.userName.trim())
      ? remote.userName.trim()
      : (local.userName || ""),
    updatedAt: Math.max(Number(local.updatedAt) || 0, Number(remote.updatedAt) || 0, Date.now()),
  };
}

function updateTopAvatar() {
  const avatarEl = document.querySelector(".topbar .avatar");
  if (!avatarEl) return;
  const user = window.firebaseSync?.currentUser;
  const fallbackInitial = (user && user.displayName && user.displayName.trim())
    ? user.displayName.trim()[0].toUpperCase()
    : (state && state.userName && state.userName.trim())
      ? state.userName.trim()[0].toUpperCase()
      : "学";
  avatarEl.title = user
    ? `${user.displayName || "Profile"}${user.email ? ` (${user.email})` : ""}`
    : "View profile";
  if (user && user.photoURL) {
    avatarEl.innerHTML = "";
    const img = document.createElement("img");
    const url = String(user.photoURL);
    try {
      const parsedUrl = new URL(url, window.location.origin);
      if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
        img.src = url;
        img.alt = user.displayName || "User";
        img.className = "avatar-img";
        img.referrerPolicy = "no-referrer";
        img.onerror = () => {
          avatarEl.textContent = fallbackInitial;
          avatarEl.classList.remove("has-photo");
        };
        avatarEl.appendChild(img);
        avatarEl.classList.add("has-photo");
      } else {
        avatarEl.textContent = fallbackInitial;
        avatarEl.classList.remove("has-photo");
      }
    } catch {
      avatarEl.textContent = fallbackInitial;
      avatarEl.classList.remove("has-photo");
    }
  } else {
    avatarEl.textContent = fallbackInitial;
    avatarEl.classList.remove("has-photo");
  }
}

function saveState() {
  window.state = state;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable — the app still works in memory */
  }
  if (window.firebaseSync && window.firebaseSync.currentUser) {
    window.firebaseSync.saveToCloud(state);
  }
}

// Setup Firebase sync hooks
if (window.firebaseSync) {
  window.firebaseSync.onAuthStateChanged = (user) => {
    if (user && user.displayName && !state.userName) {
      state.userName = user.displayName;
    }
    updateTopAvatar();
    if (currentView === "profile" || currentView === "home") {
      render(false);
    }
  };

  window.firebaseSync.onCloudStateMerged = (remoteData) => {
    state = mergeStates(state, remoteData);
    window.state = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
    updateTopAvatar();
    refreshSheet();
    render(false);
    snackbar("অন্য ডিভাইস থেকে ক্লাউড ডাটা সিঙ্ক হয়েছে!", "cloudCheck");
  };

  window.firebaseSync.onSyncStatusChanged = () => {
    if (currentView === "profile" || currentView === "home") {
      render(false);
    }
  };
}

/* ---------- Display preferences (global reading settings) ---------- */

const PREF_KEYS = ["ruby", "reading", "translation", "audioSlow"];
const PREF_LABELS = {
  ruby: "Furigana",
  reading: "Kana reading line",
  translation: "Bengali & English",
  audioSlow: "Slow Audio (0.65x)",
};

function displayPrefs() {
  return state.prefs || freshState().prefs;
}

function activeStudyLevels() {
  return normalizeStudyLevels(state && state.prefs && state.prefs.studyLevels);
}

function toggleStudyLevel(level) {
  if (!ALL_JLPT_LEVELS.includes(level)) return;
  const current = activeStudyLevels();
  let next;
  if (current.includes(level)) {
    if (current.length <= 1) {
      snackbar("অন্তত ১টি JLPT লেভেল সিলেক্ট রাখা প্রয়োজন", "info");
      return;
    }
    next = current.filter((l) => l !== level);
  } else {
    next = ALL_JLPT_LEVELS.filter((l) => current.includes(l) || l === level);
  }
  state.prefs = { ...displayPrefs(), studyLevels: next };
  heroOffset = 0;
  saveState();
  render(false);
  snackbar(`🎯 আপনার স্টাডি লেভেল: ${next.join(" + ")}`, "target");
}

function applyDisplayPrefs() {
  const prefs = displayPrefs();
  document.body.classList.toggle("pref-no-ruby", !prefs.ruby);
  document.body.classList.toggle("pref-no-reading", !prefs.reading);
  document.body.classList.toggle("pref-no-translation", !prefs.translation);
}

function togglePref(key) {
  if (!PREF_KEYS.includes(key)) return;
  const prefs = displayPrefs();
  state.prefs = { ...prefs, [key]: !prefs[key] };
  saveState();
  applyDisplayPrefs();
  render(false);
  snackbar(`${PREF_LABELS[key]} ${state.prefs[key] ? "shown" : "hidden"}`, state.prefs[key] ? "eye" : "eye");
}

function resetPrefs() {
  state.prefs = freshState().prefs;
  saveState();
  applyDisplayPrefs();
  render(false);
  snackbar("Reading display reset", "refresh");
}

/* ---------- Helpers ---------- */

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function learnedList() {
  return KANJI.filter((k) => state.learned.includes(k.char));
}

function levelStats(level) {
  const all = KANJI.filter((k) => k.level === level);
  const learned = all.filter((k) => state.learned.includes(k.char)).length;
  return { total: all.length, learned, pct: all.length ? Math.round((learned / all.length) * 100) : 0 };
}

function accuracy() {
  return state.quiz.total ? Math.round((state.quiz.correct / state.quiz.total) * 100) : 0;
}

function currentRank(count) {
  const total = KANJI.length;
  if (count >= total) return "🌸 গ্র্যান্ড মাস্টার · Grand Master";
  const pct = total ? count / total : 0;
  if (pct >= 0.6) return "🌲 মাস্টার · Master";
  if (pct >= 0.3) return "🌳 স্কলার · Scholar";
  if (pct >= 0.1) return "🌿 অঙ্কুর · Apprentice";
  return "🌱 চারা · Seedling";
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function isoDate(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function recordStudy() {
  const today = isoDate();
  if (!state.days.includes(today)) {
    state.days.push(today);
    if (state.days.length > 180) state.days = state.days.slice(-180);
  }
}

function streak() {
  if (!state.days.length) return 0;
  const set = new Set(state.days);
  const cursor = new Date();
  if (!set.has(isoDate(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (set.has(isoDate(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function todayKanji() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now - start) / 86400000);
  const learnedSet = new Set((state && state.learned) || []);
  const targetSet = new Set(activeStudyLevels());
  const targetPool = KANJI.filter((k) => targetSet.has(k.level));
  const unlearnedTargetPool = targetPool.filter((k) => !learnedSet.has(k.char));
  const pool = unlearnedTargetPool.length
    ? unlearnedTargetPool
    : (targetPool.length ? targetPool : KANJI);
  const idx = Math.abs(day * 7 + now.getFullYear() + heroOffset) % pool.length;
  return pool[idx] || KANJI[0];
}

function refreshHeroCardInPlace() {
  const existing = document.getElementById("home-hero-card");
  if (!existing || typeof heroCardMarkup !== "function") {
    render(false);
    return;
  }
  const wrapper = document.createElement("div");
  wrapper.innerHTML = heroCardMarkup().trim();
  const nextCard = wrapper.firstElementChild;
  if (nextCard) {
    nextCard.classList.add("hero-swap-anim");
    existing.replaceWith(nextCard);
  }
}

function setupHeroAutoRotate() {
  if (heroAutoTimer) {
    clearInterval(heroAutoTimer);
    heroAutoTimer = null;
  }
  if (currentView !== "home" || !heroAutoRotate) return;
  heroAutoTimer = setInterval(() => {
    if (currentView !== "home" || !heroAutoRotate || sheetChar) return;
    heroOffset += 1;
    refreshHeroCardInPlace();
  }, 20000);
}

function greetingText() {
  const hour = new Date().getHours();
  if (hour < 11) return "おはよう · Good morning";
  if (hour < 18) return "こんにちは · Good afternoon";
  return "こんばんは · Good evening";
}

/* ---------- Rendering shell ---------- */

const viewEl = document.getElementById("view");

function render(animate = false) {
  const isQuizActive = !!(quiz && quiz.active);
  document.body.classList.toggle("quiz-focus", isQuizActive);

  document.querySelectorAll(".nav-item").forEach((btn) => {
    const navView = currentView === "settings"
      ? "profile"
      : ["words", "radicals", "grammar", "reader", "printable"].includes(currentView)
        ? "browse"
        : currentView;
    const active = btn.dataset.nav === navView;
    btn.classList.toggle("active", active);
    if (active) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });

  let html;
  if (isQuizActive) html = renderQuiz();
  else if (currentView === "browse") html = renderBrowse();
  else if (currentView === "radicals") html = renderRadicals();
  else if (currentView === "words") html = renderWords();
  else if (currentView === "grammar") html = renderGrammar();
  else if (currentView === "reader") html = renderReader();
  else if (currentView === "printable") html = renderPrintable();
  else if (currentView === "quiz") html = renderQuiz();
  else if (currentView === "profile") html = renderProfile();
  else if (currentView === "settings") html = renderSettings();
  else html = renderHome();

  let viewName = currentView;
  if (isQuizActive) viewName = "quiz-active";
  else if (currentView === "quiz" && quiz && quiz.done) viewName = "quiz-results";
  else if (currentView === "quiz") viewName = "quiz-setup";
  viewEl.dataset.view = viewName;

  viewEl.innerHTML = html;
  updateChrome();

  if (currentView === "radicals") filterRadicals();
  if (currentView === "browse") setupKanjiInfiniteScroll();
  setupHeroAutoRotate();

  viewEl.classList.remove("animate");
  if (animate) {
    void viewEl.offsetWidth;
    viewEl.classList.add("animate");
  }
}

let kanjiBatchTimer = null;

function loadMoreKanji() {
  const list = filteredKanji();
  if (kanjiLimit >= list.length || kanjiBatchTimer) return;
  const grid = document.getElementById("kanji-grid");
  const prevLimit = kanjiLimit;
  const nextBatchSize = Math.min(72, list.length - prevLimit);
  if (!grid || nextBatchSize <= 0) return;

  if (typeof kanjiSkeletonMarkup === "function" && typeof window !== "undefined") {
    const skCount = Math.min(12, nextBatchSize);
    grid.insertAdjacentHTML("beforeend", kanjiSkeletonMarkup(skCount, "kanji-skeleton-batch"));
    const moreBtn = document.getElementById("kanji-more");
    if (moreBtn) {
      moreBtn.disabled = true;
      moreBtn.innerHTML = `<span>লোড হচ্ছে…</span>`;
    }
    kanjiBatchTimer = setTimeout(() => {
      kanjiBatchTimer = null;
      grid.querySelectorAll(".kanji-skeleton-batch").forEach((el) => el.remove());
      kanjiLimit = prevLimit + 72;
      const nextSlice = list.slice(prevLimit, kanjiLimit);
      if (nextSlice.length && typeof kanjiCardMarkup === "function") {
        grid.insertAdjacentHTML("beforeend", nextSlice.map((k, idx) => kanjiCardMarkup(k, idx)).join(""));
      }
      if (typeof syncKanjiPaginationUI === "function") {
        syncKanjiPaginationUI(list);
      }
    }, 130);
    return;
  }

  kanjiLimit += 72;
  const nextSlice = list.slice(prevLimit, kanjiLimit);
  if (nextSlice.length && typeof kanjiCardMarkup === "function") {
    grid.insertAdjacentHTML("beforeend", nextSlice.map((k, idx) => kanjiCardMarkup(k, idx)).join(""));
  } else {
    renderKanjiGrid({ showSkeleton: false });
    return;
  }
  if (typeof syncKanjiPaginationUI === "function") {
    syncKanjiPaginationUI(list);
  }
}

function setupKanjiInfiniteScroll() {
  if (kanjiObserver) {
    kanjiObserver.disconnect();
    kanjiObserver = null;
  }
  if (typeof IntersectionObserver === "undefined") return;
  const sentinel = document.getElementById("kanji-more-wrap");
  if (!sentinel || sentinel.classList.contains("hidden")) return;
  kanjiObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && currentView === "browse") {
          loadMoreKanji();
        }
      }
    },
    { rootMargin: "320px 0px" }
  );
  kanjiObserver.observe(sentinel);
}

function updateChrome() {
  const streakEl = document.getElementById("streak-count");
  if (streakEl) streakEl.textContent = streak();
}

function snackbar(message, iconName = "check") {
  const el = document.getElementById("snackbar");
  if (!el) return;
  el.innerHTML = `${icon(iconName, 18)}<span>${message}</span>`;
  el.classList.add("show");
  clearTimeout(snackbarTimer);
  snackbarTimer = setTimeout(() => el.classList.remove("show"), 2500);
}

function setView(name) {
  if (quiz && quiz.active) {
    clearTimeout(quizTimer);
    quiz = null;
  }
  if (name === "quiz" && quiz && !quiz.active) quiz = null;
  if (name === "browse") kanjiLimit = 72;
  closeSheet();
  currentView = name;
  render(true);
  window.scrollTo(0, 0);
}

/* ---------- Sheet ---------- */

function openKanji(char) {
  const k = byChar[char];
  if (!k) return;
  const wasOpen = !!sheetChar;
  if (!wasOpen) sheetReturnFocus = document.activeElement;
  sheetChar = char;

  const sheet = document.getElementById("sheet");
  sheet.innerHTML = sheetMarkup(k);
  sheet.scrollTop = 0;
  sheet.classList.add("open");
  document.getElementById("scrim").classList.add("open");
  document.body.classList.add("sheet-open");
  initStrokeViewer(k);

  if (!wasOpen) {
    const closeBtn = sheet.querySelector('[data-action="close-sheet"]');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }
}

function refreshSheet() {
  if (!sheetChar) return;
  const sheet = document.getElementById("sheet");
  const scroll = sheet.scrollTop;
  const k = byChar[sheetChar];
  sheet.innerHTML = sheetMarkup(k);
  sheet.scrollTop = scroll;
  initStrokeViewer(k);
}

function closeSheet() {
  if (!sheetChar) return;
  clearTimeout(strokeTimer);
  strokePlaying = false;
  sheetChar = null;
  document.getElementById("sheet").classList.remove("open");
  document.getElementById("scrim").classList.remove("open");
  document.body.classList.remove("sheet-open");
  if (sheetReturnFocus && typeof sheetReturnFocus.focus === "function") {
    sheetReturnFocus.focus({ preventScroll: true });
  }
  sheetReturnFocus = null;
}

function navigateSheetKanji(direction) {
  if (!sheetChar) return;
  let pool = KANJI;
  if (currentView === "browse" && typeof filteredKanji === "function") {
    const list = filteredKanji();
    if (list && list.length > 0) pool = list;
  }
  const idx = pool.findIndex((x) => x.char === sheetChar);
  if (idx < 0) {
    if (pool.length > 0) openKanji(pool[0].char);
    return;
  }
  const nextIdx = (idx + direction + pool.length) % pool.length;
  openKanji(pool[nextIdx].char);
}

function toggleFavorite(char) {
  const k = byChar[char];
  if (!k) return;
  const has = state.favorites.includes(char);
  state.favorites = has
    ? state.favorites.filter((c) => c !== char)
    : [...state.favorites, char];
  saveState();
  refreshSheet();
  render(false);
  snackbar(has ? `「${char}」removed from saved` : `「${char}」saved for review`, has ? "star" : "starFilled");
}

function toggleLearned(char) {
  const k = byChar[char];
  if (!k) return;
  const has = state.learned.includes(char);
  if (has) {
    state.learned = state.learned.filter((c) => c !== char);
    if (state.srs) {
      // Completely remove SRS data for this kanji
      delete state.srs[char];
    }
  } else {
    state.learned = [...state.learned, char];
    recordStudy();
    // Initialize SRS fresh at stage 1 (Apprentice I)
    if (!state.srs) state.srs = {};
    state.srs[char] = {
      stage: 1,
      nextReview: Date.now() + SRS_INTERVALS[1],
      lastReview: Date.now(),
      streak: 1,
    };
  }
  saveState();
  refreshSheet();
  render(false);

  if (!has && state.learned.length === KANJI.length) {
    snackbar(`All ${KANJI.length} kanji learned — incredible!`, "trophy");
  } else {
    snackbar(has ? `「${char}」removed from learned` : `「${char}」marked as learned`, has ? "refresh" : "check");
  }
}

/* ---------- Kanji Stage (Stroke Order & Handwriting Practice) ---------- */

let stageMode = "watch"; // "watch" | "draw"
let canvasGuide = true;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function initStrokeViewer(k) {
  clearTimeout(strokeTimer);
  strokePlaying = false;
  stageMode = "watch";
  canvasGuide = true;

  if (!k || !k.strokeOrder || !k.strokeOrder.paths) {
    strokeTotal = 0;
    strokeCurrentStep = 0;
    return;
  }

  strokeTotal = k.strokeOrder.paths.length;
  strokeCurrentStep = 0;
  updateStrokeDisplay();
  setupPracticeCanvas();

  // Auto-play stroke drawing when new kanji opens!
  setTimeout(() => {
    strokeAutoStart();
  }, 400);
}

function strokeAutoStart() {
  if (stageMode !== "watch") return;
  clearTimeout(strokeTimer);
  strokePlaying = true;
  strokeCurrentStep = 0;
  updateStrokeDisplay();

  function next() {
    if (!strokePlaying || stageMode !== "watch") return;
    if (strokeCurrentStep < strokeTotal) {
      strokeCurrentStep += 1;
      updateStrokeDisplay();
      strokeTimer = setTimeout(next, 650);
    } else {
      strokePlaying = false;
      updateStrokeDisplay();
    }
  }
  strokeTimer = setTimeout(next, 300);
}

function updateStrokeDisplay() {
  const paths = document.querySelectorAll(".stage-stroke-path");
  paths.forEach((p, idx) => {
    const strokeNum = idx + 1;
    p.classList.remove("is-completed", "is-active", "is-hidden");
    if (strokeNum < strokeCurrentStep) {
      p.classList.add("is-completed");
    } else if (strokeNum === strokeCurrentStep) {
      p.classList.add("is-active");
    } else {
      p.classList.add("is-hidden");
    }
  });

  const stepCount = document.getElementById("stroke-step-count");
  if (stepCount) stepCount.textContent = strokeCurrentStep;

  const playBtnText = document.getElementById("stage-play-text");
  if (playBtnText) playBtnText.textContent = strokePlaying ? "Pause" : "Play";
}

function strokeStep(delta) {
  clearTimeout(strokeTimer);
  strokePlaying = false;
  strokeCurrentStep = Math.max(0, Math.min(strokeTotal, strokeCurrentStep + delta));
  updateStrokeDisplay();
}

function strokePlay() {
  if (strokePlaying) {
    clearTimeout(strokeTimer);
    strokePlaying = false;
    updateStrokeDisplay();
    return;
  }
  if (strokeCurrentStep >= strokeTotal) {
    strokeCurrentStep = 0;
  }
  strokePlaying = true;
  updateStrokeDisplay();

  function next() {
    if (!strokePlaying) return;
    if (strokeCurrentStep < strokeTotal) {
      strokeCurrentStep += 1;
      updateStrokeDisplay();
      strokeTimer = setTimeout(next, 650);
    } else {
      strokePlaying = false;
      updateStrokeDisplay();
    }
  }
  strokeTimer = setTimeout(next, 250);
}

function strokeReplay() {
  clearTimeout(strokeTimer);
  strokePlaying = true;
  strokeCurrentStep = 0;
  updateStrokeDisplay();
  strokeAutoStart();
}

function strokeToggleNumbers() {
  strokeShowNumbers = !strokeShowNumbers;
  const numGroup = document.getElementById("stage-num-group");
  if (numGroup) numGroup.style.display = strokeShowNumbers ? "" : "none";
  const btn = document.querySelector('[data-action="stroke-toggle-numbers"]');
  if (btn) btn.classList.toggle("active", strokeShowNumbers);
}

/* ---------- Handwriting Practice Canvas ---------- */

function setStageMode(mode) {
  stageMode = mode;
  const svg = document.getElementById("stage-stroke-svg");
  const canvas = document.getElementById("practice-canvas");
  const watchBar = document.getElementById("watch-controls");
  const drawBar = document.getElementById("draw-controls");
  const tabWatch = document.getElementById("tab-watch-btn");
  const tabDraw = document.getElementById("tab-draw-btn");

  if (mode === "draw") {
    clearTimeout(strokeTimer);
    strokePlaying = false;
    if (tabWatch) tabWatch.classList.remove("active");
    if (tabDraw) tabDraw.classList.add("active");
    if (watchBar) watchBar.style.display = "none";
    if (drawBar) drawBar.style.display = "flex";
    if (canvas) canvas.style.display = "block";
    if (svg) {
      svg.classList.add("guide-mode");
      svg.style.display = canvasGuide ? "block" : "none";
      document.querySelectorAll(".stage-stroke-path").forEach((p) => {
        p.classList.remove("is-hidden", "is-active");
        p.classList.add("is-completed");
      });
    }
    setupPracticeCanvas();
  } else {
    // mode === "watch"
    if (tabWatch) tabWatch.classList.add("active");
    if (tabDraw) tabDraw.classList.remove("active");
    if (watchBar) watchBar.style.display = "flex";
    if (drawBar) drawBar.style.display = "none";
    if (canvas) canvas.style.display = "none";
    if (svg) {
      svg.classList.remove("guide-mode");
      svg.style.display = "block";
    }
    strokeCurrentStep = strokeTotal;
    updateStrokeDisplay();
  }
}

function setupPracticeCanvas() {
  const canvas = document.getElementById("practice-canvas");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = rect.width || 196;
  const h = rect.height || 196;

  canvas.width = w * dpr;
  canvas.height = h * dpr;

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#5fd3ac";

  canvas.onpointerdown = (e) => {
    isDrawing = true;
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    const r = canvas.getBoundingClientRect();
    lastX = e.clientX - r.left;
    lastY = e.clientY - r.top;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(lastX, lastY);
    ctx.stroke();
  };

  canvas.onpointermove = (e) => {
    if (!isDrawing) return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
  };

  canvas.onpointerup = (e) => {
    if (!isDrawing) return;
    isDrawing = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch {}
  };

  canvas.onpointercancel = (e) => {
    isDrawing = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch {}
  };
}

function clearPracticeCanvas() {
  const canvas = document.getElementById("practice-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
}

function togglePracticeGuide() {
  canvasGuide = !canvasGuide;
  const svg = document.getElementById("stage-stroke-svg");
  if (svg) svg.style.display = canvasGuide ? "block" : "none";
  const btn = document.getElementById("canvas-guide-btn");
  if (btn) btn.classList.toggle("active", canvasGuide);
}

/* ---------- Quiz & SRS Engine ---------- */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startSrsReview() {
  const pool = srsDueKanji();
  if (!pool.length) {
    snackbar("কোনো রিভিশন বাকি নেই! সব আপ-টু-ডেট।", "check");
    return;
  }
  startQuiz("all", "reading", "all", pool);
}

function kataToHira(str) {
  if (!str) return "";
  return str.replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

function cleanReading(r) {
  if (!r) return "";
  return r.replace(/[.\-]/g, "").trim();
}

const DAKUON_MAP = {
  "か": "が", "が": "か",
  "き": "ぎ", "ぎ": "き",
  "く": "ぐ", "ぐ": "く",
  "け": "げ", "げ": "け",
  "こ": "ご", "ご": "こ",
  "さ": "ざ", "ざ": "さ",
  "し": "じ", "じ": "し",
  "す": "ず", "ず": "す",
  "せ": "ぜ", "ぜ": "せ",
  "そ": "ぞ", "ぞ": "そ",
  "た": "だ", "だ": "た",
  "ち": "ぢ", "ぢ": "ち",
  "つ": "づ", "づ": "つ",
  "て": "で", "で": "て",
  "と": "ど", "ど": "と",
  "は": "ば", "ば": "ぱ", "ぱ": "は",
  "ひ": "び", "び": "ぴ", "ぴ": "ひ",
  "ふ": "ぶ", "ぶ": "ぷ", "ぷ": "ふ",
  "へ": "べ", "べ": "ぺ", "ぺ": "へ",
  "ほ": "ぼ", "ぼ": "ぽ", "ぽ": "ほ",
};

const HIRAGANA_SIMILAR = {
  "ひ": ["ほ", "ふ", "へ"],
  "と": ["ど", "て", "つ"],
  "ね": ["れ", "わ", "ぬ"],
  "れ": ["ね", "わ", "る"],
  "わ": ["ね", "れ", "ろ"],
  "さ": ["ち", "き", "ざ"],
  "ち": ["さ", "ら", "ぢ"],
  "ろ": ["る", "ろ", "ら"],
  "る": ["ろ", "う", "え"],
  "ぬ": ["め", "ね", "あ"],
  "め": ["ぬ", "あ", "ゆ"],
  "あ": ["お", "め", "ぬ"],
  "お": ["あ", "む", "す"],
  "ま": ["ほ", "も", "は"],
  "い": ["り", "こ", "け"],
  "り": ["い", "つ", "し"],
  "す": ["む", "ず", "お"],
  "む": ["す", "お", "ろ"],
  "な": ["た", "ね", "は"],
  "た": ["な", "だ", "に"],
  "に": ["こ", "い", "た"],
  "か": ["が", "や", "力"],
  "し": ["じ", "つ", "い"],
};

const CONFUSABLE_KANJI = {
  // N5 / N4 common lookalikes
  "人": ["入", "八", "大", "今"],
  "入": ["人", "八", "内", "大"],
  "八": ["人", "入", "ハ", "六"],
  "日": ["白", "目", "田", "旧"],
  "白": ["日", "百", "自", "目"],
  "百": ["白", "日", "自", "万"],
  "目": ["日", "白", "自", "貝"],
  "月": ["日", "朋", "用", "円"],
  "木": ["本", "休", "林", "未"],
  "本": ["木", "体", "休", "大"],
  "休": ["体", "本", "保", "木"],
  "体": ["休", "本", "作", "位"],
  "大": ["太", "犬", "天", "文"],
  "太": ["大", "犬", "天", "木"],
  "犬": ["太", "大", "天", "伏"],
  "天": ["夫", "大", "太", "矢"],
  "右": ["左", "石", "若", "古"],
  "左": ["右", "在", "庄", "石"],
  "石": ["右", "左", "古", "名"],
  "名": ["石", "各", "夕", "月"],
  "夕": ["名", "多", "久", "外"],
  "多": ["夕", "名", "外", "移"],
  "外": ["多", "処", "名", "夕"],
  "上": ["下", "止", "正", "土"],
  "下": ["上", "不", "与", "卞"],
  "土": ["士", "工", "十", "生"],
  "士": ["土", "工", "十", "牛"],
  "千": ["十", "干", "于", "チ"],
  "万": ["方", "力", "切", "木"],
  "方": ["万", "力", "芳", "片"],
  "力": ["刀", "万", "方", "カ"],
  "刀": ["力", "刃", "切", "分"],
  "分": ["切", "八", "刃", "公"],
  "切": ["初", "辺", "刀", "分"],
  "牛": ["午", "半", "年", "生"],
  "午": ["牛", "半", "年", "平"],
  "半": ["羊", "平", "年", "牛"],
  "年": ["牛", "午", "半", "平"],
  "先": ["生", "失", "洗", "元"],
  "生": ["先", "牛", "性", "正"],
  "手": ["毛", "千", "年", "乎"],
  "足": ["定", "走", "是", "疋"],
  "見": ["貝", "現", "視", "規"],
  "貝": ["見", "頁", "買", "貞"],
  "聞": ["問", "間", "開", "閉"],
  "問": ["聞", "間", "開", "向"],
  "間": ["問", "聞", "開", "関"],
  "開": ["関", "閉", "問", "聞"],
  "閉": ["開", "関", "間", "問"],
  "話": ["語", "読", "認", "詩"],
  "語": ["話", "読", "誤", "論"],
  "読": ["語", "話", "続", "買"],
  "書": ["昼", "画", "事", "筆"],
  "昼": ["書", "画", "尺", "尽"],
  "画": ["昼", "書", "田", "角"],
  "時": ["持", "侍", "待", "特"],
  "待": ["持", "特", "侍", "時"],
  "持": ["待", "特", "時", "指"],
  "特": ["待", "持", "時", "物"],
  "行": ["待", "街", "術", "得"],
  "来": ["米", "未", "末", "東"],
  "東": ["来", "車", "重", "束"],
  "西": ["酉", "要", "茜", "四"],
  "南": ["男", "商", "楠", "幸"],
  "北": ["化", "比", "兆", "此"],
  "校": ["村", "枚", "枝", "検"],
  "店": ["座", "床", "広", "府"],
  "買": ["員", "頁", "貿", "貸"],
  "売": ["買", "読", "殻", "壺"],
  "飲": ["飯", "飽", "飼", "飾"],
  "飯": ["飲", "館", "飼", "飾"],
  "館": ["飯", "館", "宿", "舗"],
  "道": ["通", "追", "首", "進"],
  "通": ["道", "進", "透", "送"],
  "母": ["毎", "舟", "女", "丹"],
  "毎": ["母", "海", "毒", "敏"],
  "父": ["交", "文", "友", "支"],
  "友": ["反", "支", "抜", "灰"],
  "兄": ["祝", "況", "兒", "克"],
  "弟": ["第", "梯", "弔", "悌"],
  "姉": ["妹", "娘", "婦", "市"],
  "妹": ["姉", "娘", "味", "株"],
  "雨": ["雪", "雷", "雲", "電"],
  "雪": ["雨", "雷", "雲", "電"],
  "電": ["雷", "雪", "雲", "雨"],
  "魚": ["角", "亀", "魯", "漁"],
  "鳥": ["烏", "島", "鳴", "鶏"],
  "島": ["鳥", "烏", "嶋", "山"],
  "車": ["東", "連", "陣", "軒"],
  "長": ["張", "帳", "髪", "良"],
  "高": ["亮", "亭", "京", "豪"],
  "安": ["家", "案", "妥", "委"],
  "新": ["親", "薪", "斤", "斬"],
  "古": ["右", "吉", "舌", "台"],
  "少": ["小", "歩", "抄", "妙"],
  "小": ["少", "水", "不", "心"],
  "早": ["草", "卓", "旱", "昇"],
  "花": ["化", "草", "茶", "苛"],
  "草": ["早", "花", "苛", "菓"],
  "茶": ["草", "荼", "菓", "葉"],
  "何": ["向", "荷", "河", "伺"],
  "私": ["和", "科", "利", "秒"],
  "赤": ["青", "赫", "亦", "変"],
  "青": ["赤", "静", "晴", "精"],
  "黒": ["里", "墨", "点", "黙"],
  "金": ["銀", "鉄", "針", "全"],
  "銀": ["金", "良", "根", "眼"],
  "借": ["貸", "惜", "昔", "錯"],
  "貸": ["借", "賃", "貨", "袋"],
  "知": ["短", "和", "智", "矩"],
  "短": ["知", "矢", "矩", "矯"],
  "会": ["合", "今", "全", "命"],
  "合": ["会", "今", "台", "吉"],
  "社": ["杜", "祁", "神", "礼"],
  "神": ["社", "申", "伸", "袖"],
  "病": ["痛", "疾", "症", "療"],
  "院": ["完", "官", "宅", "客"],
  "強": ["弱", "弓", "弧", "張"],
  "弱": ["強", "羽", "習", "溺"],
  "理": ["埋", "里", "野", "重"],
  "重": ["動", "童", "車", "量"],
  "動": ["働", "重", "勲", "助"],
  "働": ["動", "体", "侍", "値"],
  "教": ["考", "散", "敬", "数"],
  "室": ["屋", "堂", "宅", "完"],
  "屋": ["室", "居", "届", "層"],
  "考": ["老", "教", "者", "孝"],
  "始": ["終", "治", "姑", "妥"],
  "終": ["始", "緒", "冬", "糸"],
  "運": ["連", "遠", "達", "進"],
  "転": ["伝", "軽", "車", "芸"],
  "起": ["超", "走", "趣", "越"],
  "寝": ["侵", "浸", "掃", "婦"],
  "歩": ["止", "少", "渉", "涉"],
  "走": ["足", "起", "越", "赴"],
  "乗": ["条", "乘", "余", "秉"],
  "降": ["隊", "階", "除", "隆"],
  "使": ["便", "任", "史", "促"],
  "作": ["昨", "詐", "休", "件"],
  "着": ["看", "差", "著", "羞"],
  "急": ["息", "悪", "忽", "恋"],
  "研": ["確", "破", "砂", "石"],
  "究": ["突", "空", "穴", "窃"],
  "答": ["合", "落", "谷", "筒"],
  "質": ["賃", "贄", "斤", "貝"],
  // N3 lookalikes
  "政": ["整", "故", "敏", "攻"],
  "治": ["始", "法", "注", "沿"],
  "経": ["軽", "径", "怪", "茎"],
  "済": ["清", "斉", "削", "渋"],
  "法": ["治", "注", "泣", "波"],
  "律": ["建", "津", "筆", "待"],
  "際": ["察", "祭", "境", "障"],
  "関": ["開", "閉", "闘", "閃"],
  "係": ["孫", "保", "信", "修"],
  "配": ["酒", "酎", "酸", "妃"],
  "増": ["僧", "贈", "憎", "層"],
  "減": ["滅", "感", "威", "戚"],
  "感": ["惑", "咸", "盛", "減"],
  "情": ["請", "清", "晴", "静"],
  "確": ["研", "礁", "磯", "穫"],
  "認": ["話", "忍", "刃", "誇"],
  "適": ["滴", "敵", "摘", "敵"],
  "過": ["遇", "鍋", "禍", "邁"],
  "約": ["的", "釣", "灼", "酌"],
  "備": ["準", "奮", "徳", "具"],
  "整": ["政", "正", "束", "頼"],
  "受": ["愛", "妥", "采", "授"],
  "払": ["拡", "広", "私", "抜"],
  "渡": ["度", "波", "済", "液"],
  "返": ["反", "友", "及", "近"],
  "変": ["恋", "亦", "蛮", "赤"],
  "信": ["言", "伸", "倍", "任"],
  "直": ["真", "具", "植", "省"],
  "面": ["首", "画", "自", "百"],
  "向": ["回", "同", "局", "周"],
  "容": ["客", "谷", "溶", "空"],
  "現": ["見", "視", "規", "理"],
  "象": ["像", "家", "豪", "免"]
};

function getConfusableKanji(targetChar, targetKanji, allKanji) {
  const distractors = new Set();

  // ULTRA-HARD REVERSE MODE: Make ALL 4 kanji look equally plausible

  // 1. Curated confusable list (best quality)
  if (CONFUSABLE_KANJI[targetChar]) {
    for (const c of CONFUSABLE_KANJI[targetChar]) {
      if (c !== targetChar && !distractors.has(c)) {
        distractors.add(c);
        if (distractors.size >= 3) break;
      }
    }
  }

  // 2. Same radical kanji (visually similar structure)
  if (distractors.size < 3 && targetKanji) {
    const rad = targetKanji.radical || (targetKanji.radicalInfo && targetKanji.radicalInfo.character);
    if (rad) {
      const radicalKanji = allKanji.filter(other => {
        if (other.char === targetChar) return false;
        const oRad = other.radical || (other.radicalInfo && other.radicalInfo.character);
        return oRad === rad;
      }).sort((a, b) => Math.abs((a.strokes || 0) - (targetKanji.strokes || 0)) -
                       Math.abs((b.strokes || 0) - (targetKanji.strokes || 0)));

      for (const other of shuffle(radicalKanji)) {
        if (distractors.size >= 3) break;
        if (!distractors.has(other.char)) distractors.add(other.char);
      }
    }
  }

  // 3. Same stroke count kanji (±1) - visually similar complexity
  if (distractors.size < 3 && targetKanji) {
    const strokeSimilar = allKanji.filter(other => {
      if (other.char === targetChar) return false;
      if (distractors.has(other.char)) return false;
      return Math.abs((other.strokes || 0) - (targetKanji.strokes || 0)) <= 1;
    });

    for (const other of shuffle(strokeSimilar)) {
      if (distractors.size >= 3) break;
      distractors.add(other.char);
    }
  }

  // 4. Same JLPT level + similar categories (semantic confusion)
  if (distractors.size < 3 && targetKanji) {
    const sameLevelSimilar = allKanji.filter(other => {
      if (other.char === targetChar || distractors.has(other.char)) return false;
      if (other.level !== targetKanji.level) return false;
      // Check category overlap
      const cats = targetKanji.categories || [];
      const oCats = other.categories || [];
      return cats.some(c => oCats.includes(c));
    });

    for (const other of shuffle(sameLevelSimilar)) {
      if (distractors.size >= 3) break;
      distractors.add(other.char);
    }
  }

  // 5. Similar phonetic reading kanji (homophones with different meaning)
  if (distractors.size < 3 && targetKanji) {
    const targetReading = (targetKanji.kun && targetKanji.kun[0]) || (targetKanji.on && targetKanji.on[0]) || '';
    const targetHira = kataToHira(cleanReading(targetReading));

    const phoneticSimilar = allKanji.filter(other => {
      if (other.char === targetChar || distractors.has(other.char)) return false;
      const oReading = (other.kun && other.kun[0]) || (other.on && other.on[0]) || '';
      const oHira = kataToHira(cleanReading(oReading));
      return oHira && targetHira && oHira === targetHira;
    });

    for (const other of shuffle(phoneticSimilar)) {
      if (distractors.size >= 3) break;
      distractors.add(other.char);
    }
  }

  // 6. Visually similar components (same left/right components)
  if (distractors.size < 3 && targetKanji) {
    const targetComponents = targetKanji.components || [];
    if (targetComponents.length > 0) {
      const componentSimilar = allKanji.filter(other => {
        if (other.char === targetChar || distractors.has(other.char)) return false;
        const oComps = other.components || [];
        // Share at least one component
        return targetComponents.some(comp => oComps.includes(comp));
      });

      for (const other of shuffle(componentSimilar)) {
        if (distractors.size >= 3) break;
        distractors.add(other.char);
      }
    }
  }

  // 7. Fallback: random same level kanji
  if (distractors.size < 3 && targetKanji) {
    const fallbacks = allKanji.filter(other =>
      other.char !== targetChar &&
      !distractors.has(other.char) &&
      other.level === targetKanji.level
    );

    for (const other of shuffle(fallbacks)) {
      if (distractors.size >= 3) break;
      distractors.add(other.char);
    }
  }

  return Array.from(distractors).slice(0, 3);
}

const RENDAKU_INITIAL_MAP = {
  "か": "が", "き": "ぎ", "く": "ぐ", "け": "げ", "こ": "ご",
  "さ": "ざ", "し": "じ", "す": "ず", "せ": "ぜ", "そ": "ぞ",
  "た": "だ", "ち": "ぢ", "つ": "づ", "て": "で", "と": "ど",
  "は": "ば", "ひ": "び", "ふ": "ぶ", "へ": "べ", "ほ": "ぼ",
};

const HANDAKU_INITIAL_MAP = {
  "は": "ぱ", "ひ": "ぴ", "ふ": "ぷ", "へ": "ぺ", "ほ": "ぽ",
};

function getReadingVariants(base) {
  const vars = new Set([base]);
  if (!base) return [];
  if (RENDAKU_INITIAL_MAP[base[0]]) vars.add(RENDAKU_INITIAL_MAP[base[0]] + base.slice(1));
  if (HANDAKU_INITIAL_MAP[base[0]]) vars.add(HANDAKU_INITIAL_MAP[base[0]] + base.slice(1));
  if (base.length >= 2 && "ちつくき".includes(base[base.length - 1])) {
    const s = base.slice(0, -1) + "っ";
    vars.add(s);
    if (RENDAKU_INITIAL_MAP[s[0]]) vars.add(RENDAKU_INITIAL_MAP[s[0]] + s.slice(1));
    if (HANDAKU_INITIAL_MAP[s[0]]) vars.add(HANDAKU_INITIAL_MAP[s[0]] + s.slice(1));
  }
  if (base === "く") {
    vars.add("き");
    vars.add("こ");
  }
  return Array.from(vars);
}

let cachedVocabReadingMap = null;
function getVocabReadingMap() {
  if (cachedVocabReadingMap) return cachedVocabReadingMap;
  cachedVocabReadingMap = new Map();
  if (typeof VOCAB === "object" && VOCAB) {
    for (const v of Object.values(VOCAB)) {
      if (v && v.word && v.reading) {
        cachedVocabReadingMap.set(v.word, kataToHira(v.reading.trim()));
      }
    }
  }
  return cachedVocabReadingMap;
}

function buildKanjiReadingCandidates(k) {
  const list = [];
  for (const r of (k.on || [])) {
    const full = kataToHira(cleanReading(r));
    if (full) list.push({ answer: full, stem: full, okuri: "", type: "on" });
  }
  for (const r of (k.kun || [])) {
    const clean = r.replace(/^-|-$/g, "").trim();
    const parts = clean.split(".");
    const stem = kataToHira(parts[0] || "");
    const okuri = kataToHira(parts.slice(1).join(""));
    const full = kataToHira(cleanReading(r));
    if (full) list.push({ answer: full, stem: stem || full, okuri, type: "kun" });
  }
  return list;
}

function getAllValidReadingsForKanji(k) {
  const set = new Set();
  if (!k) return set;
  for (const c of buildKanjiReadingCandidates(k)) {
    set.add(c.answer);
    set.add(c.stem);
    for (const v of getReadingVariants(c.stem)) set.add(v);
    for (const v of getReadingVariants(c.answer)) set.add(v);
  }
  if (k.example && k.example.reading) {
    set.add(kataToHira(cleanReading(k.example.reading)));
  }
  return set;
}

function resolveQuizContextForKanji(k) {
  const candidates = buildKanjiReadingCandidates(k);
  const rawExamples = (k.examples || []).filter((e) => e && e.japanese && e.japanese.includes(k.char));
  const countOccurrences = (str, ch) => str.split(ch).length - 1;
  // Prefer sentences where the target kanji appears only once to avoid visual ambiguity
  const examples = [
    ...rawExamples.filter((e) => countOccurrences(e.japanese, k.char) === 1),
    ...rawExamples.filter((e) => countOccurrences(e.japanese, k.char) > 1),
  ];

  const makeResult = (ex, surface, readingTargetInSurface, answer, reverseInline) => {
    const underlinedSurface = surface.replace(readingTargetInSurface, `<u>${readingTargetInSurface}</u>`);
    const reverseSurface = surface.replace(k.char, `<u>${reverseInline}</u>`);
    return {
      ex,
      answer,
      sentencePromptReading: ex.japanese.replace(surface, underlinedSurface),
      sentencePromptReverse: ex.japanese.replace(surface, reverseSurface),
      sentencePromptMeaning: ex.japanese.replace(surface, surface.replace(k.char, `<u>${k.char}</u>`)),
      sentenceBn: ex.meaningBn || ex.meaningEn || "",
      verified: true,
    };
  };

  // Pass 1 & 2: Match <ruby>SURFACE<rt>RT</rt></ruby> (Pass 1 = exact stem, Pass 2 = rendaku/sokuon variant)
  for (const allowVariants of [false, true]) {
    for (const ex of examples) {
      const re = /<ruby>([^<]*?)<rt>([^<]*?)<\/rt><\/ruby>/g;
      let m;
      while ((m = re.exec(ex.ruby || "")) !== null) {
        const surface = m[1];
        const rtHira = kataToHira(m[2].trim());
        if (!surface.includes(k.char) || !rtHira) continue;
        const afterRuby = (ex.ruby || "").slice(m.index + m[0].length);

        if (surface === k.char) {
          const matching = candidates.filter((c) =>
            allowVariants ? getReadingVariants(c.stem).includes(rtHira) : c.stem === rtHira
          );
          if (matching.length > 0) {
            const withOkuri = matching.find((c) => c.okuri && afterRuby.startsWith(c.okuri));
            const exactNoOkuri = matching.find((c) => !c.okuri && c.answer === rtHira);
            const chosen = withOkuri || exactNoOkuri || matching[0];
            if (withOkuri && ex.japanese.includes(k.char + chosen.okuri)) {
              const fullWord = k.char + chosen.okuri;
              return makeResult(ex, fullWord, fullWord, chosen.answer, rtHira);
            }
            return makeResult(ex, surface, k.char, chosen.answer, rtHira);
          }
        } else {
          const idx = surface.indexOf(k.char);
          const isPrefix = idx === 0;
          const isSuffix = idx === surface.length - 1;
          const sorted = [...candidates].sort((a, b) => {
            if (a.type !== b.type) return a.type === "on" ? -1 : 1;
            return b.stem.length - a.stem.length;
          });
          for (const c of sorted) {
            const vars = allowVariants ? getReadingVariants(c.stem) : [c.stem];
            for (const v of vars) {
              if (
                (isPrefix && rtHira.startsWith(v)) ||
                (isSuffix && rtHira.endsWith(v)) ||
                (!isPrefix && !isSuffix && rtHira.includes(v))
              ) {
                const ans = c.type === "on" ? c.answer : c.stem;
                return makeResult(ex, surface, k.char, ans, v);
              }
            }
          }
        }
      }
    }
  }

  // Pass 3: Jukujikun <ruby> match (underline whole compound surface, e.g. 田舎 -> いなか)
  for (const ex of examples) {
    const re = /<ruby>([^<]*?)<rt>([^<]*?)<\/rt><\/ruby>/g;
    let m;
    while ((m = re.exec(ex.ruby || "")) !== null) {
      const surface = m[1];
      const rtHira = kataToHira(m[2].trim());
      if (surface.includes(k.char) && rtHira) {
        return makeResult(ex, surface, surface, rtHira, rtHira);
      }
    }
  }

  // Pass 4: Sentences without <ruby> tags around k.char
  if (examples.length > 0) {
    const ex = examples[0];
    const jp = ex.japanese;
    const pos = jp.indexOf(k.char);
    const isKanjiChar = (ch) => ch && ch.charCodeAt(0) >= 0x4e00 && ch.charCodeAt(0) <= 0x9faf;
    let start = pos;
    let end = pos + 1;
    while (start > 0 && isKanjiChar(jp[start - 1])) start--;
    while (end < jp.length && isKanjiChar(jp[end])) end++;
    const run = jp.slice(start, end);

    const vocabByWord = getVocabReadingMap();
    let wordReading = vocabByWord.get(run);
    let matchedWord = run;
    if (!wordReading && k.example && k.example.word && jp.includes(k.example.word)) {
      matchedWord = k.example.word;
      wordReading = kataToHira(k.example.reading);
    }
    if (!wordReading && run.length > 2) {
      for (let i = Math.max(0, pos - start - 1); i <= pos - start && i + 2 <= run.length; i++) {
        const sub = run.slice(i, i + 2);
        if (vocabByWord.has(sub)) {
          matchedWord = sub;
          wordReading = vocabByWord.get(sub);
          break;
        }
      }
    }

    if (wordReading) {
      const idx = matchedWord.indexOf(k.char);
      const isPrefix = idx === 0;
      const isSuffix = idx === matchedWord.length - 1;
      const sorted = [...candidates].sort((a, b) => {
        if (a.type !== b.type) return a.type === "on" ? -1 : 1;
        return b.stem.length - a.stem.length;
      });
      for (const c of sorted) {
        for (const v of getReadingVariants(c.stem)) {
          if ((isPrefix && wordReading.startsWith(v)) || (isSuffix && wordReading.endsWith(v)) || wordReading.includes(v)) {
            const ans = matchedWord.length > 1 ? (c.type === "on" ? c.answer : c.stem) : c.answer;
            return makeResult(ex, matchedWord, k.char, ans, v);
          }
        }
      }
      return makeResult(ex, matchedWord, matchedWord, wordReading, wordReading);
    }

    if (run.length > 1 && k.on && k.on[0]) {
      const onAns = kataToHira(cleanReading(k.on[0]));
      return makeResult(ex, run, k.char, onAns, onAns);
    }

    const afterChar = jp.slice(pos + 1);
    const kunCandidates = candidates.filter((c) => c.type === "kun");
    const okuriMatched = kunCandidates.find((c) => c.okuri && afterChar.startsWith(c.okuri));
    const chosenKun = okuriMatched || kunCandidates[0] || candidates[0];
    if (chosenKun) {
      return makeResult(ex, k.char, k.char, chosenKun.answer, chosenKun.stem);
    }
  }

  // Pass 5: Fallback when kanji has no example sentences
  const rawFallback = (k.kun && k.kun[0]) || (k.on && k.on[0]) || (k.example && k.example.reading) || "";
  const fallbackAns = kataToHira(cleanReading(rawFallback)) || k.char;
  return {
    ex: null,
    answer: fallbackAns,
    sentencePromptReading: "",
    sentencePromptReverse: "",
    sentencePromptMeaning: "",
    sentenceBn: "",
    verified: false,
  };
}

function generateReadingDistractors(answer, kanji, pool) {
  const distractors = new Set();
  const ans = kataToHira(cleanReading(answer));
  if (!ans) return [];

  const allKanjiPool = pool || KANJI;
  // Never put another valid reading (or stem/rendaku variant) of the SAME kanji as a wrong distractor!
  const forbidden = getAllValidReadingsForKanji(kanji);
  forbidden.add(ans);
  const canUse = (cand) => Boolean(cand && !forbidden.has(cand) && !distractors.has(cand));

  // 1. Readings of visually confusable kanji (Real JLPT style: e.g. 車 vs 東/連)
  if (CONFUSABLE_KANJI[kanji.char]) {
    for (const confChar of shuffle(CONFUSABLE_KANJI[kanji.char])) {
      if (distractors.size >= 3) break;
      const confK = byChar[confChar];
      if (!confK) continue;
      const confReadings = [
        ...(confK.on || []),
        ...(confK.kun || []),
      ].map((r) => kataToHira(cleanReading(r))).filter(canUse);
      if (confReadings.length > 0) {
        distractors.add(confReadings[0]);
      }
    }
  }

  // 2. Dakuon / Handakuon swap (Tenten / Maru) - Visual phonetic confusion
  if (distractors.size < 3) {
    const chars = ans.split("");
    const dakuonOptions = [];
    for (let i = 0; i < chars.length; i++) {
      if (DAKUON_MAP[chars[i]]) {
        const copy = [...chars];
        copy[i] = DAKUON_MAP[chars[i]];
        dakuonOptions.push(copy.join(""));
      }
    }
    for (const opt of shuffle(dakuonOptions)) {
      if (distractors.size >= 3) break;
      if (canUse(opt)) distractors.add(opt);
    }
  }

  // 3. Chōon (long vowel) variations - Extends/shortens
  if (distractors.size < 3) {
    const choonVariants = [];
    if (ans.includes("う") && ans.length > 2) {
      choonVariants.push(ans.replace(/う/g, ""));
    }
    if (ans.includes("い") && ans.length > 2) {
      choonVariants.push(ans.replace(/い/g, ""));
    }
    if (ans.length >= 2) {
      const lastChar = ans[ans.length - 1];
      const longVowelMap = { "あ": "ああ", "い": "いい", "う": "うう", "え": "ええ", "お": "おお" };
      if (longVowelMap[lastChar]) {
        choonVariants.push(ans.slice(0, -1) + longVowelMap[lastChar]);
      }
    }
    for (const variant of shuffle(choonVariants)) {
      if (distractors.size >= 3) break;
      if (canUse(variant)) distractors.add(variant);
    }
  }

  // 4. Sokuon (っ) variations - Makes it look like small tsu confusion
  if (distractors.size < 3) {
    const sokuonVariants = [];
    if (ans.includes("っ")) {
      sokuonVariants.push(ans.replace(/っ/g, ""));
    } else if (ans.length >= 2) {
      for (let i = 1; i < ans.length; i++) {
        sokuonVariants.push(ans.slice(0, i) + "っ" + ans.slice(i));
        if (sokuonVariants.length >= 3) break;
      }
    }
    for (const variant of shuffle(sokuonVariants)) {
      if (distractors.size >= 3) break;
      if (canUse(variant)) distractors.add(variant);
    }
  }

  // 5. Look-alike Hiragana - Visual confusion (ひ/ほ/ふ, と/ど/つ)
  if (distractors.size < 3) {
    const chars = ans.split("");
    const visualVariants = [];
    for (let i = 0; i < chars.length; i++) {
      const sim = HIRAGANA_SIMILAR[chars[i]];
      if (sim) {
        for (const replacement of sim) {
          const copy = [...chars];
          copy[i] = replacement;
          visualVariants.push(copy.join(""));
          if (visualVariants.length >= 10) break;
        }
      }
      if (visualVariants.length >= 10) break;
    }
    for (const variant of shuffle(visualVariants)) {
      if (distractors.size >= 3) break;
      if (canUse(variant)) distractors.add(variant);
    }
  }

  // 6. Same kanji pool readings from other kanji at the same level
  if (distractors.size < 3) {
    const sameLevelKanji = allKanjiPool.filter((k) =>
      k.char !== kanji.char && k.level === kanji.level
    );
    const readingVariants = [];
    for (const other of shuffle(sameLevelKanji)) {
      const otherReading = kataToHira(cleanReading(
        (other.kun && other.kun[0]) || (other.on && other.on[0]) || ""
      ));
      if (canUse(otherReading)) {
        readingVariants.push(otherReading);
      }
      if (readingVariants.length >= 20) break;
    }
    for (const variant of shuffle(readingVariants)) {
      if (distractors.size >= 3) break;
      if (canUse(variant)) distractors.add(variant);
    }
  }

  return Array.from(distractors).slice(0, 3);
}

function generateMeaningDistractors(targetKanji, pool) {
  const distractors = new Set();
  const correct = primaryMeaning(targetKanji);
  if (!correct) return [];

  const allKanjiPool = pool || KANJI;

  // ULTRA-HARD MEANING DISTRACTORS: Make all 4 options look equally plausible

  // 1. Same semantic category + similar meaning (most confusing)
  const cats = targetKanji.categories || [];
  if (cats.length && allKanjiPool) {
    const sameCat = allKanjiPool.filter((k) => {
      if (k.char === targetKanji.char) return false;
      const kCats = k.categories || [];
      return kCats.some((c) => cats.includes(c));
    });
    // Sort by semantic similarity (prefer kanji with overlapping vocabulary)
    const scored = sameCat.map(k => ({
      kanji: k,
      score: (k.vocabIds || []).filter(id => (targetKanji.vocabIds || []).includes(id)).length
    })).sort((a, b) => b.score - a.score);

    for (const {kanji: other} of shuffle(scored.slice(0, 20))) {
      if (distractors.size >= 3) break;
      const m = primaryMeaning(other);
      if (m && m !== correct && !distractors.has(m)) {
        distractors.add(m);
      }
    }
  }

  // 2. Homophone/phonetic similarity - Same reading, different meaning (JLPT favorite trap!)
  if (distractors.size < 3) {
    const targetReading = (targetKanji.kun && targetKanji.kun[0]) || (targetKanji.on && targetKanji.on[0]) || '';
    const targetHira = kataToHira(cleanReading(targetReading));

    const phoneticSimilar = allKanjiPool.filter(k => {
      if (k.char === targetKanji.char) return false;
      const kReading = (k.kun && k.kun[0]) || (k.on && k.on[0]) || '';
      const kHira = kataToHira(cleanReading(kReading));
      // Same or similar reading
      return kHira && targetHira && (kHira === targetHira ||
        Math.abs(kHira.length - targetHira.length) <= 1);
    });

    for (const other of shuffle(phoneticSimilar.slice(0, 20))) {
      if (distractors.size >= 3) break;
      const m = primaryMeaning(other);
      if (m && m !== correct && !distractors.has(m)) {
        distractors.add(m);
      }
    }
  }

  // 3. Same radical/structural similarity (look-alike kanji)
  if (distractors.size < 3) {
    const radical = targetKanji.radical || (targetKanji.radicalInfo && targetKanji.radicalInfo.character);
    if (radical) {
      const radicalSimilar = allKanjiPool.filter(k => {
        if (k.char === targetKanji.char) return false;
        const kRad = k.radical || (k.radicalInfo && k.radicalInfo.character);
        return kRad === radical;
      });
      for (const other of shuffle(radicalSimilar)) {
        if (distractors.size >= 3) break;
        const m = primaryMeaning(other);
        if (m && m !== correct && !distractors.has(m)) {
          distractors.add(m);
        }
      }
    }
  }

  // 4. Same stroke count (±1) - Visually similar complexity
  if (distractors.size < 3) {
    const strokeSimilar = allKanjiPool.filter(k => {
      if (k.char === targetKanji.char) return false;
      const diff = Math.abs((k.strokes || 0) - (targetKanji.strokes || 0));
      return diff <= 1;
    });
    for (const other of shuffle(strokeSimilar)) {
      if (distractors.size >= 3) break;
      const m = primaryMeaning(other);
      if (m && m !== correct && !distractors.has(m)) {
        distractors.add(m);
      }
    }
  }

  // 5. Same JLPT level but from different categories (broad distractors)
  if (distractors.size < 3 && allKanjiPool) {
    const sameLevel = allKanjiPool.filter(k =>
      k.char !== targetKanji.char && k.level === targetKanji.level
    );
    for (const other of shuffle(sameLevel)) {
      if (distractors.size >= 3) break;
      const m = primaryMeaning(other);
      if (m && m !== correct && !distractors.has(m)) {
        distractors.add(m);
      }
    }
  }

  // 6. Cross-level distractors - N4 kanji in N5 quiz etc.
  if (distractors.size < 3) {
    const crossLevel = allKanjiPool.filter(k => {
      if (k.char === targetKanji.char) return false;
      const levelDiff = Math.abs(
        ['N5', 'N4', 'N3', 'N2', 'N1'].indexOf(k.level) -
        ['N5', 'N4', 'N3', 'N2', 'N1'].indexOf(targetKanji.level)
      );
      return levelDiff <= 1; // Adjacent levels
    });
    for (const other of shuffle(crossLevel)) {
      if (distractors.size >= 3) break;
      const m = primaryMeaning(other);
      if (m && m !== correct && !distractors.has(m)) {
        distractors.add(m);
      }
    }
  }

  // 7. Semantic opposites + near-synonyms (intentional confusion)
  if (distractors.size < 3 && targetKanji.examples && targetKanji.examples.length > 0) {
    // Look for kanji that often appear together in similar contexts
    const exampleWords = targetKanji.examples
      .flatMap(e => (e.japanese || '').split('').filter(c => c.charCodeAt(0) >= 0x4e00 && c.charCodeAt(0) <= 0x9faf));
    const coOccurringKanji = allKanjiPool.filter(k => {
      if (k.char === targetKanji.char) return false;
      return exampleWords.includes(k.char);
    });
    for (const other of shuffle(coOccurringKanji)) {
      if (distractors.size >= 3) break;
      const m = primaryMeaning(other);
      if (m && m !== correct && !distractors.has(m)) {
        distractors.add(m);
      }
    }
  }

  // 8. Final fallback - ensure we always have 3 distractors
  if (distractors.size < 3 && allKanjiPool) {
    for (const other of shuffle(allKanjiPool)) {
      if (distractors.size >= 3) break;
      if (other.char === targetKanji.char) continue;
      const m = primaryMeaning(other);
      if (m && m !== correct && !distractors.has(m)) {
        distractors.add(m);
      }
    }
  }

  return Array.from(distractors).slice(0, 3);
}

function startQuiz(level = quizLevel, mode = quizMode, category = quizCategory, customPool = null) {
  clearTimeout(quizTimer);
  clearInterval(mockInterval);
  quizLevel = level;
  quizMode = mode;
  quizCategory = category;
  currentView = "quiz";

  let pool = customPool;
  if (!pool || !pool.length) {
    pool = KANJI.filter((k) => (level === "all" || k.level === level) && (category === "all" || (k.categories || []).includes(category)));
    if (pool.length < 4) {
      pool = KANJI.filter((k) => level === "all" || k.level === level);
    }
  }

  const questionCount = mode === "mock" ? 25 : 10;
  pool = shuffle(pool).slice(0, questionCount);
  if (!pool.length) return;

  const questions = pool.map((k, idx) => {
    let answer = "";
    let promptText = "";
    let promptEn = "";
    let tts = "";
    let sentencePrompt = "";
    let sentenceBn = "";
    let mondaiType = "";
    let distractors = [];

    // Distribute question types in mock mode (Mondai 1, Mondai 2, and Meaning/Vocab)
    let effectiveMode = mode;
    if (mode === "mock") {
      if (idx < 10) effectiveMode = "reading";
      else if (idx < 18) effectiveMode = "reverse";
      else effectiveMode = "meaning";
    }

    // Resolve context-accurate reading and underlined sentence prompts
    const ctx = resolveQuizContextForKanji(k);

    if (effectiveMode === "reverse") {
      answer = k.char;
      mondaiType = "問題２ · 表記";
      promptText = primaryMeaning(k);
      promptEn = secondaryMeaning(k);
      if (ctx.sentencePromptReverse) {
        sentencePrompt = ctx.sentencePromptReverse;
        sentenceBn = ctx.sentenceBn;
      }
      distractors = getConfusableKanji(k.char, k, KANJI);
    } else if (effectiveMode === "reading") {
      mondaiType = "問題１ · 漢字読み";
      answer = ctx.answer || k.char;
      promptText = k.char;
      if (ctx.sentencePromptReading) {
        sentencePrompt = ctx.sentencePromptReading;
        sentenceBn = ctx.sentenceBn;
      }
      distractors = generateReadingDistractors(answer, k, KANJI);
    } else if (effectiveMode === "listening") {
      mondaiType = "聴解 · Listening";
      answer = primaryMeaning(k);
      tts = (k.kunTts && k.kunTts[0]) || (k.kun && k.kun[0] ? cleanReading(k.kun[0]) : "") || (k.onTts && k.onTts[0]) || (k.on && k.on[0] ? cleanReading(k.on[0]) : "") || k.char;
      distractors = generateMeaningDistractors(k, KANJI);
    } else {
      // meaning
      mondaiType = "意味 · Meaning";
      answer = primaryMeaning(k);
      promptText = k.char;
      if (ctx.sentencePromptMeaning) {
        sentencePrompt = ctx.sentencePromptMeaning;
        sentenceBn = ctx.sentenceBn;
      }
      distractors = generateMeaningDistractors(k, KANJI);
    }

    // Safety fallback: ensure exactly 3 distinct distractors
    const finalDistractors = [];
    const seen = effectiveMode === "reading" ? getAllValidReadingsForKanji(k) : new Set([answer]);
    seen.add(answer);
    for (const d of distractors) {
      if (d && !seen.has(d)) {
        seen.add(d);
        finalDistractors.push(d);
        if (finalDistractors.length === 3) break;
      }
    }
    if (finalDistractors.length < 3) {
      for (const other of shuffle(KANJI)) {
        if (finalDistractors.length === 3) break;
        let cand = "";
        if (effectiveMode === "reverse") cand = other.char;
        else if (effectiveMode === "reading") cand = kataToHira(cleanReading((other.kun && other.kun[0]) || (other.on && other.on[0]) || ""));
        else cand = primaryMeaning(other);
        if (cand && !seen.has(cand)) {
          seen.add(cand);
          finalDistractors.push(cand);
        }
      }
    }

    const acceptedAnswers = effectiveMode === "reading"
      ? Array.from(new Set([answer, ...(!ctx.verified ? getAllValidReadingsForKanji(k) : [])]))
      : [answer];

    return {
      char: k.char,
      answer,
      acceptedAnswers,
      meaning: primaryMeaning(k),
      meaningEn: secondaryMeaning(k),
      promptText,
      promptEn,
      sentencePrompt,
      sentenceBn,
      mondaiType,
      tts,
      level: k.level,
      strokes: k.strokes,
      options: shuffle([answer, ...finalDistractors]),
    };
  });

  quiz = {
    active: true,
    done: false,
    level,
    mode,
    category,
    questions,
    index: 0,
    score: 0,
    selected: null,
    answers: [],
    timeLeft: mode === "mock" ? 25 * 60 : null,
  };

  if (mode === "mock") {
    clearInterval(mockInterval);
    mockInterval = setInterval(() => {
      if (!quiz || !quiz.active || quiz.mode !== "mock") {
        clearInterval(mockInterval);
        return;
      }
      quiz.timeLeft -= 1;
      const el = document.getElementById("mock-timer-display");
      if (el) el.textContent = `⏱ ${formatMockTime(quiz.timeLeft)}`;
      if (quiz.timeLeft <= 0) {
        clearInterval(mockInterval);
        finishMockExam();
      }
    }, 1000);
  }

  render(true);
  window.scrollTo(0, 0);

  if (mode === "listening" && questions[0] && questions[0].tts) {
    setTimeout(() => speakJapanese(questions[0].tts), 350);
  }
}

function answerQuestion(selected) {
  if (!quiz || !quiz.active || quiz.selected !== null) return;
  const q = quiz.questions[quiz.index];
  if (!q) return;

  quiz.selected = selected;
  const isRight = selected === q.answer || (Array.isArray(q.acceptedAnswers) && q.acceptedAnswers.includes(selected));
  if (isRight) quiz.score += 1;

  state.quiz.total += 1;
  if (isRight) state.quiz.correct += 1;
  recordStudy();
  recordSrsAnswer(q.char, isRight);

  quiz.answers.push({
    char: q.char,
    meaning: q.meaning,
    meaningEn: q.meaningEn,
    answer: q.answer,
    correct: isRight,
    selected,
  });

  saveState();
  render(false);

  clearTimeout(quizTimer);
  quizTimer = setTimeout(() => {
    if (!quiz || !quiz.active) return;
    quiz.index += 1;
    quiz.selected = null;

    if (quiz.index >= quiz.questions.length) {
      clearInterval(mockInterval);
      quiz.active = false;
      quiz.done = true;
      if (quiz.mode !== "mock") {
        state.best = Math.max(state.best, quiz.score);
      }
      saveState();
      render(true);
      window.scrollTo(0, 0);
    } else {
      render(true);
      const nextQ = quiz.questions[quiz.index];
      if (quiz.mode === "listening" && nextQ && nextQ.tts) {
        setTimeout(() => speakJapanese(nextQ.tts), 300);
      }
    }
  }, 900);
}

function submitFlashcardRating(rating) {
  if (!quiz || !quiz.active || quiz.mode !== "flashcard") return;
  const q = quiz.questions[quiz.index];
  if (!q) return;

  recordStudy();
  if (rating === "again") {
    recordSrsAnswer(q.char, false);
    quiz.answers.push({ char: q.char, meaning: primaryMeaning(q), correct: false, selected: "ভুলে গেছি" });
  } else if (rating === "easy") {
    recordSrsAnswer(q.char, true);
    recordSrsAnswer(q.char, true);
    quiz.score += 1;
    quiz.answers.push({ char: q.char, meaning: primaryMeaning(q), correct: true, selected: "খুব সহজ" });
  } else {
    recordSrsAnswer(q.char, true);
    quiz.score += 1;
    quiz.answers.push({ char: q.char, meaning: primaryMeaning(q), correct: true, selected: "মনে আছে" });
  }

  quiz.index += 1;
  quiz.revealed = false;

  if (quiz.index >= quiz.questions.length) {
    quiz.active = false;
    quiz.done = true;
    state.best = Math.max(state.best, quiz.score);
    saveState();
    render(true);
    window.scrollTo(0, 0);
  } else {
    saveState();
    render(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function finishMockExam() {
  clearInterval(mockInterval);
  clearTimeout(quizTimer);
  if (!quiz || !quiz.active) return;
  quiz.active = false;
  quiz.done = true;
  state.best = Math.max(state.best, quiz.score);
  saveState();
  render(true);
  window.scrollTo(0, 0);
}

function quitQuiz() {
  clearTimeout(quizTimer);
  clearInterval(mockInterval);
  quiz = null;
  render(true);
  snackbar("Quiz ended — no worries", "info");
}

/* ---------- Reset & Shortcuts Dialogs ---------- */

function openShortcutsDialog() {
  const dialog = document.getElementById("shortcuts-dialog");
  if (dialog && !dialog.open) {
    dialog.showModal();
  }
}

function closeShortcutsDialog() {
  const dialog = document.getElementById("shortcuts-dialog");
  if (dialog && dialog.open) {
    dialog.close();
  }
}

function resetProgress() {
  clearTimeout(quizTimer);
  quiz = null;
  closeSheet();
  state = freshState();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  const dialog = document.getElementById("confirm-dialog");
  if (dialog && dialog.open) dialog.close();
  currentView = "home";
  browseFilter = "all";
  searchQuery = "";
  applyDisplayPrefs();
  render(true);
  window.scrollTo(0, 0);
  snackbar("All progress reset", "refresh");
}

/* ---------- Speech ---------- */

function speakJapanese(text) {
  if (!text) return;
  if (!("speechSynthesis" in window)) {
    snackbar("Speech is not available in this browser", "info");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = state.prefs?.audioSlow ? 0.65 : 0.85;
  const voice = speechSynthesis.getVoices().find((item) => item.lang?.toLowerCase().startsWith("ja"));
  if (voice) utterance.voice = voice;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

/* ---------- Actions ---------- */

function focusSearch() {
  requestAnimationFrame(() => {
    const input = document.getElementById("kanji-search");
    if (input) input.focus();
  });
}

function syncChips(action, key, value) {
  document.querySelectorAll(`[data-action="${action}"]`).forEach((chip) => {
    const on = (chip.dataset[key] || "") === value;
    chip.classList.toggle("active", on);
    if (chip.hasAttribute("aria-selected")) chip.setAttribute("aria-selected", on);
    if (chip.hasAttribute("aria-pressed")) chip.setAttribute("aria-pressed", on);
  });
}

function filterWords() {
  const list = filteredWords();
  const shown = list.slice(0, wordsLimit);

  const el = document.getElementById("word-list");
  if (el) el.innerHTML = wordListMarkup(shown);

  const count = document.getElementById("word-count");
  if (count) count.textContent = `${list.length} word${list.length === 1 ? "" : "s"}${wordsQuery.trim() ? " found" : ""}`;

  const remaining = list.length - shown.length;
  const more = document.getElementById("words-more");
  if (more) {
    more.classList.toggle("hidden", remaining <= 0);
    if (remaining > 0) more.textContent = `Show ${Math.min(remaining, 60)} more · ${remaining} left`;
  }

  const empty = document.getElementById("word-empty");
  if (empty) empty.classList.toggle("hidden", list.length !== 0);

  const clear = viewEl.querySelector(".search-clear");
  if (clear) clear.classList.toggle("hidden", !wordsQuery);
}

function handleAction(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  switch (action) {
    case "open-kanji":
      openKanji(target.dataset.char);
      break;
    case "close-sheet":
      closeSheet();
      break;
    case "fav":
      toggleFavorite(target.dataset.char || sheetChar);
      break;
    case "toggle-learned":
      toggleLearned(target.dataset.char || sheetChar);
      break;
    case "hero-learn": {
      const char = target.dataset.char;
      const k = byChar[char];
      if (!k) break;
      const alreadyLearned = state.learned.includes(char);
      if (!alreadyLearned) {
        state.learned = [...state.learned, char];
        recordStudy();
        if (!state.srs) state.srs = {};
        state.srs[char] = {
          stage: 1,
          nextReview: Date.now() + SRS_INTERVALS[1],
          lastReview: Date.now(),
          streak: 1,
        };
      }
      heroOffset += 1;
      saveState();
      render(false);
      const nextK = todayKanji();
      snackbar(`「${char}」শেখা সম্পন্ন! নতুন কাঞ্জি「${nextK.char}」এসেছে ✨`, "check");
      break;
    }
    case "next-daily-kanji": {
      heroOffset += 1;
      refreshHeroCardInPlace();
      setupHeroAutoRotate();
      const nextK = todayKanji();
      snackbar(`নতুন কাঞ্জি: 「${nextK.char}」— ${primaryMeaning(nextK)}`, "refresh");
      break;
    }
    case "toggle-hero-auto": {
      heroAutoRotate = !heroAutoRotate;
      refreshHeroCardInPlace();
      setupHeroAutoRotate();
      snackbar(heroAutoRotate ? "স্বয়ংক্রিয় কাঞ্জি পরিবর্তন চালু হয়েছে (প্রতি ২০ সেকেন্ডে)" : "স্বয়ংক্রিয় কাঞ্জি পরিবর্তন বন্ধ করা হয়েছে", "info");
      break;
    }
    case "toggle-study-level": {
      toggleStudyLevel(target.dataset.level);
      break;
    }
    case "see-all":
      browseFilter = "all";
      searchQuery = "";
      kanjiLimit = 72;
      setView("browse");
      break;
    case "filter-level":
      browseFilter = target.dataset.level;
      searchQuery = "";
      kanjiLimit = 72;
      setView("browse");
      break;
    case "filter": {
      browseFilter = target.dataset.filter;
      kanjiLimit = 72;
      document.querySelectorAll("[data-filter]").forEach((chip) => {
        const active = chip.dataset.filter === browseFilter;
        chip.classList.toggle("active", active);
        chip.setAttribute("aria-selected", active);
      });
      renderKanjiGrid();
      break;
    }
    case "filter-category": {
      browseCategory = target.dataset.category || "all";
      kanjiLimit = 72;
      syncChips("filter-category", "category", browseCategory);
      renderKanjiGrid();
      break;
    }
    case "kanji-more":
      loadMoreKanji();
      break;
    case "clear-search": {
      searchQuery = "";
      kanjiLimit = 72;
      const input = document.getElementById("kanji-search");
      if (input) {
        input.value = "";
        input.focus();
      }
      const clear = viewEl.querySelector(".search-clear");
      if (clear) clear.classList.add("hidden");
      renderKanjiGrid();
      break;
    }
    case "open-search":
      setView("browse");
      focusSearch();
      break;
    case "open-browse":
      setView("browse");
      break;
    case "open-radicals":
      setView("radicals");
      break;
    case "open-words":
      setView("words");
      break;
    case "open-grammar":
      setView("grammar");
      break;
    case "grammar-tab":
      grammarTab = target.dataset.tab || "list";
      render(false);
      break;
    case "grammar-level":
      grammarLevel = target.dataset.level || "all";
      render(false);
      break;
    case "clear-grammar-search":
      grammarQuery = "";
      render(false);
      break;
    case "open-reader":
      setView("reader");
      break;
    case "reader-sample": {
      const sId = target.dataset.sample;
      if (sId === "1") readerInputText = "私は毎朝七時に起きて、朝ご飯を食べます。";
      else if (sId === "2") readerInputText = "日本へ行ったことがありますから、案内することができます。";
      else readerInputText = "環境問題に関しては、人によって様々な考え方があります。";
      analyzeReaderText();
      render(false);
      break;
    }
    case "reader-analyze": {
      const ta = document.getElementById("reader-textarea");
      if (ta) readerInputText = ta.value;
      analyzeReaderText();
      render(false);
      break;
    }
    case "open-printable":
      setView("printable");
      break;
    case "printable-level":
      printableLevel = target.dataset.level || "target";
      printablePage = 0;
      render(false);
      break;
    case "printable-page-prev":
      if (printablePage > 0) {
        printablePage--;
        render(false);
      }
      break;
    case "printable-page-next":
      printablePage++;
      render(false);
      break;
    case "printable-per-page": {
      const cnt = parseInt(target.dataset.count, 10);
      if ([2, 3, 4, 5, 6].includes(cnt)) {
        printablePerPage = cnt;
        printablePage = 0;
        render(false);
      }
      break;
    }
    case "printable-mode":
      printableStyleMode = target.dataset.mode || "school";
      render(false);
      break;
    case "printable-meaning-toggle":
      printableShowMeaning = !printableShowMeaning;
      render(false);
      break;
    case "printable-custom-apply": {
      const inp = document.getElementById("printable-custom-input");
      const rawText = inp ? inp.value.trim() : "";
      if (rawText) {
        const kanjiOnly = typeof extractKanjiOnly === "function"
          ? extractKanjiOnly(rawText)
          : Array.from(rawText).filter((ch) => /[\u4e00-\u9faf]/.test(ch));

        if (kanjiOnly.length === 0) {
          snackbar("কোনো কাঞ্জি পাওয়া যায়নি! (হিরাগানা/কাতাকানা বা রোমাজি ছাড়া কাঞ্জি লিখুন বা পেস্ট করুন)", "info");
          break;
        }

        // Cleaned string containing only extracted unique kanji
        printableCustomChars = kanjiOnly.join("");
        printableLevel = "custom";
        printablePage = 0;
        render(false);

        const matched = getPrintableKanjiPool();
        const nonDbCount = kanjiOnly.length - matched.length;
        if (matched.length > 0) {
          const msg = nonDbCount > 0
            ? `ফিল্টার করে ${matched.length}টি কাঞ্জি শিটে নেওয়া হয়েছে (${nonDbCount}টি ডাটাবেসের বাইরে বাদ পড়েছে)`
            : `টেক্সট থেকে ${matched.length}টি কাঞ্জি বের করে প্র্যাকটিস শিট তৈরি হয়েছে!`;
          snackbar(msg, "check");
        } else {
          snackbar("কাঞ্জিগুলো আমাদের JLPT N5–N1 ডাটাবেসে পাওয়া যায়নি", "info");
        }
      } else {
        snackbar("অনুগ্রহ করে টেক্সট বা কাঞ্জি পেস্ট করুন (যেমন: 私は日本語を勉強します)", "info");
      }
      break;
    }
    case "download-printable-sheet":
      downloadSchoolWorksheetCanvas();
      break;
    case "window-print":
      triggerPrintablePrint();
      break;
    case "mock-submit":
      if (confirm("আপনি কি এখনই পরীক্ষা সমাপ্ত করে JLPT স্কোরকার্ড দেখতে চান?")) {
        finishMockExam();
      }
      break;
    case "clear-word-search": {
      wordsQuery = "";
      const input = document.getElementById("word-search");
      if (input) {
        input.value = "";
        input.focus();
      }
      filterWords();
      break;
    }
    case "word-topic":
      wordsTopic = target.dataset.topic || "all";
      wordsLimit = 60;
      syncChips("word-topic", "topic", wordsTopic);
      filterWords();
      break;
    case "word-pos":
      wordsPos = target.dataset.pos || "all";
      wordsLimit = 60;
      syncChips("word-pos", "pos", wordsPos);
      filterWords();
      break;
    case "word-level":
      wordsLevel = target.dataset.level || "all";
      wordsLimit = 60;
      syncChips("word-level", "level", wordsLevel);
      filterWords();
      break;
    case "words-more":
      wordsLimit += 60;
      filterWords();
      break;
    case "clear-radical-search":
      clearRadicalSearch();
      break;
    case "open-profile":
      setView("profile");
      break;
    case "open-settings":
      setView("settings");
      break;
    case "toggle-pref":
      togglePref(target.dataset.pref);
      break;
    case "reset-prefs":
      resetPrefs();
      break;
    case "stage-mode-watch":
      setStageMode("watch");
      break;
    case "stage-mode-draw":
      setStageMode("draw");
      break;
    case "stroke-replay":
      strokeReplay();
      break;
    case "stroke-prev":
      strokeStep(-1);
      break;
    case "stroke-next":
      strokeStep(1);
      break;
    case "stroke-play":
      strokePlay();
      break;
    case "stroke-toggle-numbers":
      strokeToggleNumbers();
      break;
    case "canvas-clear":
      clearPracticeCanvas();
      break;
    case "canvas-toggle-guide":
      togglePracticeGuide();
      break;
    case "start-srs-review":
      startSrsReview();
      break;
    case "srs-start": {
      const char = target.dataset.char || sheetChar;
      if (!state.learned.includes(char)) {
        state.learned.push(char);
      }
      if (!state.srs) state.srs = {};
      state.srs[char] = {
        stage: 1,
        nextReview: Date.now() + SRS_INTERVALS[1],
        lastReview: Date.now(),
        streak: 1,
      };
      recordStudy();
      saveState();
      refreshSheet();
      render(false);
      snackbar(`「${char}」বৈজ্ঞানিক SRS চক্রে যুক্ত হয়েছে! প্রথম রিভিশন ৪ ঘণ্টা পর।`, "check");
      break;
    }
    case "srs-reset": {
      const char = target.dataset.char || sheetChar;
      state.learned = state.learned.filter((c) => c !== char);
      if (state.srs) delete state.srs[char];
      saveState();
      refreshSheet();
      render(false);
      snackbar(`「${char}」SRS ডেক থেকে মুছে ফেলা হয়েছে`, "refresh");
      break;
    }
    case "srs-review-single": {
      const char = target.dataset.char || sheetChar;
      const k = byChar[char];
      if (k) {
        closeSheet();
        startQuiz(k.level, "reading", "all", [k]);
      }
      break;
    }
    case "quiz-level":
      quizLevel = target.dataset.level;
      render(false);
      break;
    case "quiz-mode":
      quizMode = target.dataset.mode || "meaning";
      render(false);
      break;
    case "quiz-category":
      quizCategory = target.dataset.category || "all";
      render(false);
      break;
    case "start-quiz":
      startQuiz(quizLevel, quizMode, quizCategory);
      break;
    case "answer":
      answerQuestion(target.dataset.answer);
      break;
    case "flashcard-reveal":
      if (quiz && quiz.active) {
        quiz.revealed = true;
        render(false);
      }
      break;
    case "flashcard-rate": {
      if (!quiz || !quiz.active) break;
      const btn = target.closest("[data-rating]");
      const rating = btn ? btn.dataset.rating : "good";
      submitFlashcardRating(rating);
      break;
    }
    case "speak":
      speakJapanese(target.dataset.text);
      break;
    case "quit-quiz":
      quitQuiz();
      break;
    case "quiz-again":
      startQuiz(quiz ? quiz.level : quizLevel, quiz ? quiz.mode : quizMode, quiz ? quiz.category : quizCategory);
      break;
    case "back-home":
      quiz = null;
      setView("home");
      break;
    case "open-shortcuts":
      openShortcutsDialog();
      break;
    case "close-shortcuts":
      closeShortcutsDialog();
      break;
    case "reset-data": {
      const dialog = document.getElementById("confirm-dialog");
      if (dialog) dialog.showModal();
      break;
    }
    case "close-dialog": {
      const dialog = document.getElementById("confirm-dialog");
      if (dialog && dialog.open) dialog.close();
      break;
    }
    case "confirm-reset":
      resetProgress();
      break;
    case "about":
      snackbar(`A calm, dark kanji trainer for JLPT N5–N3 with ${KANJI.length} kanji and ${RADICALS.length} radicals. Built with plain HTML, CSS and JS.`, "info");
      break;
    case "google-signin": {
      if (!window.firebaseSync) {
        snackbar("ক্লাউড সিঙ্ক লোড হচ্ছে, অনুগ্রহ করে আবার চেষ্টা করুন", "x");
        break;
      }
      snackbar("Google সাইন-ইন উইন্ডো খোলা হচ্ছে...", "cloud");
      window.firebaseSync.signInWithGoogle()
        .then(() => {
          snackbar("Google একাউন্ট দিয়ে সফলভাবে লগইন হয়েছে!", "check");
          updateTopAvatar();
          render(false);
        })
        .catch((err) => {
          console.error("Google signin error", err);
          snackbar(`লগইন ব্যর্থ হয়েছে: ${err.message || "ত্রুটি"}`, "x");
        });
      break;
    }
    case "signout": {
      if (window.firebaseSync) {
        window.firebaseSync.signOut().then(() => {
          snackbar("Google একাউন্ট থেকে সাইন আউট করা হয়েছে", "refresh");
          updateTopAvatar();
          render(false);
        });
      }
      break;
    }
    case "manual-sync": {
      if (window.firebaseSync && window.firebaseSync.currentUser) {
        window.firebaseSync.saveToCloud(state, true);
        snackbar("ক্লাউডের সাথে সকল ডাটা সিঙ্ক করা হচ্ছে...", "cloud");
      }
      break;
    }
    default:
      break;
  }
}

/* ---------- Input & misc events ---------- */

function filterRadicals() {
  const q = radicalQuery.trim().toLowerCase();
  const numeric = /^#?\d+$/.test(q);
  const number = numeric ? String(Number(q.replace("#", ""))) : "";
  let shown = 0;
  document.querySelectorAll("#radical-list .radical-card").forEach((card) => {
    const match = !q
      || (numeric ? card.dataset.number === number : (card.dataset.search || "").includes(q));
    card.classList.toggle("hidden", !match);
    if (match) shown += 1;
  });

  const count = document.getElementById("radical-count");
  if (count) count.textContent = `${shown} radical${shown === 1 ? "" : "s"}${q ? " found" : ""}`;

  const empty = document.getElementById("radical-empty");
  if (empty) empty.classList.toggle("hidden", shown !== 0);

  const clear = viewEl.querySelector(".search-clear");
  if (clear) clear.classList.toggle("hidden", !radicalQuery);
}

function clearRadicalSearch() {
  radicalQuery = "";
  const input = document.getElementById("radical-search");
  if (input) {
    input.value = "";
    input.focus();
  }
  filterRadicals();
}

function analyzeReaderText() {
  if (!readerInputText || !readerInputText.trim()) {
    readerAnalyzedTokens = null;
    return;
  }
  const chars = Array.from(readerInputText);
  let html = "";
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (/[\u4e00-\u9faf]/.test(ch)) {
      const k = byChar[ch];
      if (k) {
        const reading = kataToHira(cleanReading((k.kun && k.kun[0]) || (k.on && k.on[0]) || ""));
        const meaning = escapeHtml(primaryMeaning(k));
        html += `<ruby class="reader-ruby" data-action="open-kanji" data-char="${ch}" title="${ch}: ${meaning}" style="cursor:pointer;padding:0 2px">${ch}<rt style="font-size:12px;color:var(--primary);font-weight:600">${reading}</rt></ruby>`;
      } else {
        html += ch;
      }
    } else {
      if (ch === "\n") html += "<br/>";
      else html += escapeHtml(ch);
    }
  }
  readerAnalyzedTokens = html;
}

function handleInput(event) {
  if (event.target.id === "grammar-search") {
    grammarQuery = event.target.value;
    render(false);
    return;
  }
  if (event.target.id === "reader-textarea") {
    readerInputText = event.target.value;
    return;
  }
  if (event.target.id === "radical-search") {
    radicalQuery = event.target.value;
    filterRadicals();
    return;
  }
  if (event.target.id === "word-search") {
    wordsQuery = event.target.value;
    wordsLimit = 60;
    filterWords();
    return;
  }
  if (event.target.id !== "kanji-search") return;
  searchQuery = event.target.value;
  kanjiLimit = 72;
  const clear = viewEl.querySelector(".search-clear");
  if (clear) clear.classList.toggle("hidden", !searchQuery);
  renderKanjiGrid({ delay: 90 });
}

const RIPPLE_SELECTOR = ".btn, .icon-btn, .nav-item, .chip, .kanji-card, .mini-card, .level-row, .quiz-level, .option, .hero-tap, .setting-row, .radical-entry, .ref-entry, .radical-card, .radical-kanji";

function handleRipple(event) {
  const host = event.target.closest(RIPPLE_SELECTOR);
  if (!host || host.disabled) return;
  const rect = host.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.8;
  const ink = document.createElement("span");
  ink.className = "ripple-ink";
  ink.style.width = `${size}px`;
  ink.style.height = `${size}px`;
  ink.style.left = `${event.clientX - rect.left - size / 2}px`;
  ink.style.top = `${event.clientY - rect.top - size / 2}px`;
  host.appendChild(ink);
  setTimeout(() => ink.remove(), 650);
}

function handleKeydown(event) {
  // Allow native browser shortcuts like Ctrl+R, Ctrl+C, Ctrl+Shift+I
  // Special exception: Ctrl+P / Cmd+P on printable view triggers sheet print
  if (event.ctrlKey || event.metaKey || event.altKey) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p" && currentView === "printable") {
      event.preventDefault();
      triggerPrintablePrint();
    }
    return;
  }

  const inInput = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName) || !!document.activeElement?.isContentEditable;
  const shortcutsDialog = document.getElementById("shortcuts-dialog");
  const confirmDialog = document.getElementById("confirm-dialog");

  // 1. ESCAPE: blurs input, closes modals / sheets, or navigates back
  if (event.key === "Escape") {
    if (inInput) {
      document.activeElement.blur();
      return;
    }
    if (shortcutsDialog && shortcutsDialog.open) {
      closeShortcutsDialog();
      return;
    }
    if (confirmDialog && confirmDialog.open) {
      confirmDialog.close();
      return;
    }
    if (sheetChar) {
      closeSheet();
      return;
    }
    if (quiz && quiz.active) {
      quitQuiz();
      return;
    }
    if (quiz && quiz.done) {
      quiz = null;
      render(true);
      return;
    }
    if (["radicals", "words", "grammar", "reader", "printable"].includes(currentView)) {
      setView("browse");
      return;
    }
    if (currentView === "settings") {
      setView("profile");
      return;
    }
    return;
  }

  // Prevent single-key hotkeys when typing in search or text boxes
  if (inInput) {
    return;
  }

  // 2. SHORTCUTS HELP MODAL: ? or Shift+/
  if (event.key === "?" || (event.shiftKey && event.key === "/")) {
    event.preventDefault();
    if (shortcutsDialog && shortcutsDialog.open) {
      closeShortcutsDialog();
    } else {
      openShortcutsDialog();
    }
    return;
  }

  // 3. SEARCH FOCUS: /
  if (event.key === "/") {
    event.preventDefault();
    if (currentView === "words") {
      const inp = document.getElementById("word-search");
      if (inp) { inp.focus(); return; }
    } else if (currentView === "radicals") {
      const inp = document.getElementById("radical-search");
      if (inp) { inp.focus(); return; }
    } else if (currentView === "printable") {
      const inp = document.getElementById("printable-custom-input");
      if (inp) { inp.focus(); return; }
    }
    if (currentView !== "browse") {
      setView("browse");
    }
    focusSearch();
    return;
  }

  // 4. KANJI DETAIL SHEET NAVIGATION & ACTIONS
  if (sheetChar) {
    const k = byChar[sheetChar];
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "j") {
      event.preventDefault();
      navigateSheetKanji(-1);
      return;
    }
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "k") {
      event.preventDefault();
      navigateSheetKanji(1);
      return;
    }
    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      toggleFavorite(sheetChar);
      return;
    }
    if (event.key.toLowerCase() === "m" || event.key.toLowerCase() === "l") {
      event.preventDefault();
      toggleLearned(sheetChar);
      return;
    }
    if (event.key.toLowerCase() === "s" || event.key.toLowerCase() === "v") {
      event.preventDefault();
      if (k) {
        const toSpeak = (k.onTts && k.onTts[0]) || (k.kun && k.kun[0]) || k.char;
        speakJapanese(toSpeak);
      }
      return;
    }
    if (event.key === " " || event.key.toLowerCase() === "p") {
      event.preventDefault();
      strokePlay();
      return;
    }
    if (event.key === "[") {
      event.preventDefault();
      strokeStep(-1);
      return;
    }
    if (event.key === "]") {
      event.preventDefault();
      strokeStep(1);
      return;
    }
    if (event.key.toLowerCase() === "c") {
      event.preventDefault();
      clearPracticeCanvas();
      return;
    }
    if (event.key.toLowerCase() === "w") {
      event.preventDefault();
      const nextMode = (typeof stageMode !== "undefined" && stageMode === "watch") ? "draw" : "watch";
      setStageMode(nextMode);
      return;
    }
    return;
  }

  // 5. ACTIVE QUIZ SHORTCUTS
  if (quiz && quiz.active) {
    if (quiz.mode === "flashcard") {
      if (!quiz.revealed) {
        if (event.key === " " || event.key === "Enter" || event.key === "ArrowDown" || event.key === "ArrowRight") {
          event.preventDefault();
          quiz.revealed = true;
          render(false);
          return;
        }
      } else {
        if (event.key === "1" || event.key.toLowerCase() === "a" || event.key === "ArrowLeft") {
          event.preventDefault();
          submitFlashcardRating("again");
          return;
        }
        if (event.key === "2" || event.key.toLowerCase() === "g" || event.key === "ArrowDown" || event.key === " ") {
          event.preventDefault();
          submitFlashcardRating("good");
          return;
        }
        if (event.key === "3" || event.key.toLowerCase() === "e" || event.key === "ArrowRight") {
          event.preventDefault();
          submitFlashcardRating("easy");
          return;
        }
      }
      if (event.key.toLowerCase() === "s" || event.key.toLowerCase() === "v") {
        event.preventDefault();
        const q = quiz.questions[quiz.index];
        if (q) speakJapanese(q.tts || q.char);
        return;
      }
      return;
    }

    // Multiple-choice / listening / sentence quiz questions
    if (quiz.selected === null) {
      const q = quiz.questions && quiz.questions[quiz.index];
      if (q && q.options) {
        let optIdx = -1;
        if (event.key >= "1" && event.key <= "4") {
          optIdx = parseInt(event.key, 10) - 1;
        } else {
          const lk = event.key.toLowerCase();
          if (lk === "a") optIdx = 0;
          else if (lk === "b") optIdx = 1;
          else if (lk === "c") optIdx = 2;
          else if (lk === "d") optIdx = 3;
        }
        if (optIdx >= 0 && optIdx < q.options.length) {
          event.preventDefault();
          answerQuestion(q.options[optIdx]);
          return;
        }
      }
    }
    if (event.key.toLowerCase() === "s" || event.key.toLowerCase() === "v") {
      event.preventDefault();
      const q = quiz.questions[quiz.index];
      if (q && q.tts) speakJapanese(q.tts);
      return;
    }
    return;
  }

  // 6. QUIZ RESULTS SCREEN
  if (quiz && quiz.done) {
    if (event.key.toLowerCase() === "r" || event.key === "Enter") {
      event.preventDefault();
      startQuiz(quiz.level, quiz.mode, quiz.category);
      return;
    }
    if (event.key.toLowerCase() === "h") {
      event.preventDefault();
      quiz = null;
      setView("home");
      return;
    }
  }

  // 7. PRINTABLE WORKSHEET VIEW
  if (currentView === "printable") {
    if (event.key === "ArrowLeft" || event.key === "[") {
      event.preventDefault();
      if (printablePage > 0) {
        printablePage--;
        render(false);
      }
      return;
    }
    if (event.key === "ArrowRight" || event.key === "]") {
      event.preventDefault();
      printablePage++;
      render(false);
      return;
    }
    if (event.key.toLowerCase() === "d") {
      event.preventDefault();
      downloadSchoolWorksheetCanvas();
      return;
    }
    if (event.key.toLowerCase() === "p") {
      event.preventDefault();
      triggerPrintablePrint();
      return;
    }
    if (event.key.toLowerCase() === "m") {
      event.preventDefault();
      printableShowMeaning = !printableShowMeaning;
      render(false);
      return;
    }
  }

  // 8. GLOBAL NAVIGATION (1-4 or H, K, Q, U)
  if (event.key === "1" || event.key.toLowerCase() === "h") {
    event.preventDefault();
    setView("home");
    return;
  }
  if (event.key === "2" || event.key.toLowerCase() === "k") {
    event.preventDefault();
    setView("browse");
    return;
  }
  if (event.key === "3" || event.key.toLowerCase() === "q") {
    event.preventDefault();
    setView("quiz");
    return;
  }
  if (event.key === "4" || event.key.toLowerCase() === "u") {
    event.preventDefault();
    setView("profile");
    return;
  }

  // 9. SUBVIEW SHORTCUTS FROM LIBRARY
  if (currentView === "browse") {
    const lk = event.key.toLowerCase();
    if (lk === "w") {
      event.preventDefault();
      setView("words");
      return;
    }
    if (lk === "r") {
      event.preventDefault();
      setView("radicals");
      return;
    }
    if (lk === "g") {
      event.preventDefault();
      setView("grammar");
      return;
    }
    if (lk === "t") {
      event.preventDefault();
      setView("reader");
      return;
    }
    if (lk === "p") {
      event.preventDefault();
      setView("printable");
      return;
    }
  }

  // 10. HOME VIEW QUICK SHORTCUTS
  if (currentView === "home") {
    if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      heroOffset += 1;
      refreshHeroCardInPlace();
      setupHeroAutoRotate();
      const nextK = todayKanji();
      snackbar(`নতুন কাঞ্জি: 「${nextK.char}」— ${primaryMeaning(nextK)}`, "refresh");
      return;
    }
    if (event.key.toLowerCase() === "r" && srsDueKanji().length > 0) {
      event.preventDefault();
      startSrsReview();
      return;
    }
  }

  // 11. PROFILE VIEW QUICK SHORTCUT
  if (currentView === "profile") {
    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      setView("settings");
      return;
    }
  }
}

/* ---------- Japanese School Worksheet A4 Download & Print ---------- */

const showSnackbar = (text, iconName = "info") => snackbar(text, iconName);

function triggerPrintablePrint() {
  try {
    window.focus();
    window.print();
  } catch (_) {
    snackbar("প্রিন্ট ডায়ালগ খোলা যায়নি — 'A4 শিট ডাউনলোড (PNG)' বাটন ব্যবহার করুন।", "info");
  }
}

function downloadSchoolWorksheetCanvas() {
  if (typeof getCurrentPrintableSlice !== "function") return;
  const { items, baseNum } = getCurrentPrintableSlice();
  if (!items || items.length === 0) {
    snackbar("ডাউনলোড করার জন্য কোনো কাঞ্জি নেই।", "info");
    return;
  }

  const pageW = 1654; // A4 width at 150 DPI
  const pageH = 2339; // Standard A4 portrait height at 150 DPI
  const padX = 64;
  const padTop = 50;
  const padBottom = 50;
  const headerH = 92;

  // For 5 kanji blocks on A4 (pageH = 2339):
  // Available height = 2339 - 100 (pads) - 92 (header) = 2147px
  // 5 blocks * ~390px + 4 gaps * ~40px = 1950 + 160 = 2110px (fits standard A4 with zero overflow)
  const isFiveOrMore = items.length >= 5;
  const numBarH = isFiveOrMore ? 38 : 44;
  const mainRowH = isFiveOrMore ? 124 : 136;
  const furiH = isFiveOrMore ? 30 : 34;
  const wboxH = isFiveOrMore ? 92 : 102;
  const yomiRowH = furiH + wboxH;
  const blockH = numBarH + mainRowH + yomiRowH * 2;
  const blockW = pageW - padX * 2;
  const sidebarW = 244;
  const vLabelW = 48;

  const totalBlockH = items.length * blockH;
  const availableForGaps = Math.max(0, (pageH - padTop - padBottom - headerH) - totalBlockH);
  const blockGap = items.length > 1 ? Math.min(36, Math.floor(availableForGaps / (items.length - 1))) : 24;

  const canvas = document.createElement("canvas");
  canvas.width = pageW;
  canvas.height = pageH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const fontJP = "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif";
  const fontUI = "'Noto Sans Bengali', 'Inter', sans-serif";

  // 1. White paper background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, pageW, pageH);

  // 2. Worksheet Header
  ctx.fillStyle = "#444444";
  ctx.font = `700 17px ${fontJP}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.fillText("漢字練習帳 · JAPANESE SCHOOL KANJI WORKSHEET", padX, padTop);

  const targetLvls = typeof activeStudyLevels === "function" ? activeStudyLevels().join("·") : "N5·N4";
  const titleLabel = printableLevel === "school_demo"
    ? "School Worksheet (別・引)"
    : printableLevel === "target"
    ? targetLvls
    : printableLevel === "fav"
    ? "Favorites"
    : printableLevel === "custom"
    ? "Custom Set"
    : printableLevel;

  ctx.fillStyle = "#111111";
  ctx.font = `700 30px ${fontUI}`;
  ctx.fillText(`JLPT ${titleLabel} — কাঞ্জি ও 読み方 অনুশীলন শিট`, padX, padTop + 24);

  ctx.fillStyle = "#222222";
  ctx.font = `500 19px ${fontJP}`;
  ctx.textAlign = "right";
  ctx.fillText("名前 (Name): ______________________   日付 (Date): ____/____/____", pageW - padX, padTop + 32);

  // Header bottom divider
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(padX, padTop + headerH - 18);
  ctx.lineTo(pageW - padX, padTop + headerH - 18);
  ctx.stroke();

  // 3. Draw each Kanji School Block
  let curY = padTop + headerH;

  items.forEach((k, idx) => {
    const itemNum = baseNum + idx;
    const [row1, row2] = getSchoolWorksheetRows(k);
    const cells1 = buildTwelveSchoolCells(row1.unit);
    const cells2 = buildTwelveSchoolCells(row2.unit);

    const bx = padX;
    const by = curY;

    // Top Number Bar fill
    ctx.fillStyle = "#f4f6f8";
    ctx.fillRect(bx, by, blockW, numBarH);

    // Number badge cell (aligned with sidebarW)
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx + sidebarW, by);
    ctx.lineTo(bx + sidebarW, by + numBarH);
    ctx.moveTo(bx, by + numBarH);
    ctx.lineTo(bx + blockW, by + numBarH);
    ctx.stroke();

    ctx.fillStyle = "#111111";
    ctx.font = `700 24px ${fontUI}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(String(itemNum), bx + 18, by + numBarH / 2);

    // Meaning, On/Kun readings & stroke count in top bar
    const onStr = (k.on && k.on.length) ? k.on.join(", ") : "—";
    const kunArr = typeof getEffectiveKunList === "function" ? getEffectiveKunList(k) : (k.kun || []);
    const kunStr = kunArr.length ? kunArr.join(", ") : "—";
    const readingSummary = `音: ${onStr} · 訓: ${kunStr}`;
    let metaText = `${readingSummary}   (${k.level} · ${k.strokes} strokes)`;
    if (printableShowMeaning) {
      const mBn = primaryMeaning(k);
      const mEn = secondaryMeaning(k);
      metaText = `${mBn}${mEn ? " · " + mEn : ""}  |  ${readingSummary}  (${k.level} · ${k.strokes} strokes)`;
    }
    ctx.fillStyle = "#333333";
    ctx.font = `600 18.5px ${fontUI}`;
    ctx.fillText(metaText, bx + sidebarW + 18, by + numBarH / 2);

    // Row 1: Master Kanji + 10 Practice Boxes
    const mainY = by + numBarH;
    // Master cell right border & row bottom border
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx + sidebarW, mainY);
    ctx.lineTo(bx + sidebarW, mainY + mainRowH);
    ctx.moveTo(bx, mainY + mainRowH);
    ctx.lineTo(bx + blockW, mainY + mainRowH);
    ctx.stroke();

    // Master Kanji character
    ctx.fillStyle = "#000000";
    ctx.font = `700 92px ${fontJP}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(k.char, bx + sidebarW / 2, mainY + mainRowH / 2 + 3);

    // 10 Kanji Practice Boxes
    const gridW = blockW - sidebarW;
    const kboxW = gridW / 10;
    for (let c = 0; c < 10; c++) {
      const cellX = bx + sidebarW + c * kboxW;
      // Dashed crosshairs
      ctx.save();
      ctx.strokeStyle = "#e0e4e8";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cellX + kboxW / 2, mainY + 6);
      ctx.lineTo(cellX + kboxW / 2, mainY + mainRowH - 6);
      ctx.moveTo(cellX + 6, mainY + mainRowH / 2);
      ctx.lineTo(cellX + kboxW - 6, mainY + mainRowH / 2);
      ctx.stroke();
      ctx.restore();

      // Trace character in first 3 boxes
      if (c < 3) {
        ctx.fillStyle = "#c4c8ce";
        ctx.font = `500 80px ${fontJP}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(k.char, cellX + kboxW / 2, mainY + mainRowH / 2 + 3);
      }

      // Cell right border
      if (c < 9) {
        ctx.strokeStyle = "#333333";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cellX + kboxW, mainY);
        ctx.lineTo(cellX + kboxW, mainY + mainRowH);
        ctx.stroke();
      }
    }

    // Rows 2 & 3: 読み方 Section
    const yomiY = mainY + mainRowH;
    const yomiTotalH = yomiRowH * 2;

    // Sidebar vertical dividers
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx + sidebarW, yomiY);
    ctx.lineTo(bx + sidebarW, yomiY + yomiTotalH);
    ctx.stroke();

    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx + vLabelW, yomiY);
    ctx.lineTo(bx + vLabelW, yomiY + yomiTotalH);
    // Horizontal divider between reading label 1 and reading label 2
    ctx.moveTo(bx + vLabelW, yomiY + yomiRowH);
    ctx.lineTo(bx + sidebarW, yomiY + yomiRowH);
    ctx.stroke();

    // Vertical "読み方" text
    ctx.fillStyle = "#111111";
    ctx.font = `700 24px ${fontJP}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const vChars = ["読", "み", "方"];
    vChars.forEach((vc, vi) => {
      const vy = yomiY + (yomiTotalH / 4) * (vi + 1);
      ctx.fillText(vc, bx + vLabelW / 2, vy);
    });

    // Reading labels (Row 1 & Row 2)
    const labelAreaW = sidebarW - vLabelW;
    [row1, row2].forEach((rObj, rIdx) => {
      const ry = yomiY + rIdx * yomiRowH;
      const lbl = rObj.label || "";
      const fontSize = lbl.length >= 5 ? 24 : lbl.length === 4 ? 27 : 31;
      ctx.fillStyle = "#111111";
      ctx.font = `700 ${fontSize}px ${fontJP}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(lbl, bx + vLabelW + labelAreaW / 2, ry + yomiRowH / 2);
    });

    // 12 Columns for Row 1 and Row 2
    const wColW = gridW / 12;
    [cells1, cells2].forEach((cellArr, rIdx) => {
      const ry = yomiY + rIdx * yomiRowH;

      // Furigana bottom line
      ctx.strokeStyle = "#555555";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bx + sidebarW, ry + furiH);
      ctx.lineTo(bx + blockW, ry + furiH);
      ctx.stroke();

      // Row divider between Row 1 and Row 2
      if (rIdx === 0) {
        ctx.strokeStyle = "#222222";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + sidebarW, ry + yomiRowH);
        ctx.lineTo(bx + blockW, ry + yomiRowH);
        ctx.stroke();
      }

      cellArr.forEach((cell, cIdx) => {
        const cx = bx + sidebarW + cIdx * wColW;

        // Furigana text
        if (cell.furi) {
          const fSize = cell.furi.length >= 3 ? 16 : 19;
          ctx.fillStyle = "#111111";
          ctx.font = `600 ${fSize}px ${fontJP}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(cell.furi, cx + wColW / 2, ry + furiH / 2 + 1);
        }

        // Word trace character
        if (cell.traceChar) {
          ctx.fillStyle = "#c4c8ce";
          ctx.font = `500 62px ${fontJP}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(cell.traceChar, cx + wColW / 2, ry + furiH + wboxH / 2 + 2);
        }

        // Column right border
        if (cIdx < 11) {
          ctx.strokeStyle = cell.groupEnd ? "#222222" : "#666666";
          ctx.lineWidth = cell.groupEnd ? 2 : 1.2;
          ctx.beginPath();
          ctx.moveTo(cx + wColW, ry);
          ctx.lineTo(cx + wColW, ry + yomiRowH);
          ctx.stroke();
        }
      });
    });

    // Outer heavy black border around the entire Kanji block
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 3.5;
    ctx.strokeRect(bx, by, blockW, blockH);

    curY += blockH + blockGap;
  });

  // Trigger PNG download
  try {
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const fileTag = printableLevel === "school_demo" ? "School-14-15" : `${printableLevel}-P${printablePage + 1}`;
    link.download = `Kanji-Worksheet-${fileTag}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    snackbar("✓ জাপানি স্কুল প্র্যাকটিস শিট (PNG) ডাউনলোড সম্পন্ন!", "check");
  } catch (_) {
    snackbar("ডাউনলোড করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।", "alert");
  }
}

/* ---------- Boot ---------- */

function init() {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.nav));
  });
  document.addEventListener("click", handleAction);
  document.addEventListener("input", handleInput);
  document.addEventListener("pointerdown", handleRipple);
  document.addEventListener("keydown", handleKeydown);

  const dialog = document.getElementById("confirm-dialog");
  if (dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) dialog.close();
    });
  }

  const shortcutsDialog = document.getElementById("shortcuts-dialog");
  if (shortcutsDialog) {
    shortcutsDialog.addEventListener("click", (event) => {
      if (event.target !== shortcutsDialog) return;
      const rect = shortcutsDialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) shortcutsDialog.close();
    });
  }

  updateTopAvatar();
  applyDisplayPrefs();
  render(true);

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
