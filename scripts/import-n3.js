/* =========================================================
   Import OpenJLPT N3 Kanji & Vocabulary
   Source: https://github.com/evanclan/OpenJLPT
   ========================================================= */

const fs = require("fs");
const path = require("path");

function furiganaToRuby(text) {
  if (!text) return "";
  return text.replace(/\{([^|]+)\|([^}]+)\}/g, "<ruby>$1<rt>$2</rt></ruby>");
}

async function run() {
  console.log("Fetching N3 Kanji and Vocabulary from OpenJLPT...");

  const [rawKanji, rawVocab] = await Promise.all([
    fetch("https://raw.githubusercontent.com/evanclan/OpenJLPT/main/data/json/kanji/n3.json").then((r) => r.json()),
    fetch("https://raw.githubusercontent.com/evanclan/OpenJLPT/main/data/json/vocab/n3.json").then((r) => r.json()),
  ]);

  console.log(`Fetched ${rawKanji.length} N3 kanji, ${rawVocab.length} N3 vocab.`);

  // 1. Process Vocabulary
  const wordToId = new Map();
  const vocabulary = rawVocab.map((item, idx) => {
    const id = `w_n3_${String(idx + 1).padStart(4, "0")}`;
    wordToId.set(item.word, id);

    const meaningEn = Array.isArray(item.meanings) ? item.meanings.join(", ") : String(item.meanings || "");
    const primaryEx = item.examples && item.examples[0];
    let wordRuby = item.word;
    if (primaryEx && primaryEx.furigana) {
      const match = primaryEx.furigana.match(new RegExp(`\\{${item.word}\\|([^}]+)\\}`));
      if (match) {
        wordRuby = `<ruby>${item.word}<rt>${match[1]}</rt></ruby>`;
      }
    }

    return {
      id,
      word: item.word,
      reading: item.reading || "",
      romaji: item.romaji || "",
      meaning_bn: "", // to be translated later
      meaning_en: meaningEn,
      type: (item.pos && item.pos[0]) || "General",
      part_of_speech: Array.isArray(item.pos) ? item.pos.join(", ") : String(item.pos || ""),
      word_ruby: wordRuby,
      tts: item.reading || item.word,
      jlpt: "N3",
      rawExamples: item.examples || [],
    };
  });

  // 2. Process Kanji
  const kanji = rawKanji.map((item, idx) => {
    const id = `k_n3_${String(idx + 1).padStart(4, "0")}`;
    const meaningEn = Array.isArray(item.meanings) ? item.meanings.join(", ") : String(item.meanings || "");
    const onReading = Array.isArray(item.onyomi) ? item.onyomi.join(", ") : "";
    const kunReading = Array.isArray(item.kunyomi) ? item.kunyomi.join(", ") : "";

    // Find linked vocabulary
    const linkedVocabIds = [];
    const kanjiWords = Array.isArray(item.words) ? item.words : [];
    for (const w of kanjiWords) {
      if (wordToId.has(w)) {
        linkedVocabIds.push(wordToId.get(w));
      }
    }

    // If no direct words from list, search vocabulary containing character
    if (linkedVocabIds.length < 3) {
      for (const v of vocabulary) {
        if (v.word.includes(item.character) && !linkedVocabIds.includes(v.id)) {
          linkedVocabIds.push(v.id);
          if (linkedVocabIds.length >= 6) break;
        }
      }
    }

    // Build example sentences from linked vocabulary
    const examples = [];
    for (const vId of linkedVocabIds) {
      const v = vocabulary.find((x) => x.id === vId);
      if (v && v.rawExamples && v.rawExamples.length) {
        for (const ex of v.rawExamples) {
          if (examples.length >= 2) break;
          examples.push({
            id: `${id}_s${examples.length + 1}`,
            japanese: ex.ja || "",
            reading: "",
            romaji: "",
            meaning_bn: "",
            meaning_en: ex.en || "",
            japanese_ruby: furiganaToRuby(ex.furigana || ex.ja || ""),
            tts: ex.ja || "",
          });
        }
      }
      if (examples.length >= 2) break;
    }

    return {
      id,
      character: item.character,
      strokes: item.strokes || 0,
      meaning_bn: "", // to be translated later
      meaning_en: meaningEn,
      meaning_display: meaningEn,
      on_reading: onReading,
      on_romaji: "",
      kun_reading: kunReading,
      kun_romaji: "",
      jlpt_level: "N3",
      radicals: item.radical || "",
      radical_info: item.radical ? {
        radical_number: item.radical_number || null,
        radical_character: item.radical,
        radical_name_en: "",
        radical_name_bn: "",
        explanation_bn: "",
      } : null,
      components: [],
      vocabulary: linkedVocabIds.map((vId) => ({ id: vId })),
      story_bn: "",
      usage_note_bn: "",
      list_source: "openjlpt",
      categories: ["general"],
      reading_type: onReading && kunReading ? "both" : onReading ? "on" : "kun",
      on_tts: onReading.split(/[,、]\s*/).filter(Boolean),
      kun_tts: kunReading.split(/[,、]\s*/).filter(Boolean),
      examples,
      stroke_order: null,
    };
  });

  // Clean rawExamples from vocabulary before saving
  const cleanVocab = vocabulary.map(({ rawExamples, ...rest }) => rest);

  const output = {
    meta: {
      version: "1.0",
      source: "OpenJLPT (evanclan/OpenJLPT)",
      jlpt_level: "N3",
      kanji_count: kanji.length,
      vocab_count: cleanVocab.length,
    },
    taxonomy: {
      kanji_categories: { general: "সাধারণ" },
    },
    kanji,
    vocabulary: cleanVocab,
  };

  const outPath = path.resolve(__dirname, "../data/kanji_n3.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
  console.log(`Successfully generated ${outPath} with ${kanji.length} kanji and ${cleanVocab.length} words!`);
}

run().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
