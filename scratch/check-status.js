const fs = require("fs");

const n5 = JSON.parse(fs.readFileSync("data/kanji_n5.json", "utf8"));
const n4 = JSON.parse(fs.readFileSync("data/kanji_n4.json", "utf8"));
const n3 = JSON.parse(fs.readFileSync("data/kanji_n3.json", "utf8"));

console.log("=== DATASET AUDIT ===");
console.log("N5 Kanji:", n5.kanji.length, "| Vocab:", n5.vocabulary.length, "| Missing Bn:", n5.vocabulary.filter(w => !w.meaning_bn).length);
console.log("N4 Kanji:", n4.kanji.length, "| Vocab:", n4.vocabulary.length, "| Missing Bn:", n4.vocabulary.filter(w => !w.meaning_bn).length);
console.log("N3 Kanji:", n3.kanji.length, "| Vocab:", n3.vocabulary.length, "| Missing Bn:", n3.vocabulary.filter(w => !w.meaning_bn).length);

// Check strokes in N3
const n3NoStrokes = n3.kanji.filter(k => !k.stroke_order || !k.stroke_order.paths || !k.stroke_order.paths.length);
console.log("N3 Kanji without stroke paths:", n3NoStrokes.length);

// Check Tatoeba examples
const n3NoEx = n3.kanji.filter(k => !k.examples || !k.examples.length);
console.log("N3 Kanji without examples:", n3NoEx.length);
