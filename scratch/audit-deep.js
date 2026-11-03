const fs = require("fs");

const n5 = JSON.parse(fs.readFileSync("data/kanji_n5.json", "utf8"));
const n4 = JSON.parse(fs.readFileSync("data/kanji_n4.json", "utf8"));
const n3 = JSON.parse(fs.readFileSync("data/kanji_n3.json", "utf8"));

function auditLevel(lvlName, data) {
  const kanji = data.kanji;
  let hasStory = 0;
  let hasComponents = 0;
  let hasRadicalInfo = 0;
  let hasUsage = 0;
  let hasExamples = 0;
  let totalVocabLinks = 0;
  let hasOn = 0;
  let hasKun = 0;

  for (const k of kanji) {
    if (k.story_bn || k.storyBn) hasStory++;
    if (k.components && k.components.length) hasComponents++;
    if (k.radical_info || k.radicalInfo) hasRadicalInfo++;
    if (k.usage_bn || k.usageBn) hasUsage++;
    if (k.examples && k.examples.length) hasExamples++;
    if (k.vocabulary && k.vocabulary.length) totalVocabLinks += k.vocabulary.length;
    if (k.on_reading || (k.on && k.on.length)) hasOn++;
    if (k.kun_reading || (k.kun && k.kun.length)) hasKun++;
  }

  console.log(`\n=== ${lvlName} (${kanji.length} Kanji) ===`);
  console.log(`Stories (গল্প / Mnemonic): ${hasStory} / ${kanji.length}`);
  console.log(`Components (অংশ বিশ্লেষণ): ${hasComponents} / ${kanji.length}`);
  console.log(`Radical Info (রেডিক্যাল তথ্য): ${hasRadicalInfo} / ${kanji.length}`);
  console.log(`Usage Note (ব্যবহার বিধি): ${hasUsage} / ${kanji.length}`);
  console.log(`Sentences (উদাহরণ বাক্য): ${hasExamples} / ${kanji.length}`);
  console.log(`Vocabulary Links (শব্দ সংযোগ): ${totalVocabLinks} (Avg ${(totalVocabLinks / kanji.length).toFixed(1)} per kanji)`);
}

auditLevel("N5", n5);
auditLevel("N4", n4);
auditLevel("N3", n3);
