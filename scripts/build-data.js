/* Build the app dataset from the JLPT JSON files in /data.
   Run: node scripts/build-data.js */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, "data", name), "utf8"));

const n5 = read("kanji_n5.json");
const n4 = read("kanji_n4.json");
const n3 = fs.existsSync(path.join(ROOT, "data", "kanji_n3.json")) ? read("kanji_n3.json") : null;
const n2 = fs.existsSync(path.join(ROOT, "data", "kanji_n2.json")) ? read("kanji_n2.json") : null;
const n1 = fs.existsSync(path.join(ROOT, "data", "kanji_n1.json")) ? read("kanji_n1.json") : null;
const legacyN3 = n3 ? [] : read("legacy_n3.json");
const radicalsRaw = read("radicals.json");
const grammarRaw = fs.existsSync(path.join(ROOT, "data", "grammar.json")) ? read("grammar.json") : [];

const allLevels = [n5, n4, n3, n2, n1].filter(Boolean);

const splitReadings = (value) => String(value || "")
  .split(/[,、]\s*/)
  .map((part) => part.trim())
  .filter(Boolean);

/* One shared vocabulary registry: N5 through N1. */
const vocab = new Map();
const allVocabList = allLevels.flatMap((lvl) => lvl.vocabulary || []);
for (const item of allVocabList) {
  vocab.set(item.id, {
    id: item.id,
    word: item.word,
    reading: item.reading || "",
    romaji: item.romaji || "",
    meaning: item.meaning_en || item.meaning_bn || "",
    meaningBn: item.meaning_bn || "",
    meaningEn: item.meaning_en || "",
    type: item.word_type || item.type || "",
    pos: item.part_of_speech || "",
    topics: item.topics || [],
    jlpt: item.jlpt || null,
    ruby: item.word_ruby || "",
    tts: item.tts || item.reading || item.word,
  });
}

function convert(entry) {
  const vocabIds = (entry.vocabulary || []).map((link) => link.id);
  const first = vocab.get(vocabIds[0]);

  return {
    id: entry.id,
    char: entry.character,
    meaning: entry.meaning_en || entry.meaning_bn || "",
    meaningBn: entry.meaning_bn || "",
    meaningEn: entry.meaning_en || "",
    level: entry.jlpt_level,
    listSource: entry.list_source || "core",
    strokes: entry.strokes,
    categories: entry.categories || [],
    on: splitReadings(entry.on_reading),
    kun: splitReadings(entry.kun_reading),
    onRomaji: entry.on_romaji || "",
    kunRomaji: entry.kun_romaji || "",
    readingType: entry.reading_type || "",
    radical: entry.radicals || entry.radical_info?.radical_character || "",
    radicalInfo: entry.radical_info ? {
      character: entry.radical_info.radical_character || "",
      nameBn: entry.radical_info.radical_name_bn || "",
      nameEn: entry.radical_info.radical_name_en || "",
      number: entry.radical_info.radical_number || null,
      explanationBn: entry.radical_info.explanation_bn || "",
    } : null,
    components: (entry.components || []).map((part) => ({
      char: part.component,
      meaningBn: part.meaning_bn || "",
      roleBn: part.role_bn || "",
    })),
    storyBn: entry.story_bn || "",
    storyNoteBn: entry.story_note_bn || "",
    usageBn: entry.usage_note_bn || "",
    onTts: entry.on_tts || [],
    kunTts: entry.kun_tts || [],
    vocabIds,
    example: first ? {
      word: first.word,
      reading: first.reading,
      meaning: first.meaning,
      meaningBn: first.meaningBn,
    } : { word: entry.character, reading: entry.kun_reading || entry.on_reading || "", meaning: entry.meaning_en || "" },
    examples: (entry.examples || []).map((ex) => ({
      japanese: ex.japanese || "",
      reading: ex.reading || "",
      romaji: ex.romaji || "",
      meaningBn: ex.meaning_bn || "",
      meaningEn: ex.meaning_en || "",
      ruby: ex.japanese_ruby || "",
      tts: ex.tts || ex.reading || ex.japanese || "",
      situationBn: ex.situation_bn || "",
    })),
    strokeOrder: entry.stroke_order?.paths?.length ? {
      types: entry.stroke_order.types || [],
      paths: entry.stroke_order.paths,
    } : null,
  };
}

const allRichKanji = allLevels.flatMap((lvl) => lvl.kanji || []);
const rich = allRichKanji.map(convert);
const legacy = legacyN3.map((entry, index) => ({
  ...entry,
  id: entry.id || `k_legacy_n3_${String(index + 1).padStart(4, "0")}`,
  meaningBn: entry.meaningBn || "",
  meaningEn: entry.meaningEn || entry.meaning || "",
  vocabIds: [],
  examples: [],
  components: [],
  storyBn: "",
  usageBn: "",
  strokeOrder: null,
}));

const kanji = [...rich, ...legacy];
const vocabObject = Object.fromEntries([...vocab.entries()].sort(([a], [b]) => a.localeCompare(b)));

/* Vocabulary use-cases come from the kanji links (situation tags + notes). */
const vocabSituations = new Map();
for (const entry of allRichKanji) {
  for (const link of entry.vocabulary || []) {
    const rec = vocabSituations.get(link.id) || { tags: new Set(), notes: new Set() };
    for (const tag of link.situation_tags || []) rec.tags.add(tag);
    if (link.situation_bn) rec.notes.add(link.situation_bn);
    vocabSituations.set(link.id, rec);
  }
}
for (const [id, item] of vocab) {
  const rec = vocabSituations.get(id);
  item.situations = rec ? [...rec.tags] : [];
  item.situationBn = rec ? [...rec.notes][0] || "" : "";
}

const taxonomy = {
  kanjiCategories: Object.assign({}, ...allLevels.map((lvl) => lvl.taxonomy?.kanji_categories || {})),
  wordTopics: n5.taxonomy?.word_topics || {},
  situations: n5.taxonomy?.situations || {},
  partsOfSpeech: n5.taxonomy?.part_of_speech || {},
  wordType: n5.taxonomy?.word_type || {},
};

/* RADICALS: [char, variant, strokes, reading, romaji, meaning_bn, [kanji refs]] */
const radicals = radicalsRaw.map((row, index) => ({
  number: index + 1,
  char: row[0] || "",
  variant: row[1] || "",
  strokes: Number(row[2]) || 0,
  reading: row[3] || "",
  romaji: row[4] || "",
  meaningBn: row[5] || "",
  kanji: (row[6] || []).map((item) => ({ char: item[0], level: item[1] || "" })),
}));

const banner = `/* Generated by scripts/build-data.js — do not edit by hand.
   Source: data/kanji_n5.json, data/kanji_n4.json, data/kanji_n3.json, data/kanji_n2.json, data/kanji_n1.json */\n`;

const metaLevels = {};
for (const lvl of allLevels) {
  if (lvl.meta && lvl.meta.jlpt_level) {
    metaLevels[lvl.meta.jlpt_level.toLowerCase()] = lvl.meta;
  }
}

const body = `${banner}
const DATA_META = ${JSON.stringify({
  ...metaLevels,
  radicals: { count: radicals.length },
  words: vocab.size,
  generated: new Date().toISOString(),
}, null, 2)};

const TAXONOMY = ${JSON.stringify(taxonomy, null, 2)};

const VOCAB = {
${Object.entries(vocabObject).map(([id, item]) => `  ${JSON.stringify(id)}: ${JSON.stringify(item)},`).join("\n")}
};

const RADICALS = [
${radicals.map((item) => `  ${JSON.stringify(item)},`).join("\n")}
];

const GRAMMAR = [
${grammarRaw.map((item) => `  ${JSON.stringify(item)},`).join("\n")}
];

const KANJI = [
${kanji.map((item) => `  ${JSON.stringify(item)},`).join("\n")}
];
`;

const out = path.join(ROOT, "js", "data.js");
fs.writeFileSync(out, body);
console.log(`Wrote ${path.relative(ROOT, out)}`);
const summaryLevels = allLevels.map((lvl) => `${lvl.meta?.jlpt_level || "Level"} ${lvl.kanji?.length || 0}`).join(", ");
console.log(`Kanji: ${kanji.length} (${summaryLevels})`);
console.log(`Vocabulary: ${vocab.size}`);
console.log(`Radicals: ${radicals.length}`);
console.log(`Size: ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
