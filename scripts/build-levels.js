/* Build separate JSON files for lazy loading.
   Run: node scripts/build-levels.js */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const OUT_DIR = path.join(ROOT, "data");

function read(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "data", name), "utf8"));
}

function splitReadings(value) {
  return String(value || "")
    .split(/[,、]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function convert(entry, vocabMap) {
  const vocabIds = (entry.vocabulary || []).map((link) => link.id);
  const first = vocabMap.get(vocabIds[0]);

  return {
    id: entry.id,
    char: entry.character,
    meaning: entry.meaning_en || entry.meaning_bn || "",
    meaningBn: entry.meaning_bn || "",
    meaningEn: entry.meaning_en || "",
    level: entry.jlpt_level,
    strokes: entry.strokes,
    on: splitReadings(entry.on_reading),
    kun: splitReadings(entry.kun_reading),
    radical: entry.radicals || entry.radical_info?.radical_character || "",
    vocabIds,
    example: first
      ? {
          word: first.word,
          reading: first.reading,
          meaning: first.meaning,
        }
      : { word: entry.character, reading: entry.kun_reading || entry.on_reading || "", meaning: entry.meaning_en || "" },
    examples: (entry.examples || []).map((ex) => ({
      japanese: ex.japanese || "",
      reading: ex.reading || "",
      romaji: ex.romaji || "",
      meaningBn: ex.meaning_bn || "",
      meaningEn: ex.meaning_en || "",
    })),
    strokeOrder: entry.stroke_order?.paths?.length
      ? { types: entry.stroke_order.types || [], paths: entry.stroke_order.paths }
      : null,
    storyBn: entry.story_bn || "",
  };
}

const n5 = read("kanji_n5.json");
const n4 = read("kanji_n4.json");
const n3 = read("kanji_n3.json");
const n2 = read("kanji_n2.json");
const n1 = read("kanji_n1.json");
const grammar = read("grammar.json");
const radicalsRaw = read("radicals.json");

const levels = [
  { name: "n5", data: n5, meta: n5.meta },
  { name: "n4", data: n4, meta: n4.meta },
  { name: "n3", data: n3, meta: n3.meta },
  { name: "n2", data: n2, meta: n2.meta },
  { name: "n1", data: n1, meta: n1.meta },
];

// Build shared vocabulary map
const allVocabList = levels.flatMap((lvl) => lvl.data.vocabulary || []);
const vocabMap = new Map();
for (const item of allVocabList) {
  vocabMap.set(item.id, {
    id: item.id,
    word: item.word,
    reading: item.reading || "",
    meaning: item.meaning_en || item.meaning_bn || "",
    meaningBn: item.meaning_bn || "",
    meaningEn: item.meaning_en || "",
  });
}

// Build radicals
const radicals = radicalsRaw.map((row, index) => ({
  number: index + 1,
  char: row[0] || "",
  variant: row[1] || "",
  strokes: Number(row[2]) || 0,
  reading: row[3] || "",
  romaji: row[4] || "",
  meaningBn: row[5] || "",
}));

// Taxonomies
const taxonomy = {
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
  wordTopics: n5.taxonomy?.word_topics || {},
  situations: n5.taxonomy?.situations || {},
};

// Build each level
for (const { name, data, meta } of levels) {
  const kanji = (data.kanji || []).map((entry) => convert(entry, vocabMap));
  const vocab = new Map();
  for (const item of (data.vocabulary || [])) {
    vocab.set(item.id, {
      id: item.id,
      word: item.word,
      reading: item.reading || "",
      romaji: item.romaji || "",
      meaning: item.meaning_en || item.meaning_bn || "",
      meaningBn: item.meaning_bn || "",
      meaningEn: item.meaning_en || "",
      jlpt: item.jlpt || null,
      topics: item.topics || [],
    });
  }

  const output = {
    meta: { ...meta, generated: new Date().toISOString() },
    taxonomy: {
      ...taxonomy,
      [name]: { levelCount: kanji.length, vocabCount: vocab.size },
    },
    kanji,
    vocab: Object.fromEntries([...vocab.entries()]),
    radicals,
    grammar,
  };

  const outPath = path.join(OUT_DIR, `${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`✓ Built ${name}.json (${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`);
}

// Build radicals.json separately
const radicalOutput = {
  meta: { version: "1.0", updated: new Date().toISOString() },
  radicals,
};
fs.writeFileSync(path.join(OUT_DIR, "radicals.json"), JSON.stringify(radicalOutput, null, 2));
console.log(`✓ Built radicals.json (${(fs.statSync(path.join(OUT_DIR, "radicals.json")).size / 1024).toFixed(0)} KB)`);

console.log("\n✅ All JSON files built for lazy loading!");