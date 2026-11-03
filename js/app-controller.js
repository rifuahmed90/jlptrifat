/* Main application controller for OpenJLPT.
   Initializes data loader and manages app state. */

import { DataManager } from './data-loader.js';

let dataManager;
let appState = {
  currentLevel: 'n5',
  currentView: 'home',
  learned: JSON.parse(localStorage.getItem('openjlpt-learned') || '[]'),
  favorites: JSON.parse(localStorage.getItem('openjlpt-favorites') || '[]'),
  quiz: { correct: 0, total: 0 },
  best: Number(localStorage.getItem('openjlpt-best') || 0),
  streak: 0,
};

async function initApp() {
  dataManager = new DataManager();
  await dataManager.init();

  // Load initial data
  await loadLevelData(appState.currentLevel);

  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }

  // Set up background sync for offline backup
  if ('serviceWorker' in navigator && 'syncManager' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register('save-offline-backup');
    });
  }

  // Listen for offline backup message
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'OFFLINE_BACKUP') {
      localStorage.setItem('openjlpt-data-backup-v1', JSON.stringify(event.data.data));
    }
  });

  renderHome();
}

async function loadLevelData(level) {
  const data = await dataManager.loadLevel(level);
  if (!data) {
    console.warn(`Could not load ${level} data`);
    return null;
  }
  return data;
}

async function switchLevel(newLevel) {
  if (appState.currentLevel === newLevel) return;

  if (!dataManager.isLoaded(newLevel)) {
    const data = await loadLevelData(newLevel);
    if (data) {
      appState.currentLevel = newLevel;
      renderCurrentView();
    }
  } else {
    appState.currentLevel = newLevel;
    renderCurrentView();
  }
}

function renderCurrentView() {
  switch (appState.currentView) {
    case 'home':
      renderHome();
      break;
    case 'browse':
      renderBrowse();
      break;
    case 'review':
      renderReview();
      break;
    case 'quiz':
      renderQuiz();
      break;
    default:
      renderHome();
  }
}

function renderHome() {
  const levelData = dataManager.cache.get(appState.currentLevel);
  if (!levelData) return;

  const kanjiCount = levelData.kanji?.length || 0;
  const vocabCount = Object.keys(levelData.vocab || {}).length || 0;

  document.getElementById('view').innerHTML = `
    <div class="level-card">
      <h1>JLPT ${appState.currentLevel.toUpperCase()}</h1>
      <p>kanji: ${kanjiCount} • vocab: ${vocabCount}</p>
      <button data-action="start-review">Start Review (${appState.quiz.correct}/${appState.quiz.total})</button>
      <button data-action="show-browse">Browse Kanji</button>
    </div>
  `;

  setupEventListeners();
}

function setupEventListeners() {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', handleAction);
  });
}

function handleAction(e) {
  const action = e.target.dataset.action;
  switch (action) {
    case 'start-review':
      startReviewSession();
      break;
    case 'show-browse':
      appState.currentView = 'browse';
      renderBrowse();
      break;
  }
}

function startReviewSession() {
  const levelData = dataManager.cache.get(appState.currentLevel);
  if (levelData?.kanji?.length) {
    appState.currentView = 'review';
    renderReview();
  }
}

function renderBrowse() {
  const levelData = dataManager.cache.get(appState.currentLevel);
  if (!levelData) return;

  document.getElementById('view').innerHTML = `
    <div class="browse-container">
      <h1>Browse ${appState.currentLevel.toUpperCase()}</h1>
      <input type="text" id="kanji-search" placeholder="Search kanji..." />
      <div id="results"></div>
    </div>
  `;

  const searchInput = document.getElementById('kanji-search');
  const results = document.getElementById('results');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    const filtered = (levelData.kanji || []).filter(k =>
      k.char?.toLowerCase().includes(query) ||
      k.meaning?.toLowerCase().includes(query) ||
      k.reading?.toLowerCase().includes(query)
    ).slice(0, 50);

    results.innerHTML = filtered.map(k => `
      <div class="kanji-item" data-char="${k.char}">
        <span class="kanji-char">${k.char}</span>
        <span class="kanji-meaning">${k.meaning}</span>
      </div>
    `).join('');
  });

  setupEventListeners();

  // Initial search to show all
  searchInput.value = '';
  searchInput.dispatchEvent(new Event('input'));
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initApp);

export { initApp, switchLevel, appState, dataManager };