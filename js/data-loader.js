/* Lazy data loader for OpenJLPT.
   Loads JSON data on-demand for offline-first PWA. */
class DataManager {
  constructor() {
    this.cache = new Map();
    this.loadedLevels = new Set();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    // Try to load from cache/localStorage first
    const backup = this.loadFromBackup();
    if (backup) {
      for (const [level, data] of Object.entries(backup)) {
        this.cache.set(level, data);
        this.loadedLevels.add(level);
      }
    }
  }

  loadFromBackup() {
    try {
      const backup = localStorage.getItem('openjlpt-data-backup-v1');
      return backup ? JSON.parse(backup) : null;
    } catch {
      return null;
    }
  }

  saveToBackup(data) {
    try {
      localStorage.setItem('openjlpt-data-backup-v1', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save backup:', e);
    }
  }

  async loadLevel(level) {
    const validLevels = ['n5', 'n4', 'n3', 'n2', 'n1'];
    if (!validLevels.includes(level)) {
      console.warn(`Invalid level: ${level}`);
      return null;
    }

    // Return cached data if available
    if (this.cache.has(level)) {
      return this.cache.get(level);
    }

    try {
      const response = await fetch(`/data/${level}.json`);
      if (!response.ok) throw new Error(`Failed to load ${level}`);

      const data = await response.json();
      this.cache.set(level, data);
      this.loadedLevels.add(level);

      // Save partial backup
      const backup = this.loadFromBackup() || {};
      backup[level] = data;
      this.saveToBackup(backup);

      return data;
    } catch (e) {
      console.error(`Error loading level ${level}:`, e);
      return null;
    }
  }

  async loadRadicals() {
    if (this.cache.has('radicals')) {
      return this.cache.get('radicals');
    }

    try {
      const response = await fetch('/data/radicals.json');
      const data = await response.json();
      this.cache.set('radicals', data);
      return data;
    } catch (e) {
      console.error('Failed to load radicals:', e);
      return { radicals: [] };
    }
  }

  async loadGrammar() {
    if (this.cache.has('grammar')) {
      return this.cache.get('grammar');
    }

    const n5 = await this.loadLevel('n5');
    if (n5?.grammar) {
      this.cache.set('grammar', { grammar: n5.grammar });
      return { grammar: n5.grammar };
    }
    return { grammar: [] };
  }

  getKanji(level, char) {
    const data = this.cache.get(level);
    if (!data) return null;
    return data.kanji ? data.kanji.find((k) => k.char === char) : null;
  }

  getVocabulary(level, id) {
    const data = this.cache.get(level);
    if (!data) return null;
    return data.vocab ? data.vocab[id] : null;
  }

  isLoaded(level) {
    return this.loadedLevels.has(level);
  }

  getCacheSize() {
    return this.cache.size;
  }

  clearCache() {
    this.cache.clear();
    this.loadedLevels.clear();
    localStorage.removeItem('openjlpt-data-backup-v1');
  }
}

// Singleton instance
const dataManager = new DataManager();
window.dataManager = dataManager;

export { DataManager };