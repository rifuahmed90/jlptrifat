const fs = require("fs");
const n3 = JSON.parse(fs.readFileSync("data/kanji_n3.json", "utf8"));

const missing = n3.kanji.filter(k => !k.examples || !k.examples.length);
console.log("Missing count:", missing.length);
console.log("Chars:", missing.map(k => k.character).join(", "));
