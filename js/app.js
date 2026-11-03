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

function freshState() {
  return {
    learned: [],
    favorites: [],
    quiz: { correct: 0, total: 0 },
    best: 0,
    days: [],
    prefs: { ruby: true, reading: true, translation: true },
    srs: {},
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
      },
      srs,
    };
  } catch {
    return base;
  }
}

let state = loadState();
let currentView = "home";
let browseFilter = "all";
let browseCategory = "all";
let searchQuery = "";
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
    updatedAt: Math.max(Number(local.updatedAt) || 0, Number(remote.updatedAt) || 0, Date.now()),
  };
}

function updateTopAvatar() {
  const avatarEl = document.querySelector(".topbar .avatar");
  if (!avatarEl) return;
  const user = window.firebaseSync?.currentUser;
  if (user && user.photoURL) {
    // Safe DOM creation - avoid innerHTML for user-controlled data
    avatarEl.innerHTML = '';
    const img = document.createElement('img');
    const url = String(user.photoURL);
    // Validate URL protocol to prevent javascript: or data: XSS
    try {
      const parsedUrl = new URL(url, window.location.origin);
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        img.src = url;
        img.alt = user.displayName || "User";
        img.className = 'avatar-img';
        avatarEl.appendChild(img);
        avatarEl.classList.add("has-photo");
      } else {
        // Invalid protocol - fallback to text
        avatarEl.textContent = "学";
        avatarEl.classList.remove("has-photo");
      }
    } catch {
      // Invalid URL - fallback to text
      avatarEl.textContent = "学";
      avatarEl.classList.remove("has-photo");
    }
  } else {
    avatarEl.textContent = "学";
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
  window.firebaseSync.onAuthStateChanged = () => {
    updateTopAvatar();
    if (currentView === "profile") {
      render(false);
    }
  };

  window.firebaseSync.onCloudStateMerged = (remoteData) => {
    state = mergeStates(state, remoteData);
    window.state = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
    refreshSheet();
    render(false);
    snackbar("অন্য ডিভাইস থেকে ক্লাউড ডাটা সিঙ্ক হয়েছে!", "cloudCheck");
  };

  window.firebaseSync.onSyncStatusChanged = () => {
    if (currentView === "profile") {
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
  if (count >= total) return "Grand master";
  const pct = total ? count / total : 0;
  if (pct >= 0.6) return "Master";
  if (pct >= 0.3) return "Scholar";
  if (pct >= 0.1) return "Apprentice";
  return "Seedling";
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
  return KANJI[(day * 7 + now.getFullYear()) % KANJI.length];
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

  viewEl.classList.remove("animate");
  if (animate) {
    void viewEl.offsetWidth;
    viewEl.classList.add("animate");
  }
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

function generateReadingDistractors(answer, kanji, pool) {
  const distractors = new Set();
  const ans = kataToHira(cleanReading(answer));
  if (!ans) return [];

  // ULTRA-HARD MODE: Make all options look plausible
  const allKanjiPool = pool || KANJI;

  // 1. Alternative readings of the EXACT same kanji (Kun vs On) - MOST CONFUSING
  const allReadings = [
    ...(kanji.on || []),
    ...(kanji.kun || [])
  ].map((r) => kataToHira(cleanReading(r))).filter((r) => r && r !== ans);

  for (const r of shuffle(allReadings)) {
    if (distractors.size >= 3) break;
    if (r !== ans && !distractors.has(r)) distractors.add(r);
  }

  // 2. HOMOPHONE readings - Different kanji with SAME reading (Real JLPT killer!)
  if (distractors.size < 3) {
    const homophones = allKanjiPool.filter(k => {
      if (k.char === kanji.char) return false;
      const readings = [...(k.on || []), ...(k.kun || [])]
        .map(r => kataToHira(cleanReading(r)));
      return readings.includes(ans);
    });
    for (const h of shuffle(homophones)) {
      if (distractors.size >= 3) break;
      const hReading = kataToHira(cleanReading((h.kun && h.kun[0]) || (h.on && h.on[0]) || ""));
      // Use the actual reading from homophone kanji, not the answer
      if (hReading && hReading !== ans && !distractors.has(hReading)) {
        // Find a different reading for this homophone kanji if possible
        const altReadings = [...(h.on || []), ...(h.kun || [])]
          .map(r => kataToHira(cleanReading(r)))
          .filter(r => r !== hReading && r !== ans);
        const bestAlt = shuffle(altReadings)[0];
        if (bestAlt && !distractors.has(bestAlt)) {
          distractors.add(bestAlt);
        } else {
          distractors.add(hReading);
        }
      }
    }
  }

  // 3. Dakuon / Handakuon swap (Tenten / Maru) - Visual phonetic confusion
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
      if (opt !== ans && !distractors.has(opt)) distractors.add(opt);
    }
  }

  // 4. Chōon (long vowel) variations - Extends/shortens
  if (distractors.size < 3) {
    const choonVariants = [];
    if (ans.includes("う") && ans.length > 2) {
      choonVariants.push(ans.replace(/う/g, ""));
    }
    if (ans.includes("い") && ans.length > 2) {
      choonVariants.push(ans.replace(/い/g, ""));
    }
    // Add long vowel
    if (ans.length >= 2) {
      const lastChar = ans[ans.length - 1];
      const longVowelMap = { 'あ': 'ああ', 'い': 'いい', 'う': 'うう', 'え': 'ええ', 'お': 'おお' };
      if (longVowelMap[lastChar]) {
        choonVariants.push(ans.slice(0, -1) + longVowelMap[lastChar]);
      }
    }
    for (const variant of shuffle(choonVariants)) {
      if (distractors.size >= 3) break;
      if (variant && variant !== ans && !distractors.has(variant)) distractors.add(variant);
    }
  }

  // 5. Sokuon (っ) variations - Makes it look like small tsu confusion
  if (distractors.size < 3) {
    const sokuonVariants = [];
    if (ans.includes("っ")) {
      sokuonVariants.push(ans.replace(/っ/g, ""));
    } else if (ans.length >= 2) {
      // Try sokuon at different positions
      for (let i = 1; i < ans.length; i++) {
        sokuonVariants.push(ans.slice(0, i) + "っ" + ans.slice(i));
        if (sokuonVariants.length >= 3) break;
      }
    }
    for (const variant of shuffle(sokuonVariants)) {
      if (distractors.size >= 3) break;
      if (variant && variant !== ans && !distractors.has(variant)) distractors.add(variant);
    }
  }

  // 6. Look-alike Hiragana - Visual confusion (ひ/ほ/ふ, と/ど/つ)
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
      if (variant !== ans && !distractors.has(variant)) distractors.add(variant);
    }
  }

  // 7. Same kanji pool but DIFFERENT reading patterns - Mix kun/on
  if (distractors.size < 3) {
    const sameLevelKanji = allKanjiPool.filter(k =>
      k.char !== kanji.char && k.level === kanji.level
    );
    const readingVariants = [];
    for (const other of shuffle(sameLevelKanji)) {
      const otherReading = kataToHira(cleanReading(
        (other.kun && other.kun[0]) || (other.on && other.on[0]) || ""
      ));
      if (otherReading && otherReading !== ans) {
        readingVariants.push(otherReading);
      }
      if (readingVariants.length >= 20) break;
    }
    for (const variant of shuffle(readingVariants)) {
      if (distractors.size >= 3) break;
      if (variant !== ans && !distractors.has(variant)) distractors.add(variant);
    }
  }

  // 8. Katakana version of hiragana reading (for mixed script confusion)
  if (distractors.size < 3 && ans.length > 0) {
    const kanaMap = {
      'あ': 'ア', 'い': 'イ', 'う': 'ウ', 'え': 'エ', 'お': 'オ',
      'か': 'カ', 'き': 'キ', 'く': 'ク', 'け': 'ケ', 'こ': 'コ',
      'さ': 'サ', 'し': 'シ', 'す': 'ス', 'せ': 'セ', 'そ': 'ソ',
      'た': 'タ', 'ち': 'チ', 'つ': 'ツ', 'て': 'テ', 'と': 'ト',
      'な': 'ナ', 'に': 'ニ', 'ぬ': 'ヌ', 'ね': 'ネ', 'の': 'ノ',
      'は': 'ハ', 'ひ': 'ヒ', 'ふ': 'フ', 'へ': 'ヘ', 'ほ': 'ホ',
      'ま': 'マ', 'み': 'ミ', 'む': 'ム', 'め': 'メ', 'も': 'モ',
      'や': 'ヤ', 'ゆ': 'ユ', 'よ': 'ヨ',
      'ら': 'ラ', 'り': 'リ', 'る': 'ル', 'れ': 'レ', 'ろ': 'ロ',
      'わ': 'ワ', 'を': 'ヲ', 'ん': 'ン'
    };
    const katakanaVersion = ans.split('').map(c => kanaMap[c] || c).join('');
    if (katakanaVersion !== ans && !distractors.has(katakanaVersion)) {
      distractors.add(katakanaVersion);
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

    // Find best example sentence for context
    const ex = (k.examples && k.examples.find((e) => e.japanese && e.japanese.includes(k.char))) || (k.examples && k.examples[0]);

    if (effectiveMode === "reverse") {
      answer = k.char;
      mondaiType = "問題２ · 表記";
      promptText = primaryMeaning(k);
      promptEn = secondaryMeaning(k);
      const reading = kataToHira(cleanReading((k.kun && k.kun[0]) || (k.on && k.on[0]) || (k.example && k.example.reading) || ""));
      if (ex && ex.japanese && ex.japanese.includes(k.char) && reading) {
        sentencePrompt = ex.japanese.replace(k.char, `<u>${reading}</u>`);
        sentenceBn = ex.meaningBn || "";
      }
      distractors = getConfusableKanji(k.char, k, KANJI);
    } else if (effectiveMode === "reading") {
      mondaiType = "問題１ · 漢字読み";
      const rawReading = (k.kun && k.kun[0]) || (k.on && k.on[0]) || (k.example && k.example.reading) || "";
      answer = kataToHira(cleanReading(rawReading)) || k.char;
      promptText = k.char;
      if (ex && ex.japanese && ex.japanese.includes(k.char)) {
        sentencePrompt = ex.japanese.replace(k.char, `<u>${k.char}</u>`);
        sentenceBn = ex.meaningBn || "";
      }
      distractors = generateReadingDistractors(answer, k, KANJI);
    } else if (effectiveMode === "listening") {
      mondaiType = "聴解 · Listening";
      answer = primaryMeaning(k);
      tts = (k.kunTts && k.kunTts[0]) || (k.kun[0] ? cleanReading(k.kun[0]) : "") || (k.onTts && k.onTts[0]) || cleanReading(k.on[0]) || k.char;
      distractors = generateMeaningDistractors(k, KANJI);
    } else {
      // meaning
      mondaiType = "意味 · Meaning";
      answer = primaryMeaning(k);
      promptText = k.char;
      if (ex && ex.japanese && ex.japanese.includes(k.char)) {
        sentencePrompt = ex.japanese.replace(k.char, `<u>${k.char}</u>`);
        sentenceBn = ex.meaningBn || "";
      }
      distractors = generateMeaningDistractors(k, KANJI);
    }

    // Safety fallback: ensure exactly 3 distinct distractors
    const finalDistractors = [];
    const seen = new Set([answer]);
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

    return {
      char: k.char,
      answer,
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

/* ---------- Reset ---------- */

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
    case "see-all":
      browseFilter = "all";
      searchQuery = "";
      setView("browse");
      break;
    case "filter-level":
      browseFilter = target.dataset.level;
      searchQuery = "";
      setView("browse");
      break;
    case "filter": {
      browseFilter = target.dataset.filter;
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
      syncChips("filter-category", "category", browseCategory);
      renderKanjiGrid();
      break;
    }
    case "clear-search": {
      searchQuery = "";
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
      printableLevel = target.dataset.level || "N5";
      render(false);
      break;
    case "window-print":
      window.print();
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
      const q = quiz.questions[quiz.index];

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
      break;
    }
    case "export-backup": {
      const jsonStr = JSON.stringify(state, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kanji-study-backup-${isoDate()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      snackbar("প্রগ্রেস ব্যাকআপ ফাইল ডাউনলোড হয়েছে!", "download");
      break;
    }
    case "trigger-import-backup": {
      const fileInput = document.getElementById("backup-file-input");
      if (fileInput) fileInput.click();
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
      if (!window.firebaseSync || !window.firebaseSync.isConfigured()) {
        const dialog = document.getElementById("firebase-dialog");
        if (dialog) dialog.showModal();
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
    case "open-firebase-config": {
      const dialog = document.getElementById("firebase-dialog");
      const textarea = document.getElementById("firebase-config-input");
      if (dialog) {
        if (textarea) {
          const cfg = window.firebaseSync?.getConfig();
          if (cfg) {
            textarea.value = JSON.stringify(cfg, null, 2);
          }
        }
        dialog.showModal();
      }
      break;
    }
    case "close-firebase-dialog": {
      const dialog = document.getElementById("firebase-dialog");
      if (dialog && dialog.open) dialog.close();
      break;
    }
    case "save-firebase-config": {
      const textarea = document.getElementById("firebase-config-input");
      const dialog = document.getElementById("firebase-dialog");
      if (!textarea || !textarea.value.trim()) {
        snackbar("অনুগ্রহ করে সঠিক Firebase JSON কনফিগ পেস্ট করুন", "x");
        break;
      }
      try {
        let val = textarea.value.trim();
        if (val.includes("{") && val.includes("}")) {
          const start = val.indexOf("{");
          const end = val.lastIndexOf("}");
          val = val.substring(start, end + 1);
        }
        let parsed;
        try {
          parsed = JSON.parse(val);
        } catch (jsonErr) {
          // Fallback: attempt to parse relaxed JSON (e.g., unquoted keys, trailing commas)
          // by wrapping in a safe eval-like parse. But we NEVER use new Function() or eval()
          // with user input. Instead we attempt a simple cleanup.
          const cleaned = val
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')  // unquoted keys
            .replace(/,(\s*[}\]])/g, '$1');  // trailing commas
          try {
            parsed = JSON.parse(cleaned);
          } catch {
            throw new Error("JSON ফরম্যাট সঠিক নয়। ডাবল কোটেশন ব্যবহার করুন।");
          }
        }
        if (!parsed || !parsed.apiKey || !parsed.projectId) {
          throw new Error("apiKey এবং projectId আবশ্যক");
        }
        window.firebaseSync.saveConfig(parsed);
        if (dialog && dialog.open) dialog.close();
        snackbar("Firebase সফলভাবে কানেক্ট হয়েছে!", "check");
        render(false);
      } catch (err) {
        snackbar(`কনফিগ সঠিক নয়: ${err.message}`, "x");
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
  const clear = viewEl.querySelector(".search-clear");
  if (clear) clear.classList.toggle("hidden", !searchQuery);
  renderKanjiGrid();
}

const RIPPLE_SELECTOR = ".btn, .icon-btn, .nav-item, .chip, .kanji-card, .mini-card, .level-row, .quiz-level, .option, .hero-tap, .setting-row, .radical-entry, .radical-card, .radical-kanji";

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
  if (event.key === "Escape") {
    if (sheetChar) closeSheet();
    return;
  }
  // Quiz answer shortcuts: 1-4 or A-D
  if (quiz && quiz.active && quiz.selected === null && quiz.mode !== "flashcard") {
    const q = quiz.questions && quiz.questions[quiz.index];
    if (q && q.options) {
      let optIdx = -1;
      if (event.key >= "1" && event.key <= "4") {
        optIdx = parseInt(event.key, 10) - 1;
      } else {
        const k = event.key.toLowerCase();
        if (k === "a") optIdx = 0;
        else if (k === "b") optIdx = 1;
        else if (k === "c") optIdx = 2;
        else if (k === "d") optIdx = 3;
      }
      if (optIdx >= 0 && optIdx < q.options.length) {
        event.preventDefault();
        answerQuestion(q.options[optIdx]);
      }
    }
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

  const fbDialog = document.getElementById("firebase-dialog");
  if (fbDialog) {
    fbDialog.addEventListener("click", (event) => {
      if (event.target !== fbDialog) return;
      const rect = fbDialog.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside) fbDialog.close();
    });
  }

  const fileInput = document.getElementById("backup-file-input");
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const imported = JSON.parse(evt.target.result);
          if (!imported || typeof imported !== "object") throw new Error("অবৈধ ফরম্যাট");
          state = mergeStates(state, imported);
          saveState();
          refreshSheet();
          render(false);
          snackbar("ব্যাকআপ ফাইল সফলভাবে রিস্টোর হয়েছে!", "check");
        } catch (err) {
          snackbar(`ফাইল পড়া যায়নি: ${err.message}`, "x");
        }
      };
      reader.readAsText(file);
      fileInput.value = "";
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
