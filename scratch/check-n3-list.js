const fs = require("fs");
const n3 = JSON.parse(fs.readFileSync("data/kanji_n3.json", "utf8"));
console.log("Total N3 kanji:", n3.kanji.length);
console.log("First 10:", n3.kanji.slice(0, 10).map(k => `${k.character} (${k.meaning_bn})`));
