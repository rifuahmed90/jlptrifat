/* View renderers. Called by app.js after state is loaded. */

if (typeof TAXONOMY === "undefined") {
  globalThis.TAXONOMY = {
    kanjiCategories: {
      numbers: "সংখ্যা",
      time: "সময় ও তারিখ",
      money: "টাকা-পয়সা",
      people: "মানুষ ও পরিবার",
      nature: "প্রকৃতি ও আবহাওয়া",
      position: "দিক ও অবস্থান",
      study: "পড়াশোনা ও ভাষা",
      actions: "ক্রিয়া",
      adjectives: "আকার ও রং",
      daily_basics: "দৈনন্দিন মৌলিক",
      general: "সাধারণ",
    },
    wordTopics: {
      numbers: "সংখ্যা",
      counting: "গোনার শব্দ",
      time: "সময়",
      calendar: "মাস, দিন ও বার",
      people_family: "মানুষ ও পরিবার",
      nature_weather: "প্রকৃতি ও আবহাওয়া",
      direction_position: "দিক ও অবস্থান",
      places: "জায়গা ও দেশ",
      transport: "যানবাহন ও যাতায়াত",
      money_shopping: "টাকা ও কেনাকাটা",
      school_study: "স্কুল ও পড়াশোনা",
      language: "ভাষা, পড়া ও লেখা",
      food_drink: "খাবার ও পানীয়",
      things_clothes: "জিনিসপত্র ও পোশাক",
      health_feelings: "স্বাস্থ্য ও অনুভূতি",
      work: "কাজ ও অফিস",
      action_verbs: "ক্রিয়া (কাজের শব্দ)",
      adjectives: "বিশেষণ (বর্ণনার শব্দ)",
      expressions: "দৈনন্দিন কথাবার্তা",
    },
    situations: {
      school: "স্কুল / ক্লাস",
      shop: "দোকান / কেনাকাটা",
      station: "স্টেশন / যাতায়াত",
      restaurant: "রেস্টুরেন্ট / খাবার",
      job: "অফিস / কাজ",
      hospital: "হাসপাতাল",
      home: "ঘর",
      travel: "ভ্রমণ",
      news: "খবর",
      outdoors: "বাইরে / প্রকৃতি",
      family_friends: "পরিবার ও বন্ধু",
      daily_life: "দৈনন্দিন জীবন",
    },
    partsOfSpeech: {
      noun: "বিশেষ্য",
      verb: "ক্রিয়া",
      i_adjective: "い-বিশেষণ",
      na_adjective: "な-বিশেষণ",
      adverb: "ক্রিয়াবিশেষণ",
      number: "সংখ্যা",
      counter: "গোনার/তারিখ/সময়ের শব্দ",
      proper_noun: "নামবাচক",
      pronoun: "সর্বনাম",
      phrase: "বাক্যাংশ",
    },
    wordType: {
      On: "On'yomi (চীনা উচ্চারণ)",
      Kun: "Kun'yomi (জাপানি উচ্চারণ)",
      Special: "বিশেষ উচ্চারণ",
    },
  };
}
if (typeof VOCAB === "undefined") globalThis.VOCAB = {};
if (typeof KANJI === "undefined") globalThis.KANJI = [];
if (typeof RADICALS === "undefined") globalThis.RADICALS = [];
if (typeof GRAMMAR === "undefined") globalThis.GRAMMAR = [];

const KANJI_CATEGORIES = Object.entries(TAXONOMY.kanjiCategories || {}).map(([id, bn]) => ({ id, bn }));
const WORD_TOPICS = Object.entries(TAXONOMY.wordTopics || {}).map(([id, bn]) => ({ id, bn }));
const PARTS_OF_SPEECH = Object.entries(TAXONOMY.partsOfSpeech || {}).map(([id, bn]) => ({ id, bn }));
const SITUATION_EXTRA = {
  exam: "পরীক্ষা",
  nature: "প্রকৃতি",
  calendar: "ক্যালেন্ডার / তারিখ",
  family: "পরিবার",
  money: "টাকা-পয়সা",
};
const WORD_LEVELS = ["N5", "N4", "N3", "N2", "N1"];
const WORD_LEVEL_RANK = { N5: 0, N4: 1, N3: 2, N2: 3, N1: 4 };
const WORD_LIST = Object.values(VOCAB).sort((a, b) => {
  const rank = (w) => (w.jlpt in WORD_LEVEL_RANK ? WORD_LEVEL_RANK[w.jlpt] : 9);
  return rank(a) - rank(b) || a.word.localeCompare(b.word, "ja");
});

const QUIZ_MODES = [
  { id: "meaning", label: "Meaning", icon: "eye", eyebrow: "What does this kanji mean?", hint: "কাঞ্জি দেখে সঠিক বাংলা অর্থ বাছাই করুন।" },
  { id: "reading", label: "Reading", icon: "book", eyebrow: "How is this kanji read?", hint: "কাঞ্জির সঠিক হিরাগানা উচ্চারণ বাছাই (JLPT স্টাইল)।" },
  { id: "reverse", label: "Reverse", icon: "refresh", eyebrow: "Which kanji matches this meaning?", hint: "বাংলা অর্থ দেখে সঠিক কাঞ্জিটি বাছাই করুন।" },
  { id: "listening", label: "Listening", icon: "volume", eyebrow: "Listen, then pick the meaning.", hint: "উচ্চারণ শুনে সঠিক বাংলা অর্থ বাছাই করুন।" },
  { id: "flashcard", label: "Flashcards", icon: "sparkles", eyebrow: "Anki-style recall card.", hint: "কাঞ্জি মনে করুন, ফ্লিপ করে উত্তর দেখুন এবং রেটিং দিন।" },
  { id: "mock", label: "Mock Exam", icon: "target", eyebrow: "JLPT Timed Practice Exam", hint: "২৫টি প্রশ্ন, সময় ২৫ মিনিট ও বাস্তব JLPT স্কোরকার্ড।" },
];

function categoryLabel(id) {
  return TAXONOMY.kanjiCategories[id] || id;
}

function topicLabel(id) {
  return TAXONOMY.wordTopics[id] || id;
}

function posLabel(id) {
  return TAXONOMY.partsOfSpeech[id] || id;
}

function situationLabel(id) {
  return TAXONOMY.situations[id] || SITUATION_EXTRA[id] || id;
}

function quizPool(level = quizLevel, category = quizCategory) {
  return KANJI.filter((k) => (level === "all" || k.level === level) && (category === "all" || (k.categories || []).includes(category)));
}

function primaryMeaning(k) {
  return k.meaningBn || k.meaning || k.meaningEn || "";
}

function secondaryMeaning(k) {
  if (!k.meaningBn) return "";
  return k.meaningEn || k.meaning || "";
}

function vocabEntries(k) {
  return (k.vocabIds || []).map((id) => VOCAB[id]).filter(Boolean);
}

function formatKunReadings(arr) {
  if (!arr || !arr.length) return '<span class="dash">—</span>';
  return arr.map((r) => {
    if (r.includes(".")) {
      const parts = r.split(".");
      return `<span class="kun-chip" title="'.' এর পরের অংশটি ওকুরিগানা"><span class="kun-stem">${escapeHtml(parts[0])}</span><span class="kun-okuri">.${escapeHtml(parts.slice(1).join("."))}</span></span>`;
    }
    return `<span>${escapeHtml(r)}</span>`;
  }).join("");
}

/* One sentence block — reused by the detail sheet and the settings preview. */
function sentenceMarkup(ex) {
  return `
    <div class="sentence">
      <div class="sentence-head">
        <p class="sentence-jp" lang="ja">${ex.ruby || escapeHtml(ex.japanese)}</p>
        ${ex.tts ? `<button class="speak-btn" data-action="speak" data-text="${escapeHtml(ex.tts)}" aria-label="Speak example sentence">${icon("volume", 15)}</button>` : ""}
      </div>
      <p class="sentence-reading" lang="ja">${escapeHtml(ex.reading)}</p>
      <p class="sentence-meaning">${escapeHtml(ex.meaningBn || ex.meaningEn)}</p>
      ${ex.situationBn ? `<p class="sentence-situation">${icon("pin", 12)}<span>${escapeHtml(ex.situationBn)}</span></p>` : ""}
    </div>`;
}

/* Global reading-display switches (stored in state.prefs). */
const DISPLAY_PREFS = [
  { key: "ruby", icon: "book", short: "Furigana", label: "Furigana above kanji", desc: "Small kana over kanji in sentences and words" },
  { key: "reading", icon: "eye", short: "Kana", label: "Kana reading line", desc: "The full hiragana line under each sentence" },
  { key: "translation", icon: "lang", short: "Translations", label: "Bengali & English", desc: "Translation lines under sentences and words" },
  { key: "audioSlow", icon: "volume", short: "Slow Audio", label: "ধীরগতির অডিও (0.65x)", desc: "নতুন শিক্ষার্থীদের স্পষ্ট বোঝার জন্য ধীর ও নিখুঁত উচ্চারণ" },
];

function prefSwitch(pref) {
  const on = displayPrefs()[pref.key];
  return `
    <button class="setting-row pref-row" data-action="toggle-pref" data-pref="${pref.key}" role="switch" aria-checked="${on}">
      <span class="setting-icon">${icon(pref.icon, 16)}</span>
      <span class="setting-copy">
        <strong>${pref.label}</strong>
        <span>${pref.desc}</span>
      </span>
      <span class="switch ${on ? "on" : ""}" aria-hidden="true"><span></span></span>
    </button>`;
}

/* Radical lookup: N5/N4 entries carry an official number; legacy N3 does not. */
function radicalEntryFor(k) {
  if (!k) return null;
  const number = k.radicalInfo?.number;
  if (number && RADICALS[number - 1]) return RADICALS[number - 1];
  const name = k.radical || k.radicalInfo?.character || "";
  return RADICALS.find((r) => r.char === name || r.variant === name) || null;
}

function radicalSiblings(k) {
  const entry = radicalEntryFor(k);
  if (!entry) return [];
  return entry.kanji
    .filter((item) => item.char !== k.char && byChar[item.char])
    .map((item) => byChar[item.char]);
}

function radicalSearchBlob(r) {
  return [
    r.number, r.char, r.variant, r.strokes, r.reading, r.romaji, r.meaningBn,
    ...r.kanji.map((item) => item.char),
  ].join(" ").toLowerCase();
}

function searchBlob(k) {
  if (k._searchBlob !== undefined) return k._searchBlob;
  const vocabText = vocabEntries(k).flatMap((v) => [v.word, v.reading, v.romaji, v.meaning, v.meaningBn, v.meaningEn]);
  const exampleText = (k.examples || []).flatMap((ex) => [ex.japanese, ex.reading, ex.romaji, ex.meaningBn, ex.meaningEn]);
  k._searchBlob = [
    k.char, k.meaning, k.meaningBn, k.meaningEn, k.level, k.radical,
    ...(k.on || []), ...(k.kun || []),
    k.example?.word, k.example?.reading, k.example?.meaning, k.example?.meaningBn,
    ...vocabText, ...exampleText,
  ].filter(Boolean).join(" ").toLowerCase();
  return k._searchBlob;
}

function strokesText(n) {
  return `${n} ${n === 1 ? "stroke" : "strokes"}`;
}

function levelRows() {
  return ["N5", "N4", "N3", "N2", "N1"].map((level) => {
    const s = levelStats(level);
    const sub = `${s.total} kanji`;
    return `
      <button class="level-row" data-action="filter-level" data-level="${level}" aria-label="${level} ${LEVEL_NAMES[level]}, ${s.learned} of ${s.total} learned">
        <span class="level-badge ${level}">${level}</span>
        <span class="level-main">
          <span class="level-title">${LEVEL_NAMES[level]} <span class="level-sub">${sub}</span></span>
          <span class="mini-bar"><span style="width:${s.pct}%"></span></span>
        </span>
        <span class="level-count">${s.learned}/${s.total}</span>
      </button>`;
  }).join("");
}

function studyLevelSelectorMarkup(compact = false) {
  const selected = (typeof activeStudyLevels === "function") ? activeStudyLevels() : ["N5", "N4"];
  const allLevels = ["N5", "N4", "N3", "N2", "N1"];
  return `
    <div class="hero-level-bar ${compact ? "compact" : "full"}" role="group" aria-label="Target JLPT study levels">
      <span class="hlb-label">${icon("target", 13)} <span>আমার লক্ষ্য (${selected.join("·")}):</span></span>
      <div class="hlb-chips">
        ${allLevels.map((lvl) => {
          const on = selected.includes(lvl);
          return `
            <button class="hlb-chip ${on ? "active " + lvl : ""}" data-action="toggle-study-level" data-level="${lvl}" aria-pressed="${on}" title="${on ? `${lvl} চালু আছে (বন্ধ করতে চাপুন)` : `${lvl} যোগ করতে চাপুন`}">
              <span class="hlb-check">${on ? "✓" : "+"}</span>
              <span>${lvl}</span>
            </button>`;
        }).join("")}
      </div>
    </div>`;
}

function heroCardMarkup() {
  const today = todayKanji();
  const isFav = state.favorites.includes(today.char);
  const isLearned = state.learned.includes(today.char);
  const autoOn = typeof heroAutoRotate !== "undefined" ? heroAutoRotate : true;

  return `
    <section class="hero-card" id="home-hero-card">
      <div class="hero-head">
        <span class="eyebrow"><span class="live-dot"></span>Today's kanji · আজকের কাঞ্জি</span>
        <div class="hero-head-tools">
          <button class="hero-pill-btn ${autoOn ? "active" : ""}" data-action="toggle-hero-auto" title="২০ সেকেন্ড পর পর স্বয়ংক্রিয়ভাবে নতুন কাঞ্জি দেখাবে" aria-pressed="${autoOn}">
            <span class="hero-auto-dot"></span>
            <span>${autoOn ? "Auto · অন" : "Auto · অফ"}</span>
          </button>
          <button class="hero-pill-btn" data-action="next-daily-kanji" title="নতুন আরেকটি কাঞ্জি দেখুন" aria-label="Next kanji">
            ${icon("refresh", 13)}
            <span>বদলান</span>
          </button>
          <button class="icon-btn ${isFav ? "active" : ""}" data-action="fav" data-char="${today.char}" aria-label="${isFav ? "Remove from favorites" : "Add to favorites"}">
            ${icon(isFav ? "starFilled" : "star", 20)}
          </button>
        </div>
      </div>
      ${studyLevelSelectorMarkup(true)}
      <button class="hero-tap" data-action="open-kanji" data-char="${today.char}" aria-label="Open details for ${today.char}">
        <span class="hero-char" lang="ja">${today.char}</span>
        <span class="hero-info">
          <span class="hero-meaning">${primaryMeaning(today)}</span>
          ${secondaryMeaning(today) ? `<span class="hero-en">${secondaryMeaning(today)}</span>` : ""}
          <span class="hero-reading" lang="ja">${today.on[0] || ""}${today.kun[0] ? " · " + today.kun[0] : ""}</span>
          <span class="hero-tags">
            <span class="level-badge ${today.level}">JLPT ${today.level}</span>
            <span class="mini">${strokesText(today.strokes)}</span>
            ${isLearned ? `<span class="level-badge N5">Learned</span>` : `<span class="mini hero-unlearned-tag">নতুন কাঞ্জি</span>`}
          </span>
        </span>
      </button>
      <div class="hero-actions">
        <button class="btn primary" data-action="open-kanji" data-char="${today.char}">
          ${icon("book", 18)} Study · বিস্তারিত
        </button>
        <button class="btn ${isLearned ? "tonal" : "ghost"}" data-action="hero-learn" data-char="${today.char}">
          ${isLearned ? `${icon("check", 17)} Learned · পরেরটি` : `${icon("check", 17)} শিখলাম · পরেরটি`}
        </button>
        <button class="btn ghost hero-next-btn" data-action="next-daily-kanji" aria-label="Show another kanji" title="পরের নতুন কাঞ্জি আনুন">
          ${icon("refresh", 17)}
        </button>
      </div>
      <div class="hero-watermark" lang="ja" aria-hidden="true">${today.char}</div>
    </section>`;
}

function homeAccountBarMarkup() {
  const fb = window.firebaseSync;
  const user = fb ? fb.currentUser : null;

  // Once signed in with Google, hide the banner on Home (name is in the header & photo is in topbar)
  if (user) {
    return "";
  }

  return `
    <div class="home-account-bar">
      <div class="hab-user">
        <span class="hab-google-badge">${icon("google", 16)}</span>
        <div class="hab-copy">
          <strong>Google দিয়ে সাইন-ইন করুন</strong>
          <span>আপনার নাম দেখাতে ও সব ডিভাইসে কাঞ্জি প্রগ্রেস অটো-সিঙ্ক করতে কানেক্ট করুন</span>
        </div>
      </div>
      <div class="hab-actions">
        <button class="btn google-mini-btn" data-action="google-signin">
          ${icon("google", 14)} <span>Continue with Google</span>
        </button>
      </div>
    </div>`;
}

function renderHome() {
  const learned = learnedList();
  const selectedLevels = (typeof activeStudyLevels === "function") ? activeStudyLevels() : ["N5", "N4"];
  const targetSet = new Set(selectedLevels);
  const targetTotalKanji = KANJI.filter((k) => targetSet.has(k.level));
  const targetLearnedCount = targetTotalKanji.filter((k) => state.learned.includes(k.char)).length;
  const totalPoolLen = targetTotalKanji.length || KANJI.length;
  const pct = Math.round((targetLearnedCount / totalPoolLen) * 100);
  const remaining = Math.max(0, totalPoolLen - targetLearnedCount);
  const upcoming = targetTotalKanji.filter((k) => !state.learned.includes(k.char)).slice(0, 8);
  const streakCount = streak();
  const dueList = (typeof srsDueKanji === "function") ? srsDueKanji() : [];
  const user = window.firebaseSync?.currentUser;
  const fullName = (user && user.displayName) || (state && state.userName) || "";
  const firstName = fullName.trim() ? fullName.trim().split(/\s+/)[0] : "";

  return `
    <div class="home-head">
      <span class="eyebrow">${greetingText()}${firstName ? ` · ${escapeHtml(firstName)}` : ""}</span>
      <h2>${firstName ? `${escapeHtml(firstName)}'s daily kanji` : "Your daily kanji"}</h2>
      <p>${firstName ? `স্বাগতম ${escapeHtml(fullName)} — আপনার নির্বাচিত ${selectedLevels.join(" + ")} লেভেল থেকে আজকের কাঞ্জি দেখানো হচ্ছে।` : `আপনার নির্বাচিত ${selectedLevels.join(" + ")} লেভেল থেকে আজকের কাঞ্জি দেখানো হচ্ছে।`}</p>
    </div>

    ${homeAccountBarMarkup()}

    ${heroCardMarkup()}

    <div class="stat-row">
      <div class="stat"><span class="stat-value">${learned.length}</span><span class="stat-label">Learned</span></div>
      <div class="stat"><span class="stat-value">${streakCount}</span><span class="stat-label">Day streak</span></div>
      <div class="stat"><span class="stat-value">${accuracy()}%</span><span class="stat-label">Quiz accuracy</span></div>
    </div>

    <section class="srs-card ${dueList.length ? "is-due" : ""}">
      <div class="srs-head">
        <span class="srs-badge">${icon(dueList.length ? "refresh" : "check", 13)} Spaced Repetition (SRS)</span>
        <span class="small muted">${dueList.length} due</span>
      </div>
      <h3>${dueList.length ? "আজকের রিভিশন প্রস্তুত" : "সব রিভিশন সম্পন্ন!"}</h3>
      <p>${dueList.length ? "ভুলে যাওয়ার আগেই এই কাঞ্জিগুলো রিভিশন দিয়ে স্মৃতিতে স্থায়ী করুন।" : "দারুন! আজকের মতো সব রিভিশন শেষ। নতুন কাঞ্জি শিখুন অথবা কুইজ খেলুন।"}</p>
      
      <div class="srs-dashboard-grid">
        ${(() => {
          const sc = (typeof srsStageCounts === "function") ? srsStageCounts() : { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
          const apprentice = (sc[1] || 0) + (sc[2] || 0);
          const guru = sc[3] || 0;
          const master = sc[4] || 0;
          const enlightened = sc[5] || 0;
          const burned = sc[6] || 0;
          return `
            <div class="srs-dash-item teal">
              <strong>${apprentice}</strong>
              <span>শিক্ষানবিস</span>
            </div>
            <div class="srs-dash-item lav">
              <strong>${guru}</strong>
              <span>গুরু</span>
            </div>
            <div class="srs-dash-item amber">
              <strong>${master}</strong>
              <span>ওস্তাদ</span>
            </div>
            <div class="srs-dash-item coral">
              <strong>${enlightened}</strong>
              <span>সিদ্ধহস্ত</span>
            </div>
            <div class="srs-dash-item gold">
              <strong>${burned}</strong>
              <span>স্থায়ী স্মৃতি</span>
            </div>
          `;
        })()}
      </div>

      ${dueList.length ? `
        <div class="srs-chips">
          ${dueList.slice(0, 8).map((k) => `<span class="srs-chip" lang="ja">${k.char}</span>`).join("")}
          ${dueList.length > 8 ? `<span class="small muted">+${dueList.length - 8} more</span>` : ""}
        </div>
        <button class="btn primary wide" data-action="start-srs-review">
          ${icon("sparkles", 16)} Start Review · রিভিশন শুরু করুন (${dueList.length})
        </button>` : ""}
    </section>

    <section class="progress-card">
      <div class="ring" style="--p:${pct}">
        <div class="ring-inner"><strong>${pct}%</strong><span>of ${totalPoolLen}</span></div>
      </div>
      <div class="progress-copy">
        <h3>${remaining === 0 ? `${selectedLevels.join(" + ")} সম্পন্ন!` : `লক্ষ্য: ${selectedLevels.join(" + ")}`}</h3>
        <p>${remaining === 0 ? "আপনার নির্বাচিত লেভেলের সব কাঞ্জি শেখা শেষ! নতুন লেভেল যোগ করুন।" : `${selectedLevels.join(" ও ")} লেভেলে আরও ${remaining}টি কাঞ্জি বাকি আছে (${targetLearnedCount}/${totalPoolLen})।`}</p>
        <span class="level-badge N4">${currentRank(learned.length)}</span>
      </div>
    </section>

    <section class="section up-next-section">
      <div class="section-head">
        <h3>Up next (${selectedLevels.join(" · ")})</h3>
        <button class="text-link" data-action="see-all">See all ${icon("arrowRight", 14)}</button>
      </div>
      ${upcoming.length ? `
        <div class="hscroll">
          ${upcoming.map((k) => `
            <button class="mini-card" data-action="open-kanji" data-char="${k.char}" aria-label="${k.char}, ${primaryMeaning(k)}${secondaryMeaning(k) ? ", " + secondaryMeaning(k) : ""}">
              <span class="mini-char" lang="ja">${k.char}</span>
              <span class="mini-meaning">${primaryMeaning(k)}</span>
              <span class="mini-strokes">${k.level} · ${strokesText(k.strokes)}</span>
            </button>`).join("")}
        </div>` : `
        <div class="empty-state">
          <span class="empty-emoji">完</span>
          <strong>Deck complete</strong>
          <p>Every kanji in your selected levels is marked as learned.</p>
        </div>`}
    </section>

    <section class="section levels-section">
      <div class="section-head">
        <h3>Levels</h3>
        <span class="small muted">JLPT</span>
      </div>
      <div class="level-list">${levelRows()}</div>
    </section>
  `;
}

function filteredKanji() {
  const q = searchQuery.trim().toLowerCase();
  const goalSet = new Set((typeof activeStudyLevels === "function") ? activeStudyLevels() : ["N5", "N4"]);
  return KANJI.filter((k) => {
    if (browseFilter === "saved" && !state.favorites.includes(k.char)) return false;
    if (browseFilter === "goal" && !goalSet.has(k.level)) return false;
    if (browseFilter !== "all" && browseFilter !== "saved" && browseFilter !== "goal" && k.level !== browseFilter) return false;
    if (browseCategory !== "all" && !(k.categories || []).includes(browseCategory)) return false;
    if (!q) return true;
    const haystack = searchBlob(k);
    return haystack.includes(q);
  });
}

function kanjiCardMarkup(k, idx = 0) {
  const fav = state.favorites.includes(k.char);
  const learned = state.learned.includes(k.char);
  const srs = (learned && typeof srsInfoForChar === "function") ? srsInfoForChar(k.char) : null;
  const delay = Math.min(idx % 24, 18) * 12;
  return `
    <button class="kanji-card kc-reveal" style="--kc-delay:${delay}ms" data-action="open-kanji" data-char="${k.char}" aria-label="${k.char}, ${primaryMeaning(k)}${secondaryMeaning(k) ? ", " + secondaryMeaning(k) : ""}, JLPT ${k.level}">
      <span class="kc-top">
        <span class="level-dot ${k.level}"></span>
        ${srs ? `<span class="kc-srs-badge ${srs.color}">${srs.nameBn || `ধাপ ${srs.stage}`}</span>` : ""}
        ${fav ? `<span class="kc-fav">${icon("starFilled", 12)}</span>` : ""}
      </span>
      <span class="kc-char" lang="ja">${k.char}</span>
      <span class="kc-meaning">${primaryMeaning(k)}</span>
      ${learned ? `<span class="kc-learned">${icon("check", 10)}</span>` : ""}
    </button>`;
}

function kanjiSkeletonCardMarkup(idx = 0, extraClass = "") {
  const delay = (idx % 12) * 40;
  return `
    <div class="kanji-card kanji-skeleton ${extraClass}" style="--sk-delay:${delay}ms" aria-hidden="true">
      <span class="kc-top">
        <span class="sk-bone sk-dot"></span>
        <span class="sk-bone sk-badge"></span>
      </span>
      <span class="sk-bone sk-char"></span>
      <span class="sk-bone sk-meaning"></span>
    </div>`;
}

function kanjiSkeletonMarkup(count = 24, extraClass = "") {
  const cards = [];
  for (let i = 0; i < count; i++) {
    cards.push(kanjiSkeletonCardMarkup(i, extraClass));
  }
  return cards.join("");
}

function kanjiGridMarkup(fullList) {
  const list = fullList || filteredKanji();
  if (!list.length) {
    const saved = browseFilter === "saved";
    return `
      <div class="empty-state" style="grid-column:1/-1">
        <span class="empty-emoji">漢</span>
        <strong>${saved ? "Nothing saved yet" : "No kanji found"}</strong>
        <p>${saved ? "Tap the star on any kanji to build your own review deck." : browseCategory !== "all" ? "Try another category, level or search word." : "Try another word, reading or level filter."}</p>
      </div>`;
  }
  const limit = (typeof kanjiLimit === "number" && kanjiLimit > 0) ? kanjiLimit : 72;
  const shown = list.slice(0, limit);
  return shown.map((k, idx) => kanjiCardMarkup(k, idx)).join("");
}

function syncKanjiPaginationUI(list) {
  const limit = (typeof kanjiLimit === "number" && kanjiLimit > 0) ? kanjiLimit : 72;
  const shownCount = Math.min(list.length, limit);
  const remaining = Math.max(0, list.length - shownCount);

  const count = document.getElementById("kanji-count");
  if (count) {
    count.textContent = list.length > shownCount
      ? `Showing ${shownCount} of ${list.length} kanji${searchQuery ? " found" : ""}`
      : `${list.length} kanji${searchQuery ? " found" : ""}`;
  }

  const topicCountEl = document.getElementById("kanji-topic-count");
  if (topicCountEl) {
    const catCount = KANJI.filter((k) => browseCategory === "all" || (k.categories || []).includes(browseCategory)).length;
    topicCountEl.textContent = `${catCount} kanji`;
  }

  const wrap = document.getElementById("kanji-more-wrap");
  if (wrap) {
    wrap.classList.toggle("hidden", remaining === 0);
  }
  const shownLabel = document.getElementById("kanji-shown-label");
  if (shownLabel) {
    shownLabel.textContent = `${shownCount} / ${list.length} kanji loaded`;
  }
  const moreBtn = document.getElementById("kanji-more");
  if (moreBtn) {
    const nextBatch = Math.min(72, remaining);
    moreBtn.disabled = false;
    moreBtn.innerHTML = `<span>আরও ${nextBatch}টি কাঞ্জি দেখুন (${remaining}টি বাকি)</span>${icon("arrowRight", 15)}`;
  }
}

let kanjiHydrateTimer = null;

function scheduleKanjiHydration(delayMs = 150) {
  if (kanjiHydrateTimer) {
    clearTimeout(kanjiHydrateTimer);
    kanjiHydrateTimer = null;
  }
  kanjiHydrateTimer = setTimeout(() => {
    kanjiHydrateTimer = null;
    const grid = document.getElementById("kanji-grid");
    if (!grid) return;
    const list = filteredKanji();
    grid.innerHTML = kanjiGridMarkup(list);
    grid.setAttribute("aria-busy", "false");
    syncKanjiPaginationUI(list);
    if (typeof setupKanjiInfiniteScroll === "function") {
      setupKanjiInfiniteScroll();
    }
  }, delayMs);
}

function renderKanjiGrid(options = {}) {
  const list = filteredKanji();
  const grid = document.getElementById("kanji-grid");
  const useSkeleton = options.showSkeleton !== false && list.length > 0 && typeof window !== "undefined";
  if (grid) {
    if (useSkeleton) {
      const skCount = Math.min(24, list.length);
      grid.setAttribute("aria-busy", "true");
      grid.innerHTML = kanjiSkeletonMarkup(skCount);
      syncKanjiPaginationUI(list);
      scheduleKanjiHydration(typeof options.delay === "number" ? options.delay : 140);
      return;
    }
    grid.setAttribute("aria-busy", "false");
    grid.innerHTML = kanjiGridMarkup(list);
  }
  syncKanjiPaginationUI(list);
  if (typeof setupKanjiInfiniteScroll === "function") {
    setupKanjiInfiniteScroll();
  }
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "N5", label: "N5" },
  { id: "N4", label: "N4" },
  { id: "N3", label: "N3" },
  { id: "N2", label: "N2" },
  { id: "N1", label: "N1" },
  { id: "saved", label: "Saved", starred: true },
];

function renderBrowse() {
  const list = filteredKanji();
  const limit = (typeof kanjiLimit === "number" && kanjiLimit > 0) ? kanjiLimit : 72;
  const shownCount = Math.min(list.length, limit);
  const remaining = Math.max(0, list.length - shownCount);
  const nextBatch = Math.min(72, remaining);
  const categoryCount = KANJI.filter((k) => browseCategory === "all" || (k.categories || []).includes(browseCategory)).length;
  const useInitialSkeleton = list.length > 0 && typeof requestAnimationFrame === "function";
  if (useInitialSkeleton) {
    scheduleKanjiHydration(160);
  }


  return `
    <div class="view-head">
      <span class="eyebrow">Library</span>
      <h2>Kanji</h2>
      <p>Browse all ${KANJI.length} entries, filter by level or topic, or search by Bengali / English meaning, reading or vocabulary.</p>
    </div>

    <section class="ref-hub" aria-label="Study tools and reference guides">
      <div class="ref-hub-head">
        <span class="eyebrow">Study Toolkit · সহায়িকা ও টুলস</span>
        <span class="ref-hub-sub">5 interactive modules</span>
      </div>
      <div class="ref-entries">
        <button class="ref-entry radicals" data-action="open-radicals">
          <span class="ref-entry-glyph" lang="ja" aria-hidden="true">部</span>
          <span class="ref-entry-copy">
            <span class="ref-entry-title-row">
              <strong>Radicals</strong>
              <span class="ref-entry-pill" lang="ja">部首 · ${RADICALS.length}</span>
            </span>
            <span class="ref-entry-sub">${RADICALS.length} radicals with Bengali meanings</span>
          </span>
          <span class="ref-entry-arrow" aria-hidden="true">${icon("arrowRight", 16)}</span>
        </button>

        <button class="ref-entry words" data-action="open-words">
          <span class="ref-entry-glyph" lang="ja" aria-hidden="true">語</span>
          <span class="ref-entry-copy">
            <span class="ref-entry-title-row">
              <strong>Words</strong>
              <span class="ref-entry-pill" lang="ja">単語 · ${WORD_LIST.length.toLocaleString()}</span>
            </span>
            <span class="ref-entry-sub">${WORD_LIST.length.toLocaleString()} vocabulary words &amp; audio</span>
          </span>
          <span class="ref-entry-arrow" aria-hidden="true">${icon("arrowRight", 16)}</span>
        </button>

        <button class="ref-entry grammar" data-action="open-grammar">
          <span class="ref-entry-glyph" lang="ja" aria-hidden="true">文</span>
          <span class="ref-entry-copy">
            <span class="ref-entry-title-row">
              <strong>Grammar</strong>
              <span class="ref-entry-pill" lang="ja">文法 · N5–N3</span>
            </span>
            <span class="ref-entry-sub">N5–N3 বাংলা ব্যাকরণ সহায়িকা</span>
          </span>
          <span class="ref-entry-arrow" aria-hidden="true">${icon("arrowRight", 16)}</span>
        </button>

        <button class="ref-entry reader" data-action="open-reader">
          <span class="ref-entry-glyph" lang="ja" aria-hidden="true">読</span>
          <span class="ref-entry-copy">
            <span class="ref-entry-title-row">
              <strong>Text Reader</strong>
              <span class="ref-entry-pill" lang="ja">読解 · Analyzer</span>
            </span>
            <span class="ref-entry-sub">ফুরিগানা ও কাঞ্জি অ্যানালাইজার</span>
          </span>
          <span class="ref-entry-arrow" aria-hidden="true">${icon("arrowRight", 16)}</span>
        </button>

        <button class="ref-entry printable" data-action="open-printable">
          <span class="ref-entry-glyph" lang="ja" aria-hidden="true">練</span>
          <span class="ref-entry-copy">
            <span class="ref-entry-title-row">
              <strong>Printable Grid</strong>
              <span class="ref-entry-pill" lang="ja">原稿用紙 · PDF</span>
            </span>
            <span class="ref-entry-sub">হাতের লেখা অনুশীলনের PDF শিট</span>
          </span>
          <span class="ref-entry-arrow" aria-hidden="true">${icon("arrowRight", 16)}</span>
        </button>
      </div>
    </section>

    <div class="browse-controls-card">
      <div class="search-field">
        ${icon("search", 20)}
        <input id="kanji-search" type="search" value="${escapeHtml(searchQuery)}" placeholder="Search kanji, meaning, reading…" autocomplete="off" spellcheck="false" aria-label="Search kanji" />
        <button class="search-clear ${searchQuery ? "" : "hidden"}" data-action="clear-search" aria-label="Clear search">${icon("x", 16)}</button>
      </div>

      <div class="filter-block">
        <div class="filter-block-head">
          <span class="eyebrow">JLPT Level</span>
          <span class="small muted">Filter by proficiency</span>
        </div>
        <div class="chips" role="tablist" aria-label="Filter kanji">
          <button class="chip ${browseFilter === "goal" ? "active" : ""}" data-action="filter" data-filter="goal" role="tab" aria-selected="${browseFilter === "goal"}">
            🎯 লক্ষ্য (${((typeof activeStudyLevels === "function") ? activeStudyLevels() : ["N5", "N4"]).join("·")})
          </button>
          ${FILTERS.map((f) => `
            <button class="chip ${browseFilter === f.id ? "active" : ""}" data-action="filter" data-filter="${f.id}" role="tab" aria-selected="${browseFilter === f.id}">
              ${f.starred ? icon("star", 14) : ""}${f.label}
            </button>`).join("")}
        </div>
      </div>

      <div class="filter-block">
        <div class="filter-block-head">
          <span class="eyebrow">Topic · বিষয়</span>
          <span class="small muted" id="kanji-topic-count">${categoryCount} kanji</span>
        </div>
        <div class="chips soft-chips" role="group" aria-label="Filter by topic">
          <button class="chip ${browseCategory === "all" ? "active" : ""}" data-action="filter-category" data-category="all" aria-pressed="${browseCategory === "all"}">All topics</button>
          ${KANJI_CATEGORIES.map((c) => `
            <button class="chip ${browseCategory === c.id ? "active" : ""}" data-action="filter-category" data-category="${c.id}" aria-pressed="${browseCategory === c.id}">
              ${escapeHtml(c.bn)}
            </button>`).join("")}
        </div>
      </div>
    </div>

    <div class="results-meta">
      <span id="kanji-count">${list.length > shownCount ? `Showing ${shownCount} of ${list.length} kanji${searchQuery ? " found" : ""}` : `${list.length} kanji${searchQuery ? " found" : ""}`}</span>
      <span>Tap a card to study</span>
    </div>

    <div class="kanji-grid" id="kanji-grid" aria-busy="${useInitialSkeleton ? "true" : "false"}">${useInitialSkeleton ? kanjiSkeletonMarkup(Math.min(24, list.length)) : kanjiGridMarkup(list)}</div>

    <div id="kanji-more-wrap" class="kanji-more-wrap ${remaining > 0 ? "" : "hidden"}">
      <span id="kanji-shown-label" class="kanji-shown-label">${shownCount} / ${list.length} kanji loaded</span>
      <button class="btn tonal kanji-more-btn" id="kanji-more" data-action="kanji-more">
        <span>আরও ${nextBatch}টি কাঞ্জি দেখুন (${remaining}টি বাকি)</span>${icon("arrowRight", 15)}
      </button>
    </div>
  `;
}

/* ---------- Words ---------- */

function wordSearchBlob(w) {
  if (w._searchBlob !== undefined) return w._searchBlob;
  w._searchBlob = [
    w.word, w.reading, w.romaji, w.meaning, w.meaningBn, w.meaningEn, w.type, w.jlpt,
    w.pos, posLabel(w.pos), w.situationBn,
    ...(w.topics || []), ...(w.topics || []).map(topicLabel),
    ...(w.situations || []), ...(w.situations || []).map(situationLabel),
  ].filter(Boolean).join(" ").toLowerCase();
  return w._searchBlob;
}

function filteredWords() {
  const q = wordsQuery.trim().toLowerCase();
  return WORD_LIST.filter((w) => {
    if (wordsLevel !== "all") {
      if (wordsLevel === "N2+") {
        if (w.jlpt !== "N2" && w.jlpt !== "N1") return false;
      } else if (w.jlpt !== wordsLevel) {
        return false;
      }
    }
    if (wordsTopic !== "all" && !(w.topics || []).includes(wordsTopic)) return false;
    if (wordsPos !== "all" && w.pos !== wordsPos) return false;
    if (!q) return true;
    return wordSearchBlob(w).includes(q);
  });
}

function wordListMarkup(list) {
  return list.map((w) => {
    const en = w.meaningBn ? (w.meaningEn || w.meaning) : w.meaningEn;
    return `
      <article class="word-card">
        <span class="word-jp">
          <span class="vocab-word">${w.ruby || escapeHtml(w.word)}</span>
          ${w.reading ? `<span class="vocab-reading">${escapeHtml(w.reading)}</span>` : ""}
        </span>
        <span class="word-body">
          <span class="word-meaning">${escapeHtml(w.meaningBn || w.meaningEn || w.meaning || "")}</span>
          ${en && en !== w.meaningBn ? `<span class="word-en">${escapeHtml(en)}</span>` : ""}
          ${w.situationBn ? `<span class="word-situation">${icon("pin", 11)}<span>${escapeHtml(w.situationBn)}</span></span>` : ""}
        </span>
        <span class="word-tags">
          ${w.jlpt ? `<span class="tag-pill ${w.jlpt}">${w.jlpt}</span>` : ""}
          ${w.pos ? `<span class="tag-pill">${escapeHtml(posLabel(w.pos))}</span>` : ""}
          ${(w.topics || []).slice(0, 2).map((t) => `<span class="tag-pill soft">${escapeHtml(topicLabel(t))}</span>`).join("")}
        </span>
        ${w.tts ? `<button class="speak-btn" data-action="speak" data-text="${escapeHtml(w.tts)}" aria-label="Speak ${escapeHtml(w.word)}">${icon("volume", 16)}</button>` : ""}
      </article>`;
  }).join("");
}

function renderWords() {
  const all = filteredWords();
  const shown = all.slice(0, wordsLimit);
  const remaining = all.length - shown.length;
  const topicCount = WORD_LIST.filter((w) => wordsTopic === "all" || (w.topics || []).includes(wordsTopic)).length;
  const posCount = WORD_LIST.filter((w) => wordsPos === "all" || w.pos === wordsPos).length;

  return `
    <button class="back-link" data-action="open-browse">${icon("arrowLeft", 15)} Kanji library</button>

    <div class="view-head">
      <span class="eyebrow">Library</span>
      <h2>Words</h2>
      <p>Every vocabulary word behind the deck — search, filter by topic, level or part of speech, and tap the speaker to hear it.</p>
    </div>

    <div class="search-field">
      ${icon("search", 20)}
      <input id="word-search" type="search" value="${escapeHtml(wordsQuery)}" placeholder="Search word, reading or meaning…" autocomplete="off" spellcheck="false" aria-label="Search vocabulary" />
      <button class="search-clear ${wordsQuery ? "" : "hidden"}" data-action="clear-word-search" aria-label="Clear search">${icon("x", 16)}</button>
    </div>

    <div class="filter-block">
      <div class="filter-block-head">
        <span class="eyebrow">Level</span>
      </div>
      <div class="chips soft-chips" role="group" aria-label="Filter words by level">
        <button class="chip ${wordsLevel === "all" ? "active" : ""}" data-action="word-level" data-level="all" aria-pressed="${wordsLevel === "all"}">All</button>
        ${WORD_LEVELS.map((level) => `
          <button class="chip ${wordsLevel === level ? "active" : ""}" data-action="word-level" data-level="${level}" aria-pressed="${wordsLevel === level}">${level}</button>`).join("")}
      </div>
    </div>

    <div class="filter-block">
      <div class="filter-block-head">
        <span class="eyebrow">Topic</span>
        <span class="small muted">${topicCount} word${topicCount === 1 ? "" : "s"}</span>
      </div>
      <div class="chips soft-chips" role="group" aria-label="Filter words by topic">
        <button class="chip ${wordsTopic === "all" ? "active" : ""}" data-action="word-topic" data-topic="all" aria-pressed="${wordsTopic === "all"}">All topics</button>
        ${WORD_TOPICS.map((t) => `
          <button class="chip ${wordsTopic === t.id ? "active" : ""}" data-action="word-topic" data-topic="${t.id}" aria-pressed="${wordsTopic === t.id}">${escapeHtml(t.bn)}</button>`).join("")}
      </div>
    </div>

    <div class="filter-block">
      <div class="filter-block-head">
        <span class="eyebrow">Part of speech</span>
        <span class="small muted">${posCount} word${posCount === 1 ? "" : "s"}</span>
      </div>
      <div class="chips soft-chips" role="group" aria-label="Filter words by part of speech">
        <button class="chip ${wordsPos === "all" ? "active" : ""}" data-action="word-pos" data-pos="all" aria-pressed="${wordsPos === "all"}">All grammar</button>
        ${PARTS_OF_SPEECH.map((p) => `
          <button class="chip ${wordsPos === p.id ? "active" : ""}" data-action="word-pos" data-pos="${p.id}" aria-pressed="${wordsPos === p.id}">${escapeHtml(p.bn)}</button>`).join("")}
      </div>
    </div>

    <div class="results-meta">
      <span id="word-count">${all.length} word${all.length === 1 ? "" : "s"}${wordsQuery.trim() ? " found" : ""}</span>
      <span>Tap ${icon("volume", 11)} to listen</span>
    </div>

    <div class="word-list" id="word-list">${wordListMarkup(shown)}</div>

    <div class="empty ${all.length ? "hidden" : ""}" id="word-empty">
      <strong>No word found</strong>
      <p>Try another topic, grammar type or search word.</p>
    </div>

    <button class="btn tonal wide ${remaining > 0 ? "" : "hidden"}" id="words-more" data-action="words-more" style="margin-top:14px">
      Show ${Math.min(remaining, 60)} more · ${remaining} left
    </button>
  `;
}

function radicalFamilyChips(entry) {
  return entry.kanji.map((item) => {
    const inApp = byChar[item.char];
    if (inApp) {
      return `<button class="radical-kanji ${item.level}" data-action="open-kanji" data-char="${item.char}" aria-label="${item.char}, ${escapeHtml(primaryMeaning(inApp))}, JLPT ${item.level}">${item.char}</button>`;
    }
    return `<span class="radical-kanji reference" title="Not in this deck">${item.char}</span>`;
  }).join("");
}

function renderRadicals() {
  const totalRefs = RADICALS.reduce((sum, r) => sum + r.kanji.length, 0);
  return `
    <button class="back-link" data-action="open-browse">${icon("arrowLeft", 15)} Kanji library</button>

    <div class="view-head">
      <span class="eyebrow">Reference</span>
      <h2>Radicals</h2>
      <p>All ${RADICALS.length} Kangxi radicals with Bengali meanings. Tap a radical to see the kanji built around it.</p>
    </div>

    <div class="search-field">
      ${icon("search", 20)}
      <input id="radical-search" type="search" value="${escapeHtml(radicalQuery)}" placeholder="Search radical, meaning, reading or number…" autocomplete="off" spellcheck="false" aria-label="Search radicals" />
      <button class="search-clear ${radicalQuery ? "" : "hidden"}" data-action="clear-radical-search" aria-label="Clear radical search">${icon("x", 16)}</button>
    </div>

    <div class="results-meta">
      <span id="radical-count">${RADICALS.length} radicals</span>
      <span>${totalRefs} refs · colored = in deck</span>
    </div>

    <div class="radical-list" id="radical-list">
      ${RADICALS.map((r) => `
        <details class="radical-card" data-number="${r.number}" data-search="${escapeHtml(radicalSearchBlob(r))}">
          <summary>
            <span class="radical-glyph" aria-hidden="true">${r.char}</span>
            <span class="radical-copy">
              <strong>${escapeHtml(r.meaningBn)}</strong>
              <span>#${String(r.number).padStart(3, "0")} · ${strokesText(r.strokes)} · ${r.kanji.length} kanji</span>
            </span>
            <span class="radical-chevron" aria-hidden="true">${icon("chevron", 16)}</span>
          </summary>
          <div class="radical-body">
            <p class="radical-readings">
              ${r.reading ? `<span>${escapeHtml(r.reading)}</span>` : ""}
              ${r.romaji ? `<span>${escapeHtml(r.romaji)}</span>` : ""}
              ${r.variant ? `<span class="radical-variant">variant ${escapeHtml(r.variant)}</span>` : ""}
            </p>
            <div class="radical-family">${radicalFamilyChips(r)}</div>
          </div>
        </details>`).join("")}
    </div>

    <div class="empty hidden" id="radical-empty">
      <strong>No radical found</strong>
      <p>Try a radical character, Bengali meaning, reading or number.</p>
    </div>
  `;
}

let grammarLevel = "all";
let grammarQuery = "";
let grammarTab = "list"; // "list" | "guide" | "traps"

function renderConjugationGuide() {
  return `
    <div class="guide-container" style="display:flex;flex-direction:column;gap:18px">
      
      <!-- Intro Banner -->
      <div style="background:linear-gradient(135deg, rgba(143,231,198,0.15) 0%, rgba(100,181,246,0.1) 100%);border:1px solid var(--border);border-radius:20px;padding:20px 22px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:24px">📖</span>
          <h3 style="margin:0;font-size:18px;color:var(--text);font-weight:700">রূপান্তরই জাপানি ভাষার আসল প্রাণ!</h3>
        </div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:var(--text-2)">
          জাপানি ব্যাকরণে মুখস্থ করার চেয়ে রূপান্তরের ছন্দটা (Conjugation Pattern) একবার বুঝে নেওয়া হাজার গুণ সহজ। এই সহায়িকায় ক্রিয়াপদ, বিশেষণ ও বিশেষ্যের নিয়মগুলো গল্প, ছড়া এবং বাস্তব উদাহরণের মাধ্যমে সাজানো হয়েছে — যা আয়ত্ত করলে N5 থেকে N3-এর পথ অত্যন্ত সহজ হয়ে যাবে।
        </p>
      </div>

      <!-- Section 1: Verb Groups & 8 Imposters -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon">1</div>
          <div>
            <h3 class="guide-card-title">ক্রিয়াপদের ৩টি গ্রুপ চেনার সহজ গল্প ও রূপান্তর</h3>
            <div class="guide-card-subtitle">Verb Groups (動詞のグループ) ও ছদ্মবেশী ৮টি ফাঁদ</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি ভাষার অভিধানের (Dictionary form) প্রতিটি ক্রিয়াপদ শেষ হয় <strong>'U' (উ) ধ্বনি</strong> দিয়ে। কাজের ধরন ও রূপান্তরের নিয়ম অনুযায়ী এদের তিনটি পরিবার বা গ্রুপে ভাগ করা হয়েছে:
        </p>

        <!-- Verb Groups Explanation -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;margin-bottom:16px">
          
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <strong style="color:var(--primary);font-size:15px">গ্রুপ ১: গোদান (五段動詞)</strong>
              <span class="chip-pill">U-ending</span>
            </div>
            <p style="font-size:13px;line-height:1.5;color:var(--text-2);margin:0 0 8px">
              <strong>"পাঁচ সুরের দল":</strong> রূপান্তরের সময় এদের শেষ ধ্বনি ৫টি স্তরে (a, i, u, e, o) ওঠানামা করে। জাপানি বর্ণমালার ৯টি শেষ অক্ষর নিয়ে এই গ্রুপ গঠিত:
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">
              <span class="chip-pill">う (u)</span>
              <span class="chip-pill">つ (tsu)</span>
              <span class="chip-pill">る (ru)</span>
              <span class="chip-pill">む (mu)</span>
              <span class="chip-pill">ぶ (bu)</span>
              <span class="chip-pill">ぬ (nu)</span>
              <span class="chip-pill">く (ku)</span>
              <span class="chip-pill">ぐ (gu)</span>
              <span class="chip-pill">す (su)</span>
            </div>
            <div style="font-size:12px;color:var(--muted)">
              যেমন: <code>買う (kau)</code>, <code>待つ (matsu)</code>, <code>飲む (nomu)</code>, <code>書く (kaku)</code>, <code>話す (hanasu)</code>।
            </div>
          </div>

          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <strong style="color:#64b5f6;font-size:15px">গ্রুপ ২: ইচিদান (一段動詞)</strong>
              <span class="chip-pill">iru / eru</span>
            </div>
            <p style="font-size:13px;line-height:1.5;color:var(--text-2);margin:0 0 8px">
              <strong>"ভদ্র ও সহজ দল":</strong> এদের চেনার সোনার কাঠি মাত্র দুটি:
              <br>১. শেষ অক্ষরটি <strong>অবশ্যই 'る' (ru)</strong> হবে।
              <br>২. তার আগের অক্ষরের ধ্বনি <strong>'ই' (I) বা 'এ' (E)</strong> হবে!
            </p>
            <p style="font-size:12.5px;color:var(--text-2);margin:0 0 8px">
              রূপান্তর সবচেয়ে সহজ: শুধু শেষ <code>る</code> মুছে যা খুশি লাগান!
            </p>
            <div style="font-size:12px;color:var(--muted)">
              যেমন: <code>食べる (taberu)</code> [be = e sound], <code>見る (miru)</code> [mi = i sound], <code>起きる (okiru)</code>।
            </div>
          </div>

          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <strong style="color:#ffb74d;font-size:15px">গ্রুপ ৩: অনিয়মিত (不規則)</strong>
              <span class="chip-pill">মাত্র ২টি!</span>
            </div>
            <p style="font-size:13px;line-height:1.5;color:var(--text-2);margin:0 0 8px">
              <strong>"বেয়াড়া দুই বন্ধু":</strong> পুরো জাপানি ডিকশনারিতে মাত্র দুটি শব্দ এই গ্রুপে আছে। এরা কোনো সাধারণ নিয়ম মানে না, এদের সরাসরি মনে রাখতে হয়:
            </p>
            <div style="font-size:13px;line-height:1.6;color:var(--text)">
              1. <strong>する (suru)</strong> - করা ➔ <code>します</code>, <code>して</code>, <code>した</code>, <code>しない</code>
              <br>2. <strong>来る (くる - kuru)</strong> - আসা ➔ <code>きます</code>, <code>きて</code>, <code>きた</code>, <code>こない</code>
            </div>
          </div>

        </div>

        <!-- The 8 Imposters Warning -->
        <div class="guide-callout warning">
          <div style="display:flex;align-items:center;gap:8px;font-weight:700;color:#ff9800;font-size:14px;margin-bottom:6px">
            ${icon("alert", 16)} <span>সাবধান! ছদ্মবেশী ৮টি ট্র্যাপ (Group 1 Imposters)</span>
          </div>
          <p style="margin:0 0 10px;font-size:13px">
            এই ৮টি শব্দের শেষে <strong>る</strong> আছে এবং আগের ধ্বনি <strong>I বা E</strong>, দেখতে অবিকল গ্রুপ ২-এর মতো! কিন্তু রক্তের দিক থেকে এরা খাঁটি <strong>গ্রুপ ১ (Godan)</strong>! পরীক্ষায় শিক্ষার্থীদের ফাঁদে ফেলতে এগুলোই বারবার দেওয়া হয়:
          </p>
          <div class="guide-table-wrap">
            <table class="guide-table">
              <thead>
                <tr>
                  <th>ক্রিয়াপদ</th>
                  <th>অর্থ</th>
                  <th>কেন ট্র্যাপ?</th>
                  <th>মাসু ফর্ম (Masu)</th>
                  <th>তে-ফর্ম (Te)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">帰る</strong> (かえる)</td>
                  <td>ফেরা / Return</td>
                  <td>'e' + ru দেখে গ্রুপ ২ মনে হয়</td>
                  <td><code style="color:var(--primary)">帰ります</code> (❌ 帰ます নয়)</td>
                  <td><code style="color:var(--primary)">帰って</code> (❌ 帰て নয়)</td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">走る</strong> (はしる)</td>
                  <td>দৌড়ানো / Run</td>
                  <td>'i' + ru দেখে গ্রুপ ২ মনে হয়</td>
                  <td><code style="color:var(--primary)">走ります</code></td>
                  <td><code style="color:var(--primary)">走って</code></td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">入る</strong> (はいる)</td>
                  <td>প্রবেশ করা / Enter</td>
                  <td>'i' + ru দেখে গ্রুপ ২ মনে হয়</td>
                  <td><code style="color:var(--primary)">入ります</code></td>
                  <td><code style="color:var(--primary)">入って</code></td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">切る</strong> (きる)</td>
                  <td>কাটা / Cut</td>
                  <td>জামা পরা <code>着る</code> (Group 2) এর যমজ!</td>
                  <td><code style="color:var(--primary)">切ります</code> (জামা পরা: 着ます)</td>
                  <td><code style="color:var(--primary)">切って</code> (জামা পরা: 着て)</td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">知る</strong> (しる)</td>
                  <td>জানা / Know</td>
                  <td>'i' + ru গ্রুপ ১</td>
                  <td><code style="color:var(--primary)">知ります</code></td>
                  <td><code style="color:var(--primary)">知って</code></td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">喋る</strong> (しゃべる)</td>
                  <td>আড্ডা দেওয়া / Chat</td>
                  <td>'e' + ru গ্রুপ ১</td>
                  <td><code style="color:var(--primary)">喋ります</code></td>
                  <td><code style="color:var(--primary)">喋って</code></td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">要る</strong> (いる)</td>
                  <td>দরকার হওয়া / Need</td>
                  <td>থাকা <code>居る</code> (Group 2) এর যমজ!</td>
                  <td><code style="color:var(--primary)">要ります</code> (থাকা: 居ます)</td>
                  <td><code style="color:var(--primary)">要って</code> (থাকা: 居て)</td>
                </tr>
                <tr>
                  <td><strong lang="ja" style="font-size:15px">減る</strong> (へる)</td>
                  <td>কমে যাওয়া / Decrease</td>
                  <td>'e' + ru গ্রুপ ১</td>
                  <td><code style="color:var(--primary)">減ります</code></td>
                  <td><code style="color:var(--primary)">減って</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </article>

      <!-- Section 2: Te-form & Ta-form Song -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon">2</div>
          <div>
            <h3 class="guide-card-title">তে-ফর্ম (て形) ও তা-ফর্মের জাদুকরী ছড়া</h3>
            <div class="guide-card-subtitle">The Te-Form Song (て形の歌) ও অতীত রূপান্তরের গোপন রহস্য</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি কিন্ডারগার্টেন এবং ভাষা শিক্ষার ক্লাসে এই ছড়াটি গেয়ে গেয়ে লাখ লাখ শিক্ষার্থী এক বসাতেই তে-ফর্ম শিখে ফেলে। এটি সুর দিয়ে মনে রাখুন:
        </p>

        <!-- Rhyme box -->
        <div class="rhyme-box">
          <div style="font-weight:700;color:var(--primary);margin-bottom:8px;font-size:15px">
            🎵 তে-ফর্মের সুরের জাদু (The Te-Form Rhyme):
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:10px">
            <div>🎶 <strong>う・つ・る</strong> (উ-ৎসু-রু) ➔ <code style="color:var(--primary);font-size:15px">って (tte)</code></div>
            <div>🎶 <strong>む・ぶ・ぬ</strong> (মু-বু-নু) ➔ <code style="color:var(--primary);font-size:15px">んで (nde)</code></div>
            <div>🎶 <strong>く</strong> (কু) ➔ <code style="color:var(--primary);font-size:15px">いて (ite)</code></div>
            <div>🎶 <strong>ぐ</strong> (গু) ➔ <code style="color:var(--primary);font-size:15px">いで (ide)</code></div>
            <div>🎶 <strong>す</strong> (সু) ➔ <code style="color:var(--primary);font-size:15px">して (shite)</code></div>
            <div>✨ <strong>গ্রুপ ২</strong> ➔ <code>る</code> ফেলে দিয়ে সোজা <code>て</code>!</div>
            <div>✨ <strong>গ্রুপ ৩</strong> ➔ <code>する</code> হয় <code>して</code>, <code>くる</code> হয় <code>きて</code>!</div>
          </div>
        </div>

        <!-- Super Exception Alert -->
        <div class="guide-callout danger">
          <div style="display:flex;align-items:center;gap:8px;font-weight:700;color:#f44336;font-size:14px;margin-bottom:4px">
            ${icon("alert", 16)} <span>চরম ব্যতিক্রম ফাঁদ (Super Exception Alert)</span>
          </div>
          <div style="font-size:13px;line-height:1.6">
            <strong>行く (いく - যাওয়া):</strong> শেষ অক্ষর 'く' থাকা সত্ত্বেও নিয়ম ভেঙে এটি <code>いいて</code> হবে না! এটি হবে <strong>「いって」 (itte)</strong>! JLPT N5 ও N4 পরীক্ষায় এটি নিয়মিত আসে।
          </div>
        </div>

        <!-- Ta form tip -->
        <div class="guide-callout success">
          <div style="font-weight:700;color:#4caf50;font-size:14px;margin-bottom:4px">
            💡 তা-ফর্ম (Ta-form - অতীত কাল) শেখার শর্টকাট:
          </div>
          <div style="font-size:13px;line-height:1.6">
            তে-ফর্ম যার মুখস্থ, তার তা-ফর্ম শেখা শেষ! শুধু <strong>'て'</strong> এর জায়গায় <strong>'た'</strong> এবং <strong>'で'</strong> এর জায়গায় <strong>'だ'</strong> বসিয়ে দিন!
            <br>যেমন: <code>買って (katte)</code> ➔ <code>買った (katta - কিনেছিলাম)</code>, <code>飲んで (nonde)</code> ➔ <code>飲んだ (nonda - পান করেছিলাম)</code>, <code>行って (itte)</code> ➔ <code>行った (itta - গিয়েছিলাম)</code>।
          </div>
        </div>

        <!-- Matrix Table -->
        <div class="guide-table-wrap">
          <table class="guide-table">
            <thead>
              <tr>
                <th>শেষ ধ্বনি</th>
                <th>অভিধান রূপ</th>
                <th>মাসু রূপ (Masu)</th>
                <th>তে-ফর্ম (Te)</th>
                <th>তা-ফর্ম (Ta - Past)</th>
                <th>নাই-ফর্ম (Nai - Neg)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>う</strong></td>
                <td><span lang="ja">買う</span> (কেনা)</td>
                <td>買います</td>
                <td><strong style="color:var(--primary)" lang="ja">買って</strong></td>
                <td>買った</td>
                <td>買わない</td>
              </tr>
              <tr>
                <td><strong>つ</strong></td>
                <td><span lang="ja">待つ</span> (অপেক্ষা)</td>
                <td>待ちます</td>
                <td><strong style="color:var(--primary)" lang="ja">待って</strong></td>
                <td>待った</td>
                <td>待たない</td>
              </tr>
              <tr>
                <td><strong>る</strong> (G1)</td>
                <td><span lang="ja">取る</span> (নেওয়া)</td>
                <td>取ります</td>
                <td><strong style="color:var(--primary)" lang="ja">取って</strong></td>
                <td>取った</td>
                <td>取らない</td>
              </tr>
              <tr>
                <td><strong>む</strong></td>
                <td><span lang="ja">飲む</span> (পান করা)</td>
                <td>飲みます</td>
                <td><strong style="color:var(--primary)" lang="ja">飲んで</strong></td>
                <td>飲んだ</td>
                <td>飲まない</td>
              </tr>
              <tr>
                <td><strong>ぶ</strong></td>
                <td><span lang="ja">遊ぶ</span> (খেলা)</td>
                <td>遊びます</td>
                <td><strong style="color:var(--primary)" lang="ja">遊んで</strong></td>
                <td>遊んだ</td>
                <td>遊ばない</td>
              </tr>
              <tr>
                <td><strong>ぬ</strong></td>
                <td><span lang="ja">死ぬ</span> (মারা যাওয়া)</td>
                <td>死にます</td>
                <td><strong style="color:var(--primary)" lang="ja">死んで</strong></td>
                <td>死んだ</td>
                <td>死なない</td>
              </tr>
              <tr>
                <td><strong>く</strong></td>
                <td><span lang="ja">書く</span> (লেখা)</td>
                <td>書きます</td>
                <td><strong style="color:var(--primary)" lang="ja">書いて</strong></td>
                <td>書いた</td>
                <td>書かない</td>
              </tr>
              <tr>
                <td><strong>ぐ</strong></td>
                <td><span lang="ja">泳ぐ</span> (সাঁতার)</td>
                <td>泳ぎます</td>
                <td><strong style="color:var(--primary)" lang="ja">泳いで</strong></td>
                <td>泳いだ</td>
                <td>泳がない</td>
              </tr>
              <tr>
                <td><strong>す</strong></td>
                <td><span lang="ja">話す</span> (কথা বলা)</td>
                <td>話します</td>
                <td><strong style="color:var(--primary)" lang="ja">話して</strong></td>
                <td>話した</td>
                <td>話さない</td>
              </tr>
              <tr style="background:rgba(100,181,246,0.06)">
                <td><strong>G2</strong> (iru/eru)</td>
                <td><span lang="ja">食べる</span> (খাওয়া)</td>
                <td>食べます</td>
                <td><strong style="color:#64b5f6" lang="ja">食べて</strong></td>
                <td>食べた</td>
                <td>食べない</td>
              </tr>
              <tr style="background:rgba(255,183,77,0.06)">
                <td><strong>G3</strong> (suru)</td>
                <td><span lang="ja">する</span> (করা)</td>
                <td>します</td>
                <td><strong style="color:#ffb74d" lang="ja">して</strong></td>
                <td>した</td>
                <td>しない</td>
              </tr>
              <tr style="background:rgba(255,183,77,0.06)">
                <td><strong>G3</strong> (kuru)</td>
                <td><span lang="ja">来る</span> (আসা)</td>
                <td>来ます (きます)</td>
                <td><strong style="color:#ffb74d" lang="ja">来て (きて)</strong></td>
                <td>来た (きた)</td>
                <td>来ない (こない)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- Section 3: Adjective Transformations -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon">3</div>
          <div>
            <h3 class="guide-card-title">বিশেষণ রূপান্তরের নিয়মাবলি ও 'いい' ফাঁদ</h3>
            <div class="guide-card-subtitle">い-বিশেষণ (True Adjective) বনাম な-বিশেষণ (Nominal Adjective)</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি ভাষায় বিশেষণ দুই জাতের। এদের রূপান্তর একদম আলাদা নিয়মে চলে:
        </p>

        <!-- Adjectives comparison -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:14px;margin-bottom:14px">
          
          <!-- I-adj -->
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px">
            <h4 style="margin:0 0 8px;color:var(--primary);font-size:16px">১. い-বিশেষণ (True Adjectives)</h4>
            <p style="font-size:13px;line-height:1.5;color:var(--text-2);margin:0 0 10px">
              শব্দের শেষ অক্ষরটি <strong>い</strong> (যেমন: 高い, 寒い, 暑い, 美味しい)। শেষ 'い' অক্ষরটি পরিবর্তন করে ৪টি রূপ তৈরি হয়:
            </p>
            <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.8;color:var(--text)">
              <li><strong>বর্তমান হ্যাঁ (+):</strong> <code>暑い</code> (গরম)</li>
              <li><strong>বর্তমান না (-):</strong> い তুলে <strong>くない</strong> ➔ <code>暑くない</code> (গরম নয়)</li>
              <li><strong>অতীত হ্যাঁ (+):</strong> い তুলে <strong>かった</strong> ➔ <code>暑かった</code> (গরম ছিল)</li>
              <li><strong>অতীত না (-):</strong> い তুলে <strong>くなかった</strong> ➔ <code>暑くなかった</code> (গরম ছিল না)</li>
              <li><strong>সংযুক্তি (এবং):</strong> い তুলে <strong>くて</strong> ➔ <code>暑くて</code> (গরম এবং...)</li>
              <li><strong>ক্রিয়া-বিশেষণ (ভাবে):</strong> い তুলে <strong>く</strong> ➔ <code>暑くなる</code> (গরম হয়ে যাওয়া)</li>
            </ul>
          </div>

          <!-- Na-adj -->
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px">
            <h4 style="margin:0 0 8px;color:#64b5f6;font-size:16px">২. な-বিশেষণ (Nominal Adjectives)</h4>
            <p style="font-size:13px;line-height:1.5;color:var(--text-2);margin:0 0 10px">
              এরা বিশেষণের কাজ করলেও ব্যাকরণে বিশেষ্যের মতো আচরণ করে (যেমন: 静か, きれい, 元気, 親切)। বিশেষ্যের সাথে বসলে মাঝখানে <strong>な</strong> লাগে!
            </p>
            <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.8;color:var(--text)">
              <li><strong>বিশেষ্যের সাথে:</strong> <code>きれいな花</code> (সুন্দর ফুল), <code>静かな部屋</code> (শান্ত রুম)</li>
              <li><strong>বর্তমান হ্যাঁ (+):</strong> <code>静かです / だ</code> (শান্ত)</li>
              <li><strong>বর্তমান না (-):</strong> <code>静かじゃない / ではありません</code></li>
              <li><strong>অতীত হ্যাঁ (+):</strong> <code>静かでした / だった</code> (শান্ত ছিল)</li>
              <li><strong>অতীত না (-):</strong> <code>静かじゃなかった</code> (শান্ত ছিল না)</li>
              <li><strong>সংযুক্তি (এবং):</strong> <strong>で</strong> ➔ <code>静かで、きれいです</code> (শান্ত এবং সুন্দর)</li>
            </ul>
          </div>

        </div>

        <!-- The II Trap -->
        <div class="guide-callout danger">
          <div style="display:flex;align-items:center;gap:8px;font-weight:700;color:#f44336;font-size:14px;margin-bottom:6px">
            ${icon("alert", 16)} <span>শতাব্দীর সেরা ট্র্যাপ: 「いい」 (ভালো)</span>
          </div>
          <div style="font-size:13px;line-height:1.6">
            <code>いい</code> শব্দটি এসেছে প্রাচীন জাপানি শব্দ <strong>「よい」 (yoi)</strong> থেকে! তাই বর্তমান হ্যাঁ-বোধক ছাড়া আর সব রূপান্তরে <code>よい</code>-এর ওপর সূত্র প্রয়োগ করতে হবে। পরীক্ষায় <code>いくない</code> লিখলেই শূন্য!
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
              <span class="chip-pill" style="border-color:#4caf50;color:#4caf50">না-বোধক: よくない (❌ いくない নয়)</span>
              <span class="chip-pill" style="border-color:#4caf50;color:#4caf50">অতীত: よかった (❌ いかった নয়)</span>
              <span class="chip-pill" style="border-color:#4caf50;color:#4caf50">অতীত না: よくなかった</span>
              <span class="chip-pill" style="border-color:#4caf50;color:#4caf50">সংযুক্তি: よくて</span>
            </div>
          </div>
        </div>

      </article>

      <!-- Section 4: Nouns -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon">4</div>
          <div>
            <h3 class="guide-card-title">বিশেষ্য (Noun) রূপান্তর ও সংযুক্তি নিয়ম</h3>
            <div class="guide-card-subtitle">বিশেষ্য + বিশেষ্য এবং কালের রূপান্তর</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি ভাষায় বিশেষ্যের রূপান্তর হুবহু <strong>な-বিশেষণের মতো</strong> কাজ করে:
        </p>

        <div class="guide-table-wrap">
          <table class="guide-table">
            <thead>
              <tr>
                <th>অবস্থা / কাল</th>
                <th>গঠন</th>
                <th>নম্র রূপ (Polite)</th>
                <th>সাধারণ রূপ (Plain)</th>
                <th>বাংলা অর্থ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>বর্তমান হ্যাঁ (+)</td>
                <td>Noun + です / だ</td>
                <td>学生です</td>
                <td>学生だ</td>
                <td>ছাত্র/ছাত্রী হয়</td>
              </tr>
              <tr>
                <td>বর্তমান না (-)</td>
                <td>Noun + じゃない</td>
                <td>学生じゃありません</td>
                <td>学生じゃない</td>
                <td>ছাত্র/ছাত্রী নয়</td>
              </tr>
              <tr>
                <td>অতীত হ্যাঁ (+)</td>
                <td>Noun + でした / だった</td>
                <td>学生でした</td>
                <td>学生だった</td>
                <td>ছাত্র/ছাত্রী ছিল</td>
              </tr>
              <tr>
                <td>অতীত না (-)</td>
                <td>Noun + じゃなかった</td>
                <td>学生じゃありませんでした</td>
                <td>学生じゃなかった</td>
                <td>ছাত্র/ছাত্রী ছিল না</td>
              </tr>
              <tr>
                <td>সংযুক্তি (এবং)</td>
                <td>Noun + で</td>
                <td colspan="2">学生で、毎朝日本語を勉強しています。</td>
                <td>ছাত্র এবং প্রতিদিন সকালে জাপানি পড়ে।</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="guide-callout success">
          <strong>বিশেষ্য + বিশেষ্য সংযোগের জাদু:</strong> দুটি বিশেষ্যকে একসাথে জুড়তে সবসময় মাঝখানে <strong>「の」</strong> বসে। যেমন: <code>日本</code> (জাপান) + <code>車</code> (গাড়ি) = <code>日本の車</code> (জাপানের গাড়ি)।
        </div>

      </article>

    </div>
  `;
}

function renderGrammarTraps() {
  return `
    <div class="guide-container" style="display:flex;flex-direction:column;gap:18px">
      
      <!-- Intro Banner -->
      <div style="background:linear-gradient(135deg, rgba(244,67,54,0.12) 0%, rgba(255,152,0,0.1) 100%);border:1px solid rgba(244,67,54,0.25);border-radius:20px;padding:20px 22px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:24px">⚠️</span>
          <h3 style="margin:0;font-size:18px;color:var(--text);font-weight:700">JLPT পরীক্ষায় মানুষ যেগুলোতে সবচেয়ে বেশি ভুল করে!</h3>
        </div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:var(--text-2)">
          JLPT N5 থেকে N3 পরীক্ষায় প্রতিবছর পরীক্ষার্থীরা যে প্রশ্নগুলোতে বিভ্রান্ত হয়ে মার্ক হারায় — সেগুলোর গভীরে গিয়ে ৭টি মারাত্মক ফাঁদ (Deadly Traps) এখানে গল্পের মতো ও তুলনামূলক উদাহরণ দিয়ে পরিষ্কার করে দেওয়া হলো।
        </p>
      </div>

      <!-- Trap 1: Wa vs Ga -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#f44336;background:rgba(244,67,54,0.12)">1</div>
          <div>
            <h3 class="guide-card-title">「は」 (Wa) বনাম 「が」 (Ga) — স্পটলাইট কার ওপর?</h3>
            <div class="guide-card-subtitle">জাপানি ভাষার চিরন্তন বিভ্রান্তি ও জাদুকরী সমাধান</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          টর্চলাইটের আলো কল্পনা করুন। বাক্যের কোন অংশে আলো ফেলছেন — সেটাই হলো は ও が এর আসল পার্থক্য:
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;margin-bottom:14px">
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px">
            <strong style="color:var(--primary);font-size:15px">A は B (আলো B-এর ওপর)</strong>
            <p style="font-size:12.5px;color:var(--text-2);margin:6px 0">
              "A সম্পর্কে বলছি (Topic), আসল নতুন খবরটা হলো B!" যেমন: <code>私は田中です</code> (আমি হলাম তানাকা - নামটাই আসল খবর)।
            </p>
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px">
            <strong style="color:#64b5f6;font-size:15px">A が B (আলো A-এর ওপর)</strong>
            <p style="font-size:12.5px;color:var(--text-2);margin:6px 0">
              "আসল নায়ক হলো A! কে কাজটা করেছে? A করেছে!" যেমন: <code>田中さんが来ました</code> (তানাকা সাহেব এসেছেন - তিনিই নায়ক!)।
            </p>
          </div>
        </div>

        <div class="wrong-right-box">
          <div class="wrong-item">
            <span class="comparison-tag-wrong">❌ ভুল (Common Mistake)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">だれは来ましたか？</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">প্রশ্নবোধক শব্দের সাথে は লাগানো কঠোরভাবে নিষিদ্ধ!</div>
          </div>
          <div class="right-item">
            <span class="comparison-tag-right">⭕ সঠিক (JLPT Standard)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">だれが来ましたか？ ➔ 田中さんが来ました。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">প্রশ্নবোধক শব্দ ও তার উত্তরে সবসময় が বসবে!</div>
          </div>
        </div>

        <div class="guide-callout warning">
          <strong>উপবাক্যে (Subordinate Clause) は নিষিদ্ধ:</strong> কোনো নির্ভর বাক্যাংশে (যেমন: <code>〜とき</code>, <code>〜まえに</code>, <code>〜から</code>) ভেতরের কর্তা সবসময় <strong>が</strong> নেবে!
          <br>❌ <code>私は帰った時...</code> নয় ➔ ⭕ <code>私が帰った時、誰もいなかった。</code>
        </div>
      </article>

      <!-- Trap 2: Ni vs De -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#ff9800;background:rgba(255,152,0,0.12)">2</div>
          <div>
            <h3 class="guide-card-title">「に」 (Ni) বনাম 「で」 (De) — স্থান নির্বাচনের মারাত্মক ভুল</h3>
            <div class="guide-card-subtitle">কাজের স্থান (Action) বনাম অস্তিত্বের স্থান (Existence)</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          স্থান বোঝাতে এই দুটি পার্টিকেল ছাত্ররা সবচেয়ে বেশি গুলিয়ে ফেলে:
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;margin-bottom:14px">
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px">
            <strong style="color:var(--primary);font-size:15px">で (কাজের স্থান / Action Location)</strong>
            <p style="font-size:12.5px;color:var(--text-2);margin:6px 0">
              যেখানে মানুষ বা প্রাণী সক্রিয়ভাবে কোনো কর্ম করে।
              <br><code>図書館で勉強する</code> (লাইব্রেরিতে পড়াশোনা করা)।
            </p>
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px">
            <strong style="color:#64b5f6;font-size:15px">に (থাকার স্থান / Static Existence)</strong>
            <p style="font-size:12.5px;color:var(--text-2);margin:6px 0">
              যেখানে কোনো ব্যক্তি বা বস্তু কেবল অবস্থান করে বা থাকে (いる / ある / 住む)।
              <br><code>部屋に猫がいる</code> (রুমে বিড়াল আছে)।
            </p>
          </div>
        </div>

        <div class="wrong-right-box">
          <div class="wrong-item">
            <span class="comparison-tag-wrong">❌ ভুল (পার্টি বা ইভেন্ট ফাঁদ)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">明日、東京にコンサートがある。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">ある দেখে に বসালে শূন্য পাবেন! কনসার্ট কোনো জড়বস্তু নয়!</div>
          </div>
          <div class="right-item">
            <span class="comparison-tag-right">⭕ সঠিক (JLPT Standard)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">明日、東京でコンサートがある。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">কনসার্ট, পার্টি, মিটিং হলো ইভেন্ট বা কর্মযজ্ঞ, তাই で হবে!</div>
          </div>
        </div>
      </article>

      <!-- Trap 3: Ageru vs Kureru vs Morau -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#4caf50;background:rgba(76,175,80,0.12)">3</div>
          <div>
            <h3 class="guide-card-title">「あげる」 / 「くれる」 / 「もらう」 — অনুগ্রহের দিকনির্দেশক কম্পাস</h3>
            <div class="guide-card-subtitle">উপহার ও উপকার আদান-প্রদানের মানসিক মানচিত্র</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি সংস্কৃতিতে সুবিধার দিক (Direction of Benefit) অত্যন্ত স্পর্শকাতর। এই কম্পাসটি মনে রাখুন:
        </p>

        <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:14px">
          <div style="font-size:13.5px;line-height:1.8;color:var(--text)">
            👉 <strong>あげる (বাইরের দিকে):</strong> আমি অন্যকে দিই (বা একজন অপরজনকে দেয়)। <strong>কেউ আমাকে দিলে কখনোই あげる বলা যাবে না!</strong>
            <br>👉 <strong>くれる (ভেতরের দিকে):</strong> কেউ আমাকে বা আমার পরিবারের কাউকে দিলে বা উপকার করলে।
            <br>👉 <strong>もらう (গ্রহীতার চোখ দিয়ে):</strong> আমি বা কেউ অন্য কারও থেকে উপহার/উপকার গ্রহণ করেছি।
          </div>
        </div>

        <div class="wrong-right-box">
          <div class="wrong-item">
            <span class="comparison-tag-wrong">❌ মারাত্মক ভুল (পরীক্ষায় নিয়মিত আসে)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">田中さんが私に本をあげました。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">আমাকে কেউ দিলে あげる বলা জাপানি ব্যাকরণে চরম ভুল!</div>
          </div>
          <div class="right-item">
            <span class="comparison-tag-right">⭕ সঠিক (JLPT Standard)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">田中さんが私に本をくれました。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">আমাকে দিলে সবসময় くれる (kureru) হবে! অথবা もらいました।</div>
          </div>
        </div>

        <div class="guide-callout success">
          <strong>উপকারের রূপান্তর:</strong> কোনো কাজ করে দেওয়ার ক্ষেত্রেও একই নিয়ম খাটে: <code>教えてあげる</code> (আমি শিখিয়ে দেব), <code>教えてくれる</code> (আমাকে শিখিয়ে দেয়), <code>教えてもらう</code> (কারও কাছ থেকে শিখে নেওয়া)।
        </div>
      </article>

      <!-- Trap 4: Transitive vs Intransitive -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#ab47bc;background:rgba(171,71,188,0.12)">4</div>
          <div>
            <h3 class="guide-card-title">「自動詞」 (অকর্মক) বনাম 「他動詞」 (সকর্মক) — কে কাজ করছে?</h3>
            <div class="guide-card-subtitle">স্বয়ংক্রিয় অবস্থা বনাম মানুষের ইচ্ছাকৃত কর্ম</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি ভাষায় একই কাজের দুটি আলাদা রূপ থাকে। কে কাজটা করছে তার ওপর ভিত্তি করে পার্টিকেল ও ক্রিয়া বদলে যায়:
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;margin-bottom:14px">
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px">
            <strong style="color:var(--primary);font-size:15px">他動詞 (Tadoushi - সকর্মক): を</strong>
            <p style="font-size:12.5px;color:var(--text-2);margin:6px 0">
              মানুষ ইচ্ছাকৃতভাবে কোনো বস্তুর ওপর কাজটা করে। সাথে <strong>を</strong> বসে।
              <br><code>私がドアを開ける (akeru)</code> ➔ আমি দরজা খুলি।
            </p>
          </div>
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px">
            <strong style="color:#64b5f6;font-size:15px">自動詞 (Jidoushi - অকর্মক): が</strong>
            <p style="font-size:12.5px;color:var(--text-2);margin:6px 0">
              স্বয়ংক্রিয়ভাবে বা প্রাকৃতিকভাবে কোনো অবস্থা তৈরি হওয়া। সাথে <strong>が</strong> বসে।
              <br><code>ドアが開く (aku)</code> ➔ দরজা খোলে / খোলা আছে।
            </p>
          </div>
        </div>

        <!-- 7 pairs table -->
        <div class="guide-table-wrap">
          <table class="guide-table">
            <thead>
              <tr>
                <th>অর্থ</th>
                <th>自動詞 (অকর্মক: が)</th>
                <th>他動詞 (সকর্মক: を)</th>
                <th>মনে রাখার ট্রিক</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>খোলা (Open)</td>
                <td><strong lang="ja" style="color:#64b5f6">開く</strong> (あく)</td>
                <td><strong lang="ja" style="color:var(--primary)">開ける</strong> (あける)</td>
                <td>~eru থাকলে সচরাচর সকর্মক হয়</td>
              </tr>
              <tr>
                <td>বন্ধ হওয়া (Close)</td>
                <td><strong lang="ja" style="color:#64b5f6">閉まる</strong> (しまる)</td>
                <td><strong lang="ja" style="color:var(--primary)">閉める</strong> (しめる)</td>
                <td>-aru অকর্মক, -eru সকর্মক</td>
              </tr>
              <tr>
                <td>নিভে যাওয়া (Turn off)</td>
                <td><strong lang="ja" style="color:#64b5f6">消える</strong> (きえる)</td>
                <td><strong lang="ja" style="color:var(--primary)">消す</strong> (けす)</td>
                <td>-su থাকলে সবসময় সকর্মক!</td>
              </tr>
              <tr>
                <td>জ্বলা (Turn on)</td>
                <td><strong lang="ja" style="color:#64b5f6">つく</strong> (付く)</td>
                <td><strong lang="ja" style="color:var(--primary)">つける</strong> (付ける)</td>
                <td>বাত্তি নিজে জ্বললে つく, মানুষ জ্বালালে つける</td>
              </tr>
              <tr>
                <td>পড়া (Drop / Fall)</td>
                <td><strong lang="ja" style="color:#64b5f6">落ちる</strong> (おちる)</td>
                <td><strong lang="ja" style="color:var(--primary)">落とす</strong> (おとす)</td>
                <td>-su সকর্মক (মানুষ হাত থেকে ফেলল)</td>
              </tr>
              <tr>
                <td>বের হওয়া (Exit)</td>
                <td><strong lang="ja" style="color:#64b5f6">出る</strong> (でる)</td>
                <td><strong lang="ja" style="color:var(--primary)">出す</strong> (だす)</td>
                <td>আমি বের হই 出る, চিঠি ড্রপবক্সে ফেলি 出す</td>
              </tr>
              <tr>
                <td>ঢোকা (Enter)</td>
                <td><strong lang="ja" style="color:#64b5f6">入る</strong> (はいる)</td>
                <td><strong lang="ja" style="color:var(--primary)">入れる</strong> (いれる)</td>
                <td>চিনি কাপে ঢালি 入れる, রুমে ঢুকি 入る</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- Trap 5: Potential / Tai Particle Trap -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#00acc1;background:rgba(0,172,193,0.12)">5</div>
          <div>
            <h3 class="guide-card-title">সক্ষমতা ও ইচ্ছার পার্টিকেল ট্র্যাপ — 「を」 নাকি 「が」?</h3>
            <div class="guide-card-subtitle">Potential Form (〜できる / 〜話せる) ও 〜たい এর ব্যাকরণ নিয়ম</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          সাধারণ বাক্যে <code>日本語を話す</code> (জাপানি ভাষায় কথা বলা - を বসে)। কিন্তু যখনই আপনি বলবেন "আমি জাপানি ভাষায় কথা বলতে <strong>পারি</strong>" (সক্ষমতা) — তখন JLPT-র স্ট্যান্ডার্ড ব্যাকরণে <strong>が</strong> বসাতে হবে!
        </p>

        <div class="wrong-right-box">
          <div class="wrong-item">
            <span class="comparison-tag-wrong">❌ JLPT পরীক্ষায় নম্বর কাটা যায়</span>
            <div lang="ja" style="font-size:14px;font-weight:600">私は日本語を話せます。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">কথ্য ভাষায় চললেও JLPT পরীক্ষার অপশনে を ভুল ধরা হয়!</div>
          </div>
          <div class="right-item">
            <span class="comparison-tag-right">⭕ সঠিক (JLPT Standard)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">私は日本語が話せます。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">সক্ষমতার বিষয়বস্তু নির্দেশ করতে সবসময় が বসে!</div>
          </div>
        </div>

        <div class="guide-callout success">
          <strong>〜たい (ইচ্ছা) এর ক্ষেত্রে:</strong> <code>水が飲みたい</code> এবং <code>水を飲みたい</code> — দুটিই শুদ্ধ। তবে <code>が</code> দিলে তৃষ্ণার তীব্রতা বা বস্তুটির প্রতি গভীর ফোকাস বোঝায়!
        </div>
      </article>

      <!-- Trap 6: Plain form in subordinate clauses -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#e91e63;background:rgba(233,30,99,0.12)">6</div>
          <div>
            <h3 class="guide-card-title">উপবাক্যে (Subordinate Clauses) সাধারণ রূপের (Plain Form) বাধ্যবাধকতা</h3>
            <div class="guide-card-subtitle">〜とき, 〜まえに, 〜あとで, 〜から এর আগে মাসু ফর্মের ভুল</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          জাপানি ভাষার লোহার মতো শক্ত নিয়ম: কোনো বাক্যাংশের ভেতরে যখন <code>〜とき (যখন)</code>, <code>〜まえに (আগে)</code>, <code>〜あとで (পরে)</code>, <code>〜から (যেহেতু)</code> ইত্যাদি বসে — তার আগের ক্রিয়াপদটি <strong>অবশ্যই সাধারণ রূপ (Plain Form / 辞書形 / た形 / ない形)</strong> হতে হবে! ভেতরে কখনোই <code>〜ます</code> বা <code>〜です</code> বসবে না! নম্রতা প্রকাশ পাবে কেবল পুরো বাক্যের শেষ ক্রিয়াপদে।
        </p>

        <div class="wrong-right-box">
          <div class="wrong-item">
            <span class="comparison-tag-wrong">❌ ভুল (অতি-নম্রতার ফাঁদ)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">学校へ行きます前に、朝ご飯を食べます。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">উপবাক্যে 行きます বসানো সম্পূর্ণ ব্যাকরণবিরুদ্ধ!</div>
          </div>
          <div class="right-item">
            <span class="comparison-tag-right">⭕ সঠিক (JLPT Standard)</span>
            <div lang="ja" style="font-size:14px;font-weight:600">学校へ行く前に、朝ご飯を食べます。</div>
            <div style="font-size:12px;color:var(--muted);margin-top:4px">ভেতরে অভিধান রূপ 行く বসবে, নম্রতা শেষে 食べます-এ হবে!</div>
          </div>
        </div>
      </article>

      <!-- Trap 7: Causative-Passive -->
      <article class="guide-card">
        <div class="guide-card-head">
          <div class="guide-card-icon" style="color:#d32f2f;background:rgba(211,47,47,0.12)">7</div>
          <div>
            <h3 class="guide-card-title">使役受身 (Causative-Passive) — "অনিচ্ছা সত্ত্বেও বাধ্য হওয়া"</h3>
            <div class="guide-card-subtitle">〜させられる / 〜される (N4 ও N3-র সবচেয়ে ভীতিকর প্যাটার্ন)</div>
          </div>
        </div>

        <p style="font-size:13.5px;line-height:1.6;color:var(--text-2);margin-bottom:12px">
          N4 ও N3 এর পরীক্ষার্থীদের সবচেয়ে বেশি রাতের ঘুম হারাম করে এই রূপান্তরটি। কিন্তু এর মূল ভাবটি বুঝলে পানির মতো পরিষ্কার:
        </p>

        <div class="guide-callout danger">
          <div style="font-size:14px;font-weight:700;color:#f44336;margin-bottom:6px">
            💡 মূল ভাব: "নিজের বিন্দুমাত্র ইচ্ছা ছিল না, কিন্তু কারও চাপে বা নির্দেশে বাধ্য হয়ে করতে হয়েছে!"
          </div>
          <div style="font-size:13px;line-height:1.6">
            উদাহরণ:
            <br>• <strong>母に野菜を食べさせられた。</strong> (মায়ের নির্দেশে বাধ্য হয়ে সবজি খেতে হয়েছে - আমার খেতে একদম মন ছিল না)।
            <br>• <strong>部長に歌を歌わされた。</strong> (ম্যানেজারের চাপে বাধ্য হয়ে পার্টিতে গান গাইতে হয়েছে)।
          </div>
        </div>

        <div class="guide-table-wrap">
          <table class="guide-table">
            <thead>
              <tr>
                <th>গ্রুপ</th>
                <th>অভিধান রূপ</th>
                <th>使役受身 (বাধ্য হয়ে করা)</th>
                <th>সংক্ষিপ্ত রূপ (কথ্য ও JLPT)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>গ্রুপ ১ (Godan)</td>
                <td>飲む (পান করা)</td>
                <td>飲ませられる</td>
                <td><strong style="color:var(--primary)">飲まされる</strong></td>
              </tr>
              <tr>
                <td>গ্রুপ ১ (Godan)</td>
                <td>待つ (অপেক্ষা)</td>
                <td>待たせられる</td>
                <td><strong style="color:var(--primary)">待たされる</strong></td>
              </tr>
              <tr>
                <td>গ্রুপ ২ (Ichidan)</td>
                <td>食べる (খাওয়া)</td>
                <td><strong style="color:#64b5f6">食べさせられる</strong></td>
                <td>—</td>
              </tr>
              <tr>
                <td>গ্রুপ ৩ (Irregular)</td>
                <td>する (করা)</td>
                <td><strong style="color:#ffb74d">させられる</strong></td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

    </div>
  `;
}

function renderGrammar() {
  const all = (typeof GRAMMAR !== "undefined" ? GRAMMAR : []);
  const filtered = all.filter((g) => {
    if (grammarLevel !== "all" && g.level !== grammarLevel) return false;
    if (grammarQuery.trim()) {
      const q = grammarQuery.toLowerCase().trim();
      return (
        g.pattern.toLowerCase().includes(q) ||
        g.romaji.toLowerCase().includes(q) ||
        g.meaningBn.toLowerCase().includes(q) ||
        g.meaningEn.toLowerCase().includes(q) ||
        (g.explanationBn && g.explanationBn.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return `
    <button class="back-link" data-action="open-browse">${icon("arrowLeft", 15)} Kanji library</button>

    <div class="view-head">
      <span class="eyebrow">Reference · ব্যাকরণ ও রূপান্তর মাস্টারক্লাস</span>
      <h2>Grammar & Mastery (文法と活用)</h2>
      <p>JLPT N5, N4 ও N3-এর জন্য প্রয়োজনীয় ব্যাকরণ প্যাটার্ন, রূপান্তরের জাদুকরী নিয়ম ও পরীক্ষার সবচেয়ে বিভ্রান্তিকর ফাঁদসমূহ।</p>
    </div>

    <!-- Navigation Tabs -->
    <div class="chips soft-chips grammar-nav-tabs" role="tablist" style="margin-bottom:18px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="chip ${grammarTab === "list" ? "active" : ""}" data-action="grammar-tab" data-tab="list">
        ${icon("book", 15)} ব্যাকরণ প্যাটার্ন তালিকা (${all.length})
      </button>
      <button class="chip ${grammarTab === "guide" ? "active" : ""}" data-action="grammar-tab" data-tab="guide">
        ${icon("refresh", 15)} রূপান্তর সহায়িকা ও গল্প
      </button>
      <button class="chip ${grammarTab === "traps" ? "active" : ""}" data-action="grammar-tab" data-tab="traps">
        ${icon("target", 15)} সাধারণ ভুলের ৭টি ফাঁদ (Traps)
      </button>
    </div>

    ${grammarTab === "guide" ? renderConjugationGuide() :
      grammarTab === "traps" ? renderGrammarTraps() : `
      
      <!-- Pattern List Mode -->
      <div class="search-field">
        ${icon("search", 20)}
        <input id="grammar-search" type="search" value="${escapeHtml(grammarQuery)}" placeholder="প্যাটার্ন বা অর্থ দিয়ে খুঁজুন (যেমন: tara, হতে পারে, কারণ)…" autocomplete="off" spellcheck="false" aria-label="Search grammar" />
        <button class="search-clear ${grammarQuery ? "" : "hidden"}" data-action="clear-grammar-search" aria-label="Clear search">${icon("x", 16)}</button>
      </div>

      <div class="chips soft-chips" role="group" aria-label="Filter grammar by level" style="margin-bottom:14px">
        <button class="chip ${grammarLevel === "all" ? "active" : ""}" data-action="grammar-level" data-level="all">All (${all.length})</button>
        ${["N5", "N4", "N3"].map((lvl) => {
          const count = all.filter((g) => g.level === lvl).length;
          return `<button class="chip ${grammarLevel === lvl ? "active" : ""}" data-action="grammar-level" data-level="${lvl}">${lvl} (${count})</button>`;
        }).join("")}
      </div>

      <div class="grammar-list" style="display:flex;flex-direction:column;gap:12px;margin-top:14px">
        ${filtered.length ? filtered.map((g) => `
          <article class="grammar-card" style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:16px 18px">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px">
              <div>
                <h3 style="font-family:var(--font-jp);font-size:20px;font-weight:700;color:var(--text);margin:0">${escapeHtml(g.pattern)}</h3>
                <span style="font-size:12px;color:var(--muted);font-family:monospace">${escapeHtml(g.romaji)}</span>
              </div>
              <span class="level-badge ${g.level}">JLPT ${g.level}</span>
            </div>

            <div style="font-size:14px;font-weight:600;color:var(--primary);margin-bottom:8px">
              ${escapeHtml(g.meaningBn)} <span style="font-size:12px;font-weight:400;color:var(--text-2)">(${escapeHtml(g.meaningEn)})</span>
            </div>

            <div style="background:var(--surface-2);border-radius:10px;padding:8px 12px;font-size:12.5px;color:var(--text);margin-bottom:10px;border-left:3px solid var(--primary)">
              <strong>গঠন (Formation):</strong> <code style="font-family:inherit;color:var(--text)">${escapeHtml(g.formation)}</code>
            </div>

            <p style="font-size:13px;line-height:1.5;color:var(--text-2);margin:0 0 12px">${escapeHtml(g.explanationBn)}</p>

            ${g.examples && g.examples.length ? `
              <div style="border-top:1px dashed var(--border);padding-top:10px;display:flex;flex-direction:column;gap:8px">
                ${g.examples.map((ex) => `
                  <div style="background:rgba(255,255,255,0.02);border-radius:12px;padding:8px 12px">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                      <div style="font-family:var(--font-jp);font-size:15px;line-height:1.5" lang="ja">${ex.ruby || escapeHtml(ex.japanese)}</div>
                      <button class="speak-btn" data-action="speak" data-text="${escapeHtml(ex.japanese)}" aria-label="Listen">${icon("volume", 13)}</button>
                    </div>
                    <div style="font-size:12.5px;color:var(--muted);margin-top:2px">${escapeHtml(ex.meaningBn)}</div>
                  </div>
                `).join("")}
              </div>
            ` : ""}
          </article>
        `).join("") : `
          <div class="empty">
            <strong>কোনো ব্যাকরণ পাওয়া যায়নি</strong>
            <p>অন্য কোনো অনুসন্ধান বা লেভেল দিয়ে দেখুন।</p>
          </div>
        `}
      </div>
    `}
  `;
}

let readerInputText = "";
let readerAnalyzedTokens = null;

function renderReader() {
  return `
    <button class="back-link" data-action="open-browse">${icon("arrowLeft", 15)} Kanji library</button>

    <div class="view-head">
      <span class="eyebrow">Reader & Analyzer · রিডার</span>
      <h2>Text Reader (読解)</h2>
      <p>যেকোনো জাপানি প্যারাগ্রাফ বা বাক্য পেস্ট করুন — স্বয়ংক্রিয়ভাবে ফুরিগানা তৈরি হবে এবং কাঞ্জিতে ট্যাপ করলেই ডিটেইলস দেখতে পাবেন।</p>
    </div>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:16px;margin-bottom:14px">
      <textarea id="reader-textarea" rows="4" style="width:100%;box-sizing:border-box;background:var(--surface-2);color:var(--text);border:1px solid var(--border);border-radius:12px;padding:12px;font-family:var(--font-jp);font-size:16px;line-height:1.6;resize:vertical" placeholder="এখানে জাপানি টেক্সট পেস্ট করুন (যেমন: 私は毎朝七時に起きて、日本語を勉強します。)">${escapeHtml(readerInputText)}</textarea>

      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-top:10px">
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <span style="font-size:11.5px;color:var(--muted);align-self:center">নমুনা:</span>
          <button class="chip soft-chip" data-action="reader-sample" data-sample="1">N5 বাক্য</button>
          <button class="chip soft-chip" data-action="reader-sample" data-sample="2">N4 বাক্য</button>
          <button class="chip soft-chip" data-action="reader-sample" data-sample="3">N3 বাক্য</button>
        </div>

        <button class="btn primary small" data-action="reader-analyze">
          ${icon("sparkles", 14)} ফুরিগানা তৈরি করুন
        </button>
      </div>
    </div>

    ${readerAnalyzedTokens ? `
      <section style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <span class="eyebrow" style="color:var(--primary)">বিশ্লেষিত ফলাফল (কাঞ্জিতে ট্যাপ করে বিস্তারিত দেখুন)</span>
          <button class="btn tonal small" data-action="speak" data-text="${escapeHtml(readerInputText)}">
            ${icon("volume", 14)} পুরো পাঠ শুনুন
          </button>
        </div>

        <div class="reader-content" style="font-family:var(--font-jp);font-size:24px;line-height:2.2;word-break:break-word">
          ${readerAnalyzedTokens}
        </div>
      </section>
    ` : ""}
  `;
}

let printableLevel = "target";
let printablePage = 0;
let printablePerPage = 5;
let printableStartNum = 1;
let printableCustomChars = "";
let printableShowMeaning = true;
let printableStyleMode = "school"; // "school" | "alt"

/* Official Joyo Kanji Kun'yomi supplement for N4 kanji whose kun array was empty in raw JSON */
const JOYO_KUN_SUPPLEMENT = {
  "字": ["あざ"],
  "図": ["はか.る"],
  "室": ["むろ"],
  "理": ["ことわり"],
  "医": ["い.やす"],
  "発": ["た.つ"],
  "験": ["ため.す"],
  "業": ["わざ"],
  "病": ["や.む", "やまい"],
  "勉": ["つと.める"],
  "質": ["ただ.す"],
  "工": ["たくみ"],
  "台": ["うてな"],
};

/* Preferred primary Kun'yomi overrides where raw JSON lists prefix/archaic reading first */
const PREFERRED_PRIMARY_KUN = {
  "一": ["ひと.つ"],
  "二": ["ふた.つ"],
  "三": ["みっ.つ", "み.つ"],
  "四": ["よっ.つ", "よん"],
  "五": ["いつ.つ"],
  "六": ["むっ.つ", "む.つ"],
  "七": ["なな.つ", "なな"],
  "八": ["やっ.つ", "や.つ"],
  "九": ["ここの.つ"],
  "大": ["おお.きい"],
  "小": ["ちい.さい"],
  "天": ["あめ"],
  "雨": ["あめ"],
  "日": ["ひ"],
  "食": ["た.べる"],
  "後": ["うし.ろ", "あと", "おく.れる"],
  "白": ["しろ.い", "しろ"],
  "赤": ["あか.い", "あか"],
  "青": ["あお.い", "あお"],
  "黒": ["くろ.い", "くろ"],
  "高": ["たか.い", "たか"],
  "別": ["わか.れる", "わ.ける"],
  "引": ["ひ.く", "ひ.ける"],
};

function kataToHiraStr(str = "") {
  return String(str).replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

function hiraToKataStr(str = "") {
  return String(str).replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

function getEffectiveKunList(k) {
  if (!k) return [];
  const rawKun = Array.isArray(k.kun) && k.kun.length > 0
    ? k.kun
    : (JOYO_KUN_SUPPLEMENT[k.char] || []);
  if (rawKun.length === 0) return [];

  const preferred = PREFERRED_PRIMARY_KUN[k.char] || [];
  // Filter out pure prefix/suffix tokens like "ひと-", "おお-", "-か" if better readings exist
  const nonAffix = rawKun.filter((r) => !r.startsWith("-") && !r.endsWith("-"));
  const baseList = nonAffix.length > 0 ? nonAffix : rawKun.map((r) => r.replace(/^-|-$/g, ""));

  // Sort preferred readings to front while preserving all valid readings
  const ordered = [
    ...preferred.filter((p) => baseList.includes(p) || rawKun.includes(p)),
    ...baseList.filter((r) => !preferred.includes(r)),
  ];
  return [...new Set(ordered)].filter(Boolean);
}

function makeSchoolOnRow(k, onRaw) {
  const clean = String(onRaw || "").replace(/[.\-ー\s]/g, "");
  const kata = hiraToKataStr(clean);
  const hira = kataToHiraStr(clean);
  return {
    label: kata || "オン",
    subLabel: "音読み",
    unit: [{ furi: hira, char: k.char }],
  };
}

function makeSchoolKunRow(k, kunRaw) {
  const raw = String(kunRaw || "").trim().replace(/^-|-$/g, "");
  if (raw.includes(".")) {
    const parts = raw.split(".");
    const stemHira = kataToHiraStr(parts[0]);
    const okuriHira = kataToHiraStr(parts.slice(1).join(""));
    const okuriChars = Array.from(okuriHira).slice(0, 3);
    // Keep unit length 2, 3, or 4 so 12 columns divide evenly
    return {
      label: `${stemHira}ー${okuriHira}`,
      subLabel: "訓読み",
      unit: [
        { furi: stemHira, char: k.char },
        ...okuriChars.map((ch) => ({ furi: "", char: ch })),
      ],
    };
  }
  const hira = kataToHiraStr(raw.replace(/[\-ー\s]/g, ""));
  return {
    label: hira || "くん",
    subLabel: "訓読み",
    unit: [{ furi: hira, char: k.char }],
  };
}

function makeSchoolCompoundRow(k) {
  const vList = vocabEntries(k);
  const allCandidates = [
    ...vList.map((v) => ({ word: v.word, reading: kataToHiraStr(v.reading || "") })),
    ...(k.example && k.example.word
      ? [{ word: k.example.word, reading: kataToHiraStr(k.example.reading || "") }]
      : []),
  ].filter((c) => c.word && c.reading && c.word.length === 2);

  // Prefer 2-character pure Kanji compounds (no hiragana okurigana mixed in)
  const pureKanjiTwo = allCandidates.find((c) => /^[一-龯々ヶ]{2}$/.test(c.word)) || allCandidates[0];
  if (pureKanjiTwo && pureKanjiTwo.word.length === 2) {
    const w = pureKanjiTwo.word;
    const r = pureKanjiTwo.reading;
    const kIdx = w.indexOf(k.char);
    const onHiraList = (k.on || []).map((o) => kataToHiraStr(o.replace(/[.\-]/g, ""))).filter(Boolean);
    const kunHiraList = getEffectiveKunList(k).map((ku) => kataToHiraStr(ku.split(".")[0].replace(/[.\-]/g, ""))).filter(Boolean);
    const knownReadings = [...onHiraList, ...kunHiraList];

    let f0 = "";
    let f1 = "";
    let matched = false;
    for (const kr of knownReadings) {
      if (!kr) continue;
      if (kIdx === 0 && r.startsWith(kr) && r.length > kr.length) {
        f0 = kr;
        f1 = r.slice(kr.length);
        matched = true;
        break;
      }
      if (kIdx === 1 && r.endsWith(kr) && r.length > kr.length) {
        f0 = r.slice(0, r.length - kr.length);
        f1 = kr;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const mid = Math.ceil(r.length / 2);
      f0 = r.slice(0, mid);
      f1 = r.slice(mid);
    }

    // Never insert 'ー' inside an On'yomi or compound reading! Use clean '・' between the 2 kanji readings.
    return {
      label: `${f0}・${f1}`,
      subLabel: w,
      unit: [
        { furi: f0, char: w[0] },
        { furi: f1, char: w[1] },
      ],
    };
  }

  const kunList = getEffectiveKunList(k);
  if (kunList[0]) return makeSchoolKunRow(k, kunList[0]);
  if (k.on && k.on[0]) return makeSchoolOnRow(k, k.on[0]);
  return {
    label: k.char,
    subLabel: "",
    unit: [{ furi: "", char: k.char }],
  };
}

function getSchoolWorksheetRows(k) {
  // Exact match for the user's school worksheet sample preset (14 別, 15 引)
  if (printableStyleMode === "school") {
    if (k.char === "別") {
      return [
        { label: "ベツ", subLabel: "音読み", unit: [{ furi: "べつ", char: "別" }] },
        {
          label: "わかーれる",
          subLabel: "訓読み",
          unit: [
            { furi: "わか", char: "別" },
            { furi: "", char: "れ" },
            { furi: "", char: "る" },
          ],
        },
      ];
    }
    if (k.char === "引" && printableLevel === "school_demo") {
      return [
        {
          label: "ひーく",
          subLabel: "訓読み",
          unit: [
            { furi: "ひ", char: "引" },
            { furi: "", char: "く" },
          ],
        },
        {
          label: "びーき",
          subLabel: "割引",
          unit: [
            { furi: "わり", char: "割" },
            { furi: "びき", char: "引" },
          ],
        },
      ];
    }
  }

  const onList = k.on || [];
  const kunList = getEffectiveKunList(k);

  // Mode 2 ("alt"): Practice 2nd Kun'yomi (e.g., 別 -> わか.れる & わ.ける) or Kun + Jukugo Compound
  if (printableStyleMode === "alt") {
    if (kunList.length >= 2) {
      return [
        makeSchoolKunRow(k, kunList[0]),
        makeSchoolKunRow(k, kunList[1]),
      ];
    }
    if (onList.length > 0 && kunList.length === 1) {
      return [
        makeSchoolKunRow(k, kunList[0]),
        makeSchoolCompoundRow(k),
      ];
    }
    if (onList.length >= 2) {
      return [
        makeSchoolOnRow(k, onList[0]),
        makeSchoolOnRow(k, onList[1]),
      ];
    }
    return [
      onList[0] ? makeSchoolOnRow(k, onList[0]) : makeSchoolCompoundRow(k),
      makeSchoolCompoundRow(k),
    ];
  }

  // Mode 1 ("school" — Default): Row 1 = On'yomi (Katakana), Row 2 = Primary Kun'yomi (Hiragana + okurigana)
  if (onList.length > 0 && kunList.length > 0) {
    return [
      makeSchoolOnRow(k, onList[0]),
      makeSchoolKunRow(k, kunList[0]),
    ];
  }
  if (kunList.length >= 2) {
    return [
      makeSchoolKunRow(k, kunList[0]),
      makeSchoolKunRow(k, kunList[1]),
    ];
  }
  if (onList.length >= 2) {
    return [
      makeSchoolOnRow(k, onList[0]),
      makeSchoolOnRow(k, onList[1]),
    ];
  }
  if (onList.length === 1) {
    return [
      makeSchoolOnRow(k, onList[0]),
      makeSchoolCompoundRow(k),
    ];
  }
  if (kunList.length === 1) {
    return [
      makeSchoolKunRow(k, kunList[0]),
      makeSchoolCompoundRow(k),
    ];
  }
  return [
    makeSchoolCompoundRow(k),
    { label: "れんしゅう", subLabel: "", unit: [{ furi: "", char: k.char }] },
  ];
}

function buildTwelveSchoolCells(unit) {
  const safeUnit = Array.isArray(unit) && unit.length > 0 ? unit : [{ furi: "", char: "" }];
  const L = safeUnit.length;
  const cells = [];
  for (let col = 0; col < 12; col++) {
    const item = safeUnit[col % L];
    const isFirstGroup = col < L;
    // Complete repetitions only (if L=3, 12%3=0 so all 12 cells are active)
    const maxActiveCol = Math.floor(12 / L) * L;
    const isActive = col < maxActiveCol;
    cells.push({
      furi: isActive ? (item.furi || "") : "",
      traceChar: isFirstGroup && isActive ? (item.char || "") : "",
      groupEnd: isActive && ((col + 1) % L === 0) && col < 11,
    });
  }
  return cells;
}

function extractKanjiOnly(text = "") {
  if (!text) return [];
  // Match standard CJK Unified Ideographs range + Kanji iteration marks
  const kanjiRegex = /[\u4e00-\u9faf\u3400-\u4dbf々〆]/g;
  const matches = String(text).match(kanjiRegex) || [];
  return [...new Set(matches)];
}

function getPrintableKanjiPool() {
  if (printableLevel === "school_demo") {
    const demoChars = ["別", "引", "車", "電", "食", "飲"];
    return demoChars.map((c) => byChar[c]).filter(Boolean);
  }
  if (printableLevel === "custom" && printableCustomChars.trim()) {
    const chars = extractKanjiOnly(printableCustomChars.trim());
    const matched = chars.map((c) => byChar[c]).filter(Boolean);
    if (matched.length > 0) return matched;
  }
  if (printableLevel === "fav") {
    return state.favorites.map((c) => byChar[c]).filter(Boolean);
  }
  if (printableLevel === "target") {
    const lvls = typeof activeStudyLevels === "function" ? activeStudyLevels() : ["N5", "N4"];
    return KANJI.filter((k) => lvls.includes(k.level));
  }
  return KANJI.filter((k) => k.level === printableLevel);
}

function getCurrentPrintableSlice() {
  const pool = getPrintableKanjiPool();
  const totalPages = Math.max(1, Math.ceil(pool.length / printablePerPage));
  if (printablePage >= totalPages) printablePage = totalPages - 1;
  if (printablePage < 0) printablePage = 0;
  const startIdx = printablePage * printablePerPage;
  const items = pool.slice(startIdx, startIdx + printablePerPage);
  const baseNum = printableLevel === "school_demo" && printablePage === 0
    ? 14
    : (printableStartNum + startIdx);
  return { pool, totalPages, startIdx, items, baseNum };
}

function renderSchoolBlockMarkup(k, itemNumber) {
  const [row1, row2] = getSchoolWorksheetRows(k);
  const cells1 = buildTwelveSchoolCells(row1.unit);
  const cells2 = buildTwelveSchoolCells(row2.unit);
  const onStr = (k.on && k.on.length) ? k.on.join(", ") : "—";
  const kunArr = getEffectiveKunList(k);
  const kunStr = kunArr.length ? kunArr.join(", ") : "—";

  return `
    <div class="school-block" data-char="${escapeHtml(k.char)}">
      <!-- Top Number & Info Strip -->
      <div class="school-num-bar">
        <div class="school-num-badge">${itemNumber}</div>
        <div class="school-num-meta">
          ${printableShowMeaning ? `
            <span class="school-meta-bn">${escapeHtml(primaryMeaning(k))}</span>
            ${secondaryMeaning(k) ? `<span class="school-meta-en">· ${escapeHtml(secondaryMeaning(k))}</span>` : ""}
          ` : ""}
          <span class="school-meta-readings" lang="ja">音: <strong>${escapeHtml(onStr)}</strong> · 訓: <strong>${escapeHtml(kunStr)}</strong></span>
          <span class="school-meta-strokes">${k.level} · ${k.strokes} strokes</span>
        </div>
      </div>

      <!-- Row 1: Master Kanji + 10 Practice Boxes (first 3 trace, 7 blank) -->
      <div class="school-main-row">
        <div class="school-master-cell" title="${escapeHtml(primaryMeaning(k))}">
          <span class="school-master-kanji" lang="ja">${escapeHtml(k.char)}</span>
        </div>
        <div class="school-kanji-grid">
          ${Array.from({ length: 10 }).map((_, idx) => `
            <div class="school-kbox ${idx < 3 ? "is-trace" : ""}">
              <span class="school-guide-v" aria-hidden="true"></span>
              <span class="school-guide-h" aria-hidden="true"></span>
              ${idx < 3 ? `<span class="school-trace-char" lang="ja">${escapeHtml(k.char)}</span>` : ""}
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Rows 2 & 3: 読み方 (Reading & Word Writing Practice, 12 columns) -->
      <div class="school-yomi-section">
        <div class="school-yomi-sidebar">
          <div class="school-yomi-vlabel" lang="ja" aria-label="読み方">
            <span>読</span><span>み</span><span>方</span>
          </div>
          <div class="school-yomi-labels">
            <div class="school-yomi-label-cell" lang="ja">
              <span class="school-yomi-text">${escapeHtml(row1.label)}</span>
            </div>
            <div class="school-yomi-label-cell" lang="ja">
              <span class="school-yomi-text">${escapeHtml(row2.label)}</span>
            </div>
          </div>
        </div>

        <div class="school-yomi-rows">
          <div class="school-yomi-row">
            ${cells1.map((c) => `
              <div class="school-yomi-col ${c.groupEnd ? "group-end" : ""}">
                <div class="school-furi-cell" lang="ja">${escapeHtml(c.furi)}</div>
                <div class="school-wbox ${c.traceChar ? "is-trace" : ""}">
                  ${c.traceChar ? `<span class="school-wtrace-char" lang="ja">${escapeHtml(c.traceChar)}</span>` : ""}
                </div>
              </div>
            `).join("")}
          </div>

          <div class="school-yomi-row">
            ${cells2.map((c) => `
              <div class="school-yomi-col ${c.groupEnd ? "group-end" : ""}">
                <div class="school-furi-cell" lang="ja">${escapeHtml(c.furi)}</div>
                <div class="school-wbox ${c.traceChar ? "is-trace" : ""}">
                  ${c.traceChar ? `<span class="school-wtrace-char" lang="ja">${escapeHtml(c.traceChar)}</span>` : ""}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPrintable() {
  const { pool, totalPages, items, baseNum } = getCurrentPrintableSlice();
  const targetLvls = typeof activeStudyLevels === "function" ? activeStudyLevels().join("·") : "N5·N4";

  return `
    <button class="back-link no-print" data-action="open-browse">${icon("arrowLeft", 15)} Kanji library</button>

    <div class="view-head no-print">
      <span class="eyebrow">Japanese School Worksheet · জাপানি স্কুল প্র্যাকটিস শিট</span>
      <h2>Printable Grid (漢字練習帳)</h2>
      <p>জাপানি ল্যাঙ্গুয়েজ স্কুলের আসল স্টাইলে কাঞ্জি ও 読み方 (Onyomi ও Kunyomi উচ্চারণ) লেখার অনুশীলন শিট। সরাসরি <strong>A4 ছবি (PNG) ডাউনলোড</strong> করুন অথবা <strong>প্রিন্ট / PDF</strong> হিসেবে সেভ করুন।</p>
    </div>

    <div class="school-controls-card no-print">
      <!-- Row 1: Level & Preset Filter Chips -->
      <div class="school-ctrl-group">
        <span class="school-ctrl-label">সেট নির্বাচন:</span>
        <div class="school-chip-row">
          <button class="chip ${printableLevel === "target" ? "active" : ""}" data-action="printable-level" data-level="target">🎯 আমার লক্ষ্য (${targetLvls})</button>
          <button class="chip ${printableLevel === "school_demo" ? "active" : ""}" data-action="printable-level" data-level="school_demo">🏫 স্কুল শিট নমুনা (14 別 · 15 引)</button>
          <button class="chip ${printableLevel === "N5" ? "active" : ""}" data-action="printable-level" data-level="N5">N5</button>
          <button class="chip ${printableLevel === "N4" ? "active" : ""}" data-action="printable-level" data-level="N4">N4</button>
          <button class="chip ${printableLevel === "N3" ? "active" : ""}" data-action="printable-level" data-level="N3">N3</button>
          <button class="chip ${printableLevel === "N2" ? "active" : ""}" data-action="printable-level" data-level="N2">N2</button>
          <button class="chip ${printableLevel === "N1" ? "active" : ""}" data-action="printable-level" data-level="N1">N1</button>
          <button class="chip ${printableLevel === "fav" ? "active" : ""}" data-action="printable-level" data-level="fav">★ ফেভারিট (${state.favorites.length})</button>
        </div>
      </div>

      <!-- Row 2: Custom Kanji Input + Worksheet Style Options -->
      <div class="school-ctrl-split">
        <div class="school-custom-box">
          <label class="school-ctrl-label" for="printable-custom-input">নিজের কাঞ্জি বা জাপানি বাক্য পেস্ট করুন (অটো-ফিল্টার):</label>
          <div class="school-custom-input-row">
            <input
              id="printable-custom-input"
              type="text"
              class="school-custom-input"
              placeholder="যেকোনো জাপানি লেখা বা বাক্য পেস্ট করুন (যেমন: 私は日本語を勉強します)"
              value="${escapeHtml(printableCustomChars)}"
            />
            <button class="btn secondary small" data-action="printable-custom-apply">শিট তৈরি</button>
          </div>
        </div>

        <div class="school-options-box">
          <div class="school-opt-pills">
            <button class="chip ${printableStyleMode === "school" ? "active" : ""}" data-action="printable-mode" data-mode="school" title="প্রথম সারিতে Onyomi এবং দ্বিতীয় সারিতে মূল Kunyomi অনুশীলন">Onyomi + Kunyomi (স্কুল স্ট্যান্ডার্ড)</button>
            <button class="chip ${printableStyleMode === "alt" ? "active" : ""}" data-action="printable-mode" data-mode="alt" title="কাঞ্জির ২য় Kunyomi (যেমন 別-এর わか.れる ও わ.ける) বা যৌগিক শব্দ অনুশীলন">সব Kunyomi / ২য় উচ্চারণ</button>
            <button class="chip ${printableShowMeaning ? "active" : ""}" data-action="printable-meaning-toggle">${printableShowMeaning ? "✓ বাংলা অর্থ সহ" : "+ বাংলা অর্থ"}</button>
          </div>
        </div>
      </div>

      <!-- Row 3: Pagination + Per-Page + Download / Print Action Buttons -->
      <div class="school-ctrl-footer">
        <div class="school-pager">
          <button class="btn secondary small" data-action="printable-page-prev" ${printablePage <= 0 ? "disabled" : ""}>◀ আগের পেজ</button>
          <span class="school-page-indicator">পেজ <strong>${printablePage + 1}</strong> / ${totalPages} <small>(${pool.length}টি কাঞ্জি)</small></span>
          <button class="btn secondary small" data-action="printable-page-next" ${printablePage >= totalPages - 1 ? "disabled" : ""}>পরের পেজ ▶</button>
          <div class="school-perpage-chips" title="প্রতি পেজে কয়টি ব্লক থাকবে (A4 স্ট্যান্ডার্ড ৫টি)">
            ${[3, 4, 5, 6].map((n) => `
              <button class="chip ${printablePerPage === n ? "active" : ""}" data-action="printable-per-page" data-count="${n}">${n}টি/পেজ ${n === 5 ? "(A4)" : ""}</button>
            `).join("")}
          </div>
        </div>

        <div class="school-action-btns">
          <button class="btn primary small" data-action="download-printable-sheet">
            ${icon("download", 15)} A4 শিট ডাউনলোড (PNG)
          </button>
          <button class="btn secondary small" data-action="window-print">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            প্রিন্ট / Save PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Scrollable Wrapper for Mobile so the School Grid stays true-to-scale -->
    <div class="school-sheet-scroll-wrap">
      <div class="printable-sheet-paper school-sheet-paper" id="printable-area">
        <div class="school-sheet-header">
          <div class="school-sheet-title-block">
            <span class="school-sheet-jp-tag">漢字練習帳 · KANJI PRACTICE WORKSHEET</span>
            <h3>JLPT ${printableLevel === "school_demo" ? "School Worksheet (別・引)" : printableLevel === "target" ? targetLvls : printableLevel === "fav" ? "Favorites" : printableLevel === "custom" ? "Custom Set" : printableLevel} — কাঞ্জি ও 読み方 অনুশীলন শিট</h3>
          </div>
          <div class="school-sheet-sign">
            <span>名前 (Name): ______________________</span>
            <span>日付 (Date): ____/____/____</span>
          </div>
        </div>

        <div class="school-blocks-list">
          ${items.length > 0
            ? items.map((k, idx) => renderSchoolBlockMarkup(k, baseNum + idx)).join("")
            : `<div style="padding:32px;text-align:center;color:#444">এই সেটে কোনো কাঞ্জি পাওয়া যায়নি। অন্য লেভেল নির্বাচন করুন।</div>`
          }
        </div>
      </div>
    </div>
  `;
}

function renderQuizSetup() {
  return `
    <div class="view-head">
      <span class="eyebrow">Practice · অনুশীলন</span>
      <h2>Quiz</h2>
      <p>Ten quick questions. Test your recall, then review what slipped away.</p>
    </div>

    <div class="quiz-card">
      <span class="eyebrow">1. Choose a level</span>
      <div class="quiz-levels">
        ${["N5", "N4", "N3", "N2", "N1"].map((level) => {
          const s = levelStats(level);
          const selected = quizLevel === level;
          return `
            <button class="quiz-level ${selected ? "selected" : ""}" data-action="quiz-level" data-level="${level}" aria-pressed="${selected}">
              <span class="level-badge ${level}">${level}</span>
              <span class="quiz-level-copy"><strong>${LEVEL_NAMES[level]}</strong><span>${s.total} kanji in deck</span></span>
              <span class="check">${selected ? icon("check", 14) : ""}</span>
            </button>`;
        }).join("")}
      </div>

      <span class="eyebrow" style="margin-top:16px;display:block">2. Choose quiz mode</span>
      <div class="quiz-mode-grid">
        ${QUIZ_MODES.map((mode) => {
          const selected = quizMode === mode.id;
          return `
            <button class="quiz-mode-card ${selected ? "selected" : ""}" data-action="quiz-mode" data-mode="${mode.id}">
              <span class="quiz-mode-icon">${icon(mode.icon, 16)}</span>
              <span class="quiz-mode-copy">
                <strong>${mode.label}</strong>
                <span>${mode.hint}</span>
              </span>
            </button>`;
        }).join("")}
      </div>

      <span class="eyebrow" style="margin-top:16px;display:block">3. Topic / Category (ঐচ্ছিক)</span>
      <div class="quiz-category-scroll">
        <button class="chip ${quizCategory === "all" ? "active" : ""}" data-action="quiz-category" data-category="all">সব বিষয় (All)</button>
        ${KANJI_CATEGORIES.map((cat) => `
          <button class="chip ${quizCategory === cat.id ? "active" : ""}" data-action="quiz-category" data-category="${cat.id}">${escapeHtml(cat.bn)}</button>
        `).join("")}
      </div>

      <div class="quiz-info">
        ${icon("target", 16)}<span>10 questions</span><span class="dot-sep"></span><span>Multiple choice</span>
      </div>
      <button class="btn primary wide" data-action="start-quiz" style="margin-top:18px">
        ${icon("play", 17)} Start quiz · কুইজ শুরু করুন
      </button>
    </div>

    <div class="stat-row" style="margin-top:12px">
      <div class="stat"><span class="stat-value">${state.quiz.total}</span><span class="stat-label">Answered</span></div>
      <div class="stat"><span class="stat-value">${accuracy()}%</span><span class="stat-label">Accuracy</span></div>
      <div class="stat"><span class="stat-value">${state.best}/${10}</span><span class="stat-label">Best score</span></div>
    </div>

    <p class="quiz-tip">${icon("sparkles", 16)}<span>A wrong answer is useful — it shows exactly which kanji need another look.</span></p>
  `;
}

function formatMockTime(sec) {
  if (sec == null || isNaN(sec)) return "25:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function renderQuizActive() {
  const q = quiz.questions[quiz.index];
  const total = quiz.questions.length;
  const answered = quiz.selected !== null;
  const isRight = answered && quiz.selected === q.answer;
  const progress = Math.round(((quiz.index + 1) / total) * 100);

  if (quiz.mode === "flashcard") {
    const revealed = !!quiz.revealed;
    const k = byChar[q.char] || q;
    return `
      <div class="quiz-head">
        <button class="icon-btn" data-action="quit-quiz" aria-label="Quit quiz">${icon("x", 18)}</button>
        <div class="quiz-track"><span style="width:${progress}%"></span></div>
        <span class="quiz-step">${quiz.index + 1}/${total}</span>
      </div>

      <div class="quiz-body">
        <div class="flashcard-box ${revealed ? "revealed" : ""}" data-action="flashcard-reveal">
          <span class="level-badge ${q.level}">JLPT ${q.level} · ${strokesText(q.strokes)}</span>
          <div class="flashcard-char" lang="ja">${q.char}</div>

          ${!revealed ? `
            <div class="flashcard-hint">
              ${icon("sparkles", 15)} ট্যাপ করে অর্থ ও উচ্চারণ দেখুন
            </div>
          ` : `
            <div class="flashcard-back-content">
              <div class="flashcard-meaning">${escapeHtml(primaryMeaning(k))}</div>
              ${secondaryMeaning(k) ? `<div class="flashcard-meaning-en">${escapeHtml(secondaryMeaning(k))}</div>` : ""}

              <div class="flashcard-readings">
                <div><small style="color:var(--muted)">On: </small><span lang="ja" style="font-weight:600">${(k.on || []).join(" · ") || "—"}</span></div>
                <div><small style="color:var(--muted)">Kun: </small><span lang="ja" style="font-weight:600">${(k.kun || []).join(" · ") || "—"}</span></div>
              </div>

              ${k.example ? `
                <div style="font-size:13px;color:var(--text-2);margin-top:8px">
                  <span lang="ja" style="font-weight:600;color:var(--text)">${escapeHtml(k.example.word)}</span> (${escapeHtml(k.example.reading)}): ${escapeHtml(k.example.meaningBn || k.example.meaning)}
                  ${k.example.tts ? `<button class="speak-btn" data-action="speak" data-text="${escapeHtml(k.example.tts)}" aria-label="Pronounce" style="display:inline-flex;vertical-align:middle;margin-left:4px">${icon("volume", 13)}</button>` : ""}
                </div>
              ` : ""}
            </div>
          `}
        </div>

        ${revealed ? `
          <div class="flashcard-rate-row">
            <button class="btn danger" data-action="flashcard-rate" data-rating="again">
              ${icon("x", 16)}
              <span>ভুলে গেছি</span>
              <small style="font-size:9px;opacity:0.8">Again · ধাপ ১</small>
            </button>
            <button class="btn primary" data-action="flashcard-rate" data-rating="good">
              ${icon("check", 16)}
              <span>মনে আছে</span>
              <small style="font-size:9px;opacity:0.8">Good · +১ ধাপ</small>
            </button>
            <button class="btn tonal" data-action="flashcard-rate" data-rating="easy">
              ${icon("sparkles", 16)}
              <span>সহজ</span>
              <small style="font-size:9px;opacity:0.8">Easy · +২ ধাপ</small>
            </button>
          </div>
        ` : `
          <p class="quiz-foot">স্মৃতি থেকে কাঞ্জিটির অর্থ ও উচ্চারণ মনে করুন, তারপর কার্ডে ট্যাপ করুন।</p>
        `}
      </div>`;
  }

  const isReverse = quiz.mode === "reverse";
  const isListening = quiz.mode === "listening";
  const isReading = quiz.mode === "reading";
  const isMock = quiz.mode === "mock";

  let questionHtml = "";
  if (isListening) {
    questionHtml = `
      <span class="quiz-mondai-badge">${q.mondaiType || "聴解 · Listening"}</span>
      <div style="margin:14px 0 10px">
        <button class="quiz-listen-play" data-action="speak" data-text="${escapeHtml(q.tts)}" aria-label="Listen again">
          ${icon("volume", 34)}
        </button>
      </div>
      <div class="quiz-meta">উচ্চারণ শুনে সঠিক বাংলা অর্থ বাছাই করুন (পুনরায় শুনতে ট্যাপ করুন)</div>`;
  } else if (isReverse || (isMock && q.mondaiType && q.mondaiType.includes("表記"))) {
    questionHtml = `
      <span class="quiz-mondai-badge">${q.mondaiType || "問題２ · 表記"}</span>
      ${q.sentencePrompt ? `
        <div class="quiz-sentence" lang="ja">${q.sentencePrompt}</div>
        ${q.sentenceBn ? `<div class="quiz-sentence-sub">${escapeHtml(q.sentenceBn)}</div>` : ""}
        <div class="quiz-meta">JLPT ${q.level} · দাগ দেওয়া শব্দের সঠিক কাঞ্জি রূপ বাছাই করুন</div>
      ` : `
        <div class="quiz-char" style="font-size:36px;line-height:1.3;margin:18px 0 10px">${escapeHtml(q.promptText)}</div>
        ${q.promptEn ? `<div class="quiz-meta" style="font-size:14px;color:var(--text-2);margin-bottom:8px">${escapeHtml(q.promptEn)}</div>` : ""}
        <div class="quiz-meta">JLPT ${q.level} · ${strokesText(q.strokes)} · সঠিক কাঞ্জি রূপ বাছাই করুন</div>
      `}`;
  } else if (isReading || (isMock && q.mondaiType && q.mondaiType.includes("漢字読み"))) {
    questionHtml = `
      <span class="quiz-mondai-badge">${q.mondaiType || "問題１ · 漢字読み"}</span>
      ${q.sentencePrompt ? `
        <div class="quiz-sentence" lang="ja">${q.sentencePrompt}</div>
        ${q.sentenceBn ? `<div class="quiz-sentence-sub">${escapeHtml(q.sentenceBn)}</div>` : ""}
        <div class="quiz-meta">JLPT ${q.level} · দাগ দেওয়া কাঞ্জিটির সঠিক হিরাগানা রিডিং বাছাই করুন</div>
      ` : `
        <div class="quiz-char" lang="ja">${q.char}</div>
        <div class="quiz-meta">JLPT ${q.level} · সঠিক হিরাগানা উচ্চারণ বাছাই করুন</div>
      `}`;
  } else {
    // meaning
    questionHtml = `
      <span class="quiz-mondai-badge">${q.mondaiType || "কাঞ্জির অর্থ"}</span>
      ${q.sentencePrompt ? `
        <div class="quiz-sentence" lang="ja">${q.sentencePrompt}</div>
        ${q.sentenceBn ? `<div class="quiz-sentence-sub">${escapeHtml(q.sentenceBn)}</div>` : ""}
        <div class="quiz-meta">JLPT ${q.level} · দাগ দেওয়া কাঞ্জিটির সঠিক অর্থ বাছাই করুন</div>
      ` : `
        <div class="quiz-char" lang="ja">${q.char}</div>
        <div class="quiz-meta">JLPT ${q.level} · ${strokesText(q.strokes)} · সঠিক অর্থ বাছাই করুন</div>
      `}`;
  }

  const optionIsJp = isReverse || isReading || (isMock && q.mondaiType && (q.mondaiType.includes("表記") || q.mondaiType.includes("漢字読み")));

  return `
    <div class="quiz-head">
      <button class="icon-btn" data-action="quit-quiz" aria-label="Quit quiz">${icon("x", 18)}</button>
      <div class="quiz-track"><span style="width:${progress}%"></span></div>
      ${isMock ? `<span class="mock-timer" id="mock-timer-display" style="font-family:monospace;font-size:12px;font-weight:700;color:var(--amber);background:rgba(255,183,77,0.12);padding:3px 8px;border-radius:999px;border:1px solid rgba(255,183,77,0.3)">⏱ ${formatMockTime(quiz.timeLeft)}</span>` : ""}
      <span class="quiz-step">${quiz.index + 1}/${total}</span>
    </div>

    <div class="quiz-body">
      <div class="quiz-question">
        ${questionHtml}
      </div>

      <div class="options">
        ${q.options.map((opt, i) => {
          let cls = "";
          let mark = "";
          if (answered && opt === q.answer) {
            cls = "correct";
            mark = `<span class="option-icon">${icon("check", 18)}</span>`;
          } else if (answered && opt === quiz.selected) {
            cls = "wrong";
            mark = `<span class="option-icon">${icon("x", 18)}</span>`;
          }
          return `
            <button class="option ${cls}" data-action="answer" data-answer="${escapeHtml(opt)}" ${answered ? "disabled" : ""}>
              <span class="option-key">${i + 1}</span>
              <span class="option-text" ${optionIsJp ? 'lang="ja" style="font-family:var(--font-jp);font-size:18px;font-weight:600"' : ""}>${escapeHtml(opt)}</span>
              ${mark}
            </button>`;
        }).join("")}
      </div>

      <p class="quiz-foot">${answered
        ? (isRight
            ? `দারুণ! সঠিক হয়েছে — <strong>${escapeHtml(q.char)}</strong> (${escapeHtml(q.answer)}): ${escapeHtml(q.meaning)}`
            : `ভুল হয়েছে! সঠিক উত্তর: “<strong>${escapeHtml(q.answer)}</strong>” (${escapeHtml(q.meaning)}).`)
        : "সঠিক উত্তরটি বাছাই করতে ট্যাপ করুন বা কিবোর্ডে 1–4 চাপুন।"}</p>

      ${isMock ? `
        <div style="text-align:center;margin-top:14px">
          <button class="btn ghost small" data-action="mock-submit" style="color:var(--muted);font-size:11.5px">
            পরীক্ষা সমাপ্ত ও ফলাফল দেখুন (Submit Exam)
          </button>
        </div>
      ` : ""}
    </div>
  `;
}

function renderQuizResults() {
  const isMock = quiz.mode === "mock";
  const total = quiz.questions.length;
  const pct = Math.round((quiz.score / total) * 100);
  const scaledScore = isMock ? Math.round((quiz.score / total) * 60) : null;
  const passed = isMock ? (scaledScore >= 19 && quiz.score >= 13) : null;

  const message = isMock
    ? (passed ? "合格 · PASSED!" : "不合格 · KEEP PRACTICING")
    : (pct === 100 ? "Perfect score!" : pct >= 80 ? "Great work!" : pct >= 50 ? "Getting there" : "Keep practicing");

  return `
    <div class="results">
      <div class="ring" style="--p:${pct}">
        <div class="ring-inner">
          <strong>${isMock ? `${scaledScore}/60` : `${quiz.score}/${total}`}</strong>
          <span>${isMock ? `${quiz.score}/${total} correct` : `${pct}% correct`}</span>
        </div>
      </div>
      <span class="eyebrow">${quiz.level} ${isMock ? "JLPT Mock Exam" : "Quiz"} complete</span>
      <h2>${message}</h2>

      ${isMock ? `
        <div style="background:${passed ? "rgba(143,231,198,0.12)" : "rgba(255,154,143,0.12)"};border:1px solid ${passed ? "rgba(143,231,198,0.35)" : "rgba(255,154,143,0.35)"};border-radius:18px;padding:14px 18px;margin:14px 0 16px;text-align:center">
          <strong style="font-size:16px;color:${passed ? "var(--primary)" : "var(--danger)"};display:block">
            ${passed ? "অভিনন্দন! আপনি JLPT কাট-অফ পাস করেছেন!" : "আরেকটু অনুশীলন প্রয়োজন!"}
          </strong>
          <p style="margin:4px 0 0;font-size:12px;color:var(--text-2)">
            JLPT সেকশনাল কাট-অফ: ১৯/৬০ (আপনার স্কোর: ${scaledScore}/60) · পাস মার্ক: ৫০%
          </p>
        </div>
      ` : `
        <p>${pct === 100
          ? "Flawless — every kanji landed. Try a harder level next."
          : pct >= 80
            ? "Strong recall. Review the tricky ones and go again."
            : "Every attempt sharpens your memory. Review below, then retry."}</p>
      `}

      <div class="results-actions">
        <button class="btn tonal" data-action="quiz-again">${icon("refresh", 17)} Retry</button>
        <button class="btn primary" data-action="back-home">${icon("home", 17)} Home</button>
      </div>
    </div>

    <div class="review-list">
      ${quiz.answers.map((a) => `
        <div class="review-row ${a.correct ? "ok" : "bad"}">
          <span class="review-char">${a.char}</span>
          <span class="review-main">
            <strong>${a.meaning}</strong>
            <small>${a.meaningEn ? `${a.meaningEn} · ` : ""}${a.correct ? `Correct (${escapeHtml(a.answer || a.selected)})` : `Correct: “${escapeHtml(a.answer || "")}” · You chose “${escapeHtml(a.selected)}”`}</small>
          </span>
          <span class="review-badge">${icon(a.correct ? "check" : "x", 15)}</span>
        </div>`).join("")}
    </div>
  `;
}

function renderQuiz() {
  if (quiz && quiz.active) return renderQuizActive();
  if (quiz && quiz.done) return renderQuizResults();
  return renderQuizSetup();
}

function renderProfile() {
  const learned = learnedList();
  const learnedCount = learned.length;
  const streakCount = streak();
  const acc = accuracy();
  const favCount = state.favorites.filter((c) => KANJI.some((k) => k.char === c)).length;
  const rank = currentRank(learnedCount);
  const fb = window.firebaseSync;
  const user = fb ? fb.currentUser : null;
  const status = fb ? fb.syncStatus : "idle";

  let statusText = "সব ডিভাইসে সিঙ্ক সক্রিয়";
  let statusClass = "synced";
  if (status === "syncing") {
    statusText = "ক্লাউডে সিঙ্ক হচ্ছে...";
    statusClass = "syncing";
  } else if (status === "error") {
    statusText = "সিঙ্ক ত্রুটি (অফলাইন মোড)";
    statusClass = "error";
  }

  const badges = [
    { name: "First step", desc: "Learn 1 kanji", iconName: "sparkles", ok: learnedCount >= 1 },
    { name: "Ten down", desc: "Learn 10 kanji", iconName: "book", ok: learnedCount >= 10 },
    { name: "Halfway", desc: `Learn ${Math.ceil(KANJI.length / 2)} kanji`, iconName: "target", ok: learnedCount >= Math.ceil(KANJI.length / 2) },
    { name: "Kanji master", desc: `Learn all ${KANJI.length}`, iconName: "trophy", ok: learnedCount >= KANJI.length },
    { name: "Quiz whiz", desc: "80% accuracy", iconName: "quiz", ok: state.quiz.total >= 10 && acc >= 80 },
    { name: "On a roll", desc: "3-day streak", iconName: "flame", ok: streakCount >= 3 },
  ];
  const unlocked = badges.filter((b) => b.ok).length;

  return `
    <div class="view-head">
      <span class="eyebrow">Profile</span>
      <h2>Your progress</h2>
    </div>

    <section class="profile-card unified-profile-card ${user ? "is-logged-in" : "not-logged-in"}">
      <div class="profile-main-row">
        <div class="profile-avatar ${user && user.photoURL ? "has-photo" : ""}">
          ${user && user.photoURL
            ? `<img src="${escapeHtml(user.photoURL)}" alt="Avatar" class="avatar-img" referrerpolicy="no-referrer" />`
            : (user ? escapeHtml(user.displayName ? user.displayName[0] : "学") : (state.userName ? escapeHtml(state.userName[0].toUpperCase()) : "学"))}
        </div>
        <div class="profile-copy">
          <h3>${user ? escapeHtml(user.displayName || "Kanji Learner") : escapeHtml(state.userName || "Kanji Learner")}</h3>
          <p>${learnedCount} of ${KANJI.length} kanji learned${user && user.email ? ` · ${escapeHtml(user.email)}` : ""}</p>
          <div class="profile-badges-row">
            <span class="level-badge N5" title="কাঞ্জি শেখার বর্তমান ধাপ">${rank}</span>
            ${user ? `
              <span class="cloud-status-badge ${statusClass}">
                <span class="cloud-dot"></span> ${statusText}
              </span>
            ` : ""}
          </div>
        </div>
      </div>

      <div class="profile-actions-row">
        ${user ? `
          <button class="btn tonal profile-action-btn" data-action="manual-sync" title="এখনই ক্লাউডের সাথে রিফ্রেশ করুন">
            ${icon("refresh", 15)} সিঙ্ক রিফ্রেশ
          </button>
          <button class="btn ghost profile-action-btn" data-action="signout">
            ${icon("logOut", 15)} সাইন আউট
          </button>
        ` : `
          <div class="profile-signin-prompt">
            <span>সব ডিভাইসে কাঞ্জি ও SRS প্রগ্রেস অটো-সিঙ্ক করতে Google কানেক্ট করুন</span>
            <button class="btn google-btn" data-action="google-signin">
              ${icon("google", 18)} Continue with Google
            </button>
          </div>
        `}
      </div>
    </section>

    <div class="stat-grid">
      <div class="stat-tile">
        <span class="stat-icon">${icon("book", 18)}</span>
        <span><span class="stat-value">${learnedCount}</span><span class="stat-label">Learned</span></span>
      </div>
      <div class="stat-tile">
        <span class="stat-icon amber">${icon("flame", 18)}</span>
        <span><span class="stat-value">${streakCount}</span><span class="stat-label">Day streak</span></span>
      </div>
      <div class="stat-tile">
        <span class="stat-icon lav">${icon("target", 18)}</span>
        <span><span class="stat-value">${acc}%</span><span class="stat-label">Quiz accuracy</span></span>
      </div>
      <div class="stat-tile">
        <span class="stat-icon coral">${icon("starFilled", 18)}</span>
        <span><span class="stat-value">${favCount}</span><span class="stat-label">Saved kanji</span></span>
      </div>
    </div>

    <section class="section jlpt-section">
      <div class="section-head">
        <h3>JLPT progress</h3>
        <span class="small muted">${learnedCount}/${KANJI.length}</span>
      </div>
      <div class="level-list">${levelRows()}</div>
    </section>

    <section class="section milestones-section">
      <div class="section-head">
        <h3>Milestones</h3>
        <span class="small muted">${unlocked}/${badges.length}</span>
      </div>
      <div class="badges">
        ${badges.map((b) => `
          <div class="badge-item ${b.ok ? "unlocked" : ""}">
            <span class="badge-icon">${icon(b.iconName, 15)}</span>
            <span class="badge-copy"><strong>${b.name}</strong><span>${b.desc}</span></span>
          </div>`).join("")}
      </div>
    </section>

    <section class="section settings-section">
      <div class="section-head"><h3>Settings</h3></div>
      <div class="settings-list">
        <button class="setting-row" data-action="open-settings">
          <span class="setting-icon">${icon("settings", 16)}</span>
          <span class="setting-copy">
            <strong>Reading display</strong>
            <span>${prefSummary()}</span>
          </span>
          <span class="chev">${icon("chevron", 17)}</span>
        </button>
        <button class="setting-row" data-action="open-shortcuts">
          <span class="setting-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2.5" />
              <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M18 12h.01M8 16h8" />
            </svg>
          </span>
          <span class="setting-copy">
            <strong>Keyboard shortcuts</strong>
            <span>কিবোর্ড দিয়ে ব্যবহারের সকল শর্টকাট (?)</span>
          </span>
          <span class="chev">${icon("chevron", 17)}</span>
        </button>
        <button class="setting-row" data-action="about">
          <span class="setting-icon">${icon("info", 16)}</span>
          <span>About this app</span>
          <span class="chev">${icon("chevron", 17)}</span>
        </button>
        <button class="setting-row danger" data-action="reset-data">
          <span class="setting-icon">${icon("trash", 16)}</span>
          <span>Reset all progress</span>
          <span class="chev">${icon("chevron", 17)}</span>
        </button>
      </div>
    </section>

    <p class="app-footer">漢 · Kanji trainer · ${KANJI.length} characters · JLPT N5–N1</p>
  `;
}

function prefSummary() {
  const prefs = displayPrefs();
  return DISPLAY_PREFS.map((pref) => `${pref.short} ${prefs[pref.key] ? "on" : "off"}`).join(" · ");
}

function renderSettings() {
  const prefs = displayPrefs();
  const anyOff = DISPLAY_PREFS.some((pref) => !prefs[pref.key]);
  const sampleKanji = byChar["日"] || KANJI[0];
  const sample = (sampleKanji && sampleKanji.examples && sampleKanji.examples[0]) || {
    japanese: "毎日日本語を勉強します。",
    ruby: "<ruby>毎日<rt>まいにち</rt></ruby><ruby>日本語<rt>にほんご</rt></ruby>を<ruby>勉強<rt>べんきょう</rt></ruby>します。",
    reading: "まいにち にほんご を べんきょう します。",
    meaningBn: "আমি প্রতিদিন জাপানি ভাষা পড়ি।",
    tts: "まいにちにほんごをべんきょうします",
  };

  return `
    <div class="settings-head">
      <button class="icon-btn" data-action="open-profile" aria-label="Back to profile">${icon("arrowLeft", 19)}</button>
      <div class="settings-head-copy">
        <span class="eyebrow">Preferences</span>
        <h2>Settings</h2>
      </div>
    </div>

    <section class="section">
      <div class="section-head">
        <h3>Target JLPT Levels · আপনার লক্ষ্য</h3>
        <span class="small muted">Multi-select</span>
      </div>
      <div class="settings-goal-box">
        <p class="settings-note" style="margin:0 0 10px">এক বা একাধিক লেভেল সিলেক্ট করে রাখুন — হোম পেজের Today's Kanji, প্রগ্রেস কার্ড ও সাজেশন শুধুমাত্র এই লেভেলগুলো থেকেই আসবে:</p>
        ${studyLevelSelectorMarkup(false)}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h3>Reading display</h3>
        ${anyOff
          ? `<button class="text-link" data-action="reset-prefs">Reset all</button>`
          : `<span class="small muted">Everything on</span>`}
      </div>
      <div class="settings-list">${DISPLAY_PREFS.map((pref) => prefSwitch(pref)).join("")}</div>
      <p class="settings-note">Applies across the whole app — detail sheets, vocabulary and every example sentence. Saved on this device.</p>
    </section>

    <section class="section">
      <div class="section-head">
        <h3>Preview</h3>
        <span class="small muted">Live</span>
      </div>
      <div class="setting-preview">
        <span class="eyebrow">Example sentence</span>
        <div class="sentence-list">${sentenceMarkup(sample)}</div>
      </div>
    </section>
  `;
}

function sheetMarkup(k) {
  const fav = state.favorites.includes(k.char);
  const learned = state.learned.includes(k.char);
  const idx = KANJI.findIndex((x) => x.char === k.char);
  const prev = KANJI[(idx - 1 + KANJI.length) % KANJI.length];
  const next = KANJI[(idx + 1) % KANJI.length];
  const vocab = vocabEntries(k);
  const examples = k.examples || [];
  const strokePaths = k.strokeOrder?.paths || [];
  const radical = radicalEntryFor(k);
  const family = radicalSiblings(k);
  const readings = (arr) => arr.length
    ? arr.map((r) => `<span>${r}</span>`).join("")
    : '<span class="dash">—</span>';

  return `
    <div class="sheet-handle" aria-hidden="true"></div>
    <div class="sheet-top">
      <button class="icon-btn" data-action="close-sheet" aria-label="Close details" title="বন্ধ করুন (Esc)">${icon("x", 19)}</button>
      <span class="level-badge ${k.level}">JLPT ${k.level}</span>
      <button class="icon-btn ${fav ? "active" : ""}" data-action="fav" data-char="${k.char}" aria-label="${fav ? "Remove from favorites" : "Add to favorites"}" title="প্রিয় কাঞ্জি (F)">
        ${icon(fav ? "starFilled" : "star", 19)}
      </button>
    </div>

    <div class="kanji-stage-container">
      <div class="kanji-stage" id="kanji-stage">
        <!-- 4-quadrant dashed practice grid -->
        <svg class="stage-grid-bg" viewBox="0 0 109 109" aria-hidden="true">
          <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
          <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
          <rect x="0.5" y="0.5" width="108" height="108" fill="none" stroke="rgba(255,255,255,0.08)" rx="8" />
        </svg>

        <!-- Stroke Animation SVG Layer -->
        ${strokePaths.length ? `
          <svg class="stage-stroke-svg" id="stage-stroke-svg" viewBox="0 0 109 109" role="img" aria-label="Stroke order for ${k.char}">
            ${strokePaths.map((d, i) => `
              <path class="stage-stroke-path is-completed" data-stroke="${i + 1}" d="${d}" />
            `).join("")}
            <g class="stage-num-group" id="stage-num-group" style="${(typeof strokeShowNumbers !== 'undefined' && strokeShowNumbers) ? "" : "display:none"}">
              ${strokePaths.map((d, i) => {
                const m = d.match(/^[Mm]\s*([0-9.]+)[,\s]+([0-9.]+)/);
                if (!m) return "";
                const x = parseFloat(m[1]);
                const y = parseFloat(m[2]);
                return `<circle cx="${x}" cy="${y}" r="4.5" /><text x="${x}" y="${y}">${i + 1}</text>`;
              }).join("")}
            </g>
          </svg>
          <canvas class="practice-canvas" id="practice-canvas" style="display:none"></canvas>
        ` : `
          <div class="stage-static-char" lang="ja">${k.char}</div>
        `}
      </div>

      ${strokePaths.length ? `
        <!-- Tabs: Watch Animation vs Practice Writing -->
        <div class="stage-toolbar">
          <button class="stage-tab-btn active" data-action="stage-mode-watch" id="tab-watch-btn">
            ${icon("play", 13)} <span>অ্যানিমেশন (Watch)</span>
          </button>
          <button class="stage-tab-btn" data-action="stage-mode-draw" id="tab-draw-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            <span>হাতে লিখুন (Practice)</span>
          </button>
        </div>

        <!-- Controls for Watch Mode -->
        <div class="stage-action-bar" id="watch-controls">
          <button class="stage-pill-btn" data-action="stroke-replay" title="পুনরায় শুরু থেকে অ্যানিমেশন দেখুন">${icon("refresh", 13)} Replay</button>
          <button class="stage-pill-btn" data-action="stroke-prev" title="আগের দাগ">${icon("arrowLeft", 13)}</button>
          <button class="stage-pill-btn primary" data-action="stroke-play" id="stage-play-btn">${icon("play", 13)} <span id="stage-play-text">Play</span></button>
          <button class="stage-pill-btn" data-action="stroke-next" title="পরের দাগ">${icon("arrowRight", 13)}</button>
          <button class="stage-pill-btn ${(typeof strokeShowNumbers !== 'undefined' && strokeShowNumbers) ? "active" : ""}" data-action="stroke-toggle-numbers" title="দাগের নম্বর দেখুন">123</button>
        </div>

        <!-- Controls for Draw Mode -->
        <div class="stage-action-bar" id="draw-controls" style="display:none">
          <button class="stage-pill-btn danger" data-action="canvas-clear" title="ক্যানভাস পরিষ্কার করুন">${icon("trash", 13)} Clear</button>
          <button class="stage-pill-btn active" data-action="canvas-toggle-guide" id="canvas-guide-btn" title="গাইড অন/অফ">${icon("eye", 13)} Guide</button>
          <span class="stage-draw-hint">আঙুল বা মাউস দিয়ে কাঞ্জিটি লিখুন</span>
        </div>

        <div class="stage-status-line" id="stage-status-line">
          Stroke: <strong id="stroke-step-count">${strokePaths.length}</strong>/${strokePaths.length}
        </div>
      ` : ""}
    </div>

    <h2 class="detail-meaning">${escapeHtml(primaryMeaning(k))}</h2>
    ${secondaryMeaning(k) ? `<p class="detail-en">${escapeHtml(secondaryMeaning(k))}</p>` : ""}
    <p class="detail-sub">${LEVEL_NAMES[k.level] || k.level} · ${strokesText(k.strokes)}</p>

    <div class="reading-grid">
      <div class="reading-card">
        <div class="reading-card-head">
          <span>On'yomi (音読み)</span>
          <span class="reading-hint">কাতাকানা · একাধিক কাঞ্জির শব্দে</span>
        </div>
        <div class="reading-values" lang="ja">${readings(k.on)}</div>
      </div>
      <div class="reading-card">
        <div class="reading-card-head">
          <span>Kun'yomi (訓読み)</span>
          <span class="reading-hint">হিরাগানা · একক কাঞ্জি বা ওকুরিগানায়</span>
        </div>
        <div class="reading-values" lang="ja">${formatKunReadings(k.kun)}</div>
      </div>
    </div>
    <div class="reading-pedagogy-tip">
      ${icon("info", 14)}
      <span><strong>সহজ নিয়ম:</strong> কাঞ্জি যখন অন্য কাঞ্জির সাথে জোড় বাঁধে (যেমন 休日) তখন সাধারণত <strong>On'yomi</strong> হয়; আর কাঞ্জি একা থাকলে বা সাথে ওকুরিগানা (হিরাগানা লেজ) থাকলে <strong>Kun'yomi</strong> হয়। ডটের পরের অংশটি (যেমন <code>.つ</code>) কাঞ্জির বাইরে ওকুরিগানা হিসেবে বসে।</span>
    </div>

    <div class="detail-meta">
      <div><span class="meta-label">Radical</span><span class="meta-value" lang="ja">${k.radical}</span></div>
      <div><span class="meta-label">Strokes</span><span class="meta-value">${k.strokes}</span></div>
      <div><span class="meta-label">JLPT</span><span class="meta-value">${k.level}</span></div>
    </div>

    ${k.radicalInfo?.explanationBn ? `
      <p class="radical-note">${escapeHtml(k.radicalInfo.explanationBn)}</p>` : ""}

    ${radical ? `
      <section class="detail-panel radical-panel">
        <div class="panel-head">
          <span class="eyebrow">Radical family</span>
          <span class="small muted">#${String(radical.number).padStart(3, "0")} · ${strokesText(radical.strokes)}</span>
        </div>
        <div class="radical-head">
          <span class="radical-head-char" lang="ja" aria-hidden="true">${radical.char}</span>
          <span class="radical-head-copy">
            <strong>${escapeHtml(radical.meaningBn)}</strong>
            <span>${escapeHtml([radical.reading, radical.romaji].filter(Boolean).join(" · "))}${radical.variant ? ` · variant ${escapeHtml(radical.variant)}` : ""}</span>
          </span>
          <button class="text-link" data-action="open-radicals">All radicals ${icon("arrowRight", 13)}</button>
        </div>
        ${family.length ? `
          <div class="radical-family">
            ${family.map((item) => `<button class="radical-kanji ${item.level}" lang="ja" data-action="open-kanji" data-char="${item.char}" aria-label="${item.char}, ${escapeHtml(primaryMeaning(item))}, JLPT ${item.level}">${item.char}</button>`).join("")}
          </div>` : `<p class="small muted radical-empty-copy">No other kanji in this deck share this radical.</p>`}
      </section>` : ""}

    ${k.storyBn ? `
      <section class="detail-panel">
        <span class="eyebrow">Memory story</span>
        <p class="panel-text">${escapeHtml(k.storyBn)}</p>
        ${k.components?.length ? `
          <div class="component-chips">
            ${k.components.map((part) => `<span title="${escapeHtml(part.roleBn)}">${escapeHtml(part.char)}${part.meaningBn ? ` <em>${escapeHtml(part.meaningBn)}</em>` : ""}</span>`).join("")}
          </div>` : ""}
      </section>` : ""}

    ${k.usageBn ? `<p class="usage-note">${escapeHtml(k.usageBn)}</p>` : ""}

    ${vocab.length ? `
      <section class="detail-panel">
        <div class="panel-head">
          <span class="eyebrow">Vocabulary</span>
          <span class="small muted">${vocab.length} words</span>
        </div>
        <div class="vocab-list">
          ${vocab.map((v) => `
            <div class="vocab-row">
              <span class="vocab-jp" lang="ja">
                <span class="vocab-word" lang="ja">${v.ruby || escapeHtml(v.word)}</span>
                ${v.reading ? `<span class="vocab-reading" lang="ja">${escapeHtml(v.reading)}</span>` : ""}
              </span>
              <span class="vocab-meaning">${escapeHtml(v.meaningBn || v.meaning)}${v.meaningBn && v.meaningEn ? `<small>${escapeHtml(v.meaningEn)}</small>` : ""}</span>
              ${v.tts ? `<button class="speak-btn" data-action="speak" data-text="${escapeHtml(v.tts)}" aria-label="Speak ${escapeHtml(v.word)}">${icon("volume", 15)}</button>` : ""}
            </div>`).join("")}
        </div>
      </section>` : ""}

    ${examples.length ? `
      <section class="detail-panel">
        <span class="eyebrow">Example sentences</span>
        <div class="sentence-list">
          ${examples.map((ex) => sentenceMarkup(ex)).join("")}
        </div>
      </section>` : ""}

    ${!vocab.length && k.example ? `
      <div class="example-card">
        <span class="eyebrow">Example word</span>
        <div class="example-word" lang="ja">${escapeHtml(k.example.word)}<span>${escapeHtml(k.example.reading)}</span></div>
        <p>${escapeHtml(k.example.meaningBn || k.example.meaning)}</p>
      </div>` : ""}

    ${(() => {
      const srs = (typeof srsInfoForChar === "function") ? srsInfoForChar(k.char) : { isLearned: learned, stage: learned ? 1 : 0 };
      if (!srs.isLearned) {
        return `
          <div class="srs-detail-card">
            <div class="srs-card-top">
              <span class="srs-status-tag muted"><span class="srs-dot"></span> নতুন কাঞ্জি</span>
              <span class="srs-countdown-tag">${icon("sparkles", 13)} SRS মেমোরি শুরু করুন</span>
            </div>
            <p class="srs-explanation">
              বৈজ্ঞানিক <strong>Spaced Repetition System (SRS)</strong> এর মাধ্যমে কাঞ্জিটি শিখুন। এটি নির্দিষ্ট বিরতিতে রিভিশন মনে করিয়ে দিয়ে দীর্ঘমেয়াদি স্মৃতিতে গেঁথে ফেলে।
            </p>
            <div class="srs-action-buttons">
              <button class="btn primary wide" data-action="srs-start" data-char="${k.char}">
                ${icon("plus", 17)} বৈজ্ঞানিক SRS-এ যুক্ত করুন
              </button>
            </div>
          </div>`;
      }
      return `
        <div class="srs-detail-card active">
          <div class="srs-card-top">
            <span class="srs-status-tag ${srs.color || "teal"}"><span class="srs-dot"></span> ${srs.nameBn || srs.name} (ধাপ ${srs.stage}/6)</span>
            <span class="srs-countdown-tag ${srs.isDue ? "due" : ""}">${icon(srs.isDue ? "refresh" : "target", 13)} ${srs.dueText}</span>
          </div>
          <div class="srs-stepper">
            ${[1, 2, 3, 4, 5, 6].map((s) => `
              <div class="srs-step ${s <= srs.stage ? "filled" : ""} ${s === srs.stage ? "current" : ""}"></div>
            `).join("")}
          </div>
          <div class="srs-step-labels">
            <span>Apprentice (৪ ঘণ্টা)</span>
            <span>Guru (৩ দিন)</span>
            <span>Mastered (৩০ দিন)</span>
          </div>
          <p class="srs-explanation">
            পরবর্তী ব্যবধান: <strong>${srs.intervalText}</strong>। ${srs.isDue ? "এখনই রিভিশন দেওয়ার উপযুক্ত সময়!" : "নির্দিষ্ট সময়ে কুইজ দিয়ে পরবর্তী ধাপে উন্নীত হন।"}
          </p>
          <div class="srs-action-buttons">
            <button class="btn ${srs.isDue ? "primary" : "tonal"}" data-action="srs-review-single" data-char="${k.char}">
              ${icon("play", 16)} ${srs.isDue ? "এখনই কুইজ রিভিশন দিন" : "অনুশীলন কুইজ"}
            </button>
            <button class="btn ghost icon-only" data-action="srs-reset" data-char="${k.char}" title="SRS থেকে রিসেট করুন" aria-label="SRS রিসেট">
              ${icon("trash", 16)}
            </button>
          </div>
        </div>`;
    })()}

    <div class="sheet-nav">
      <button class="btn ghost" data-action="open-kanji" data-char="${prev.char}" aria-label="Previous kanji ${prev.char}" title="পূর্ববর্তী কাঞ্জি (← বা J)">
        ${icon("arrowLeft", 16)} ${prev.char} <span class="key-hint" aria-hidden="true">←</span>
      </button>
      <button class="btn ghost" data-action="open-kanji" data-char="${next.char}" aria-label="Next kanji ${next.char}" title="পরবর্তী কাঞ্জি (→ বা K)">
        <span class="key-hint" aria-hidden="true">→</span> ${next.char} ${icon("arrowRight", 16)}
      </button>
    </div>
  `;
}
