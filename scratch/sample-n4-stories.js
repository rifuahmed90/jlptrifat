const fs = require("fs");
const n4 = JSON.parse(fs.readFileSync("data/kanji_n4.json", "utf8"));

for (let i = 0; i < 3; i++) {
  const k = n4.kanji[i];
  console.log("=== Kanji:", k.character, "===");
  console.log("Meaning:", k.meaning_bn, "| Radicals:", k.radicals);
  console.log("Story:", k.story_bn);
  console.log("Components:", JSON.stringify(k.components, null, 2));
}
