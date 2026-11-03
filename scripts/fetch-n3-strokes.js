/* =========================================================
   Fetch KanjiVG Stroke Order Paths for all 387 N3 Kanji
   ========================================================= */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const n3Path = path.join(ROOT, "data", "kanji_n3.json");
const n3 = JSON.parse(fs.readFileSync(n3Path, "utf8"));

function parseSvgPaths(svg) {
  const paths = [];
  const types = [];

  // Parse path with kvg:type and d
  const pathRegex = /<path\b([^>]+)>/g;
  let match;
  while ((match = pathRegex.exec(svg)) !== null) {
    const attrStr = match[1];
    const dMatch = attrStr.match(/\bd="([^"]+)"/);
    if (!dMatch) continue;
    const typeMatch = attrStr.match(/\bkvg:type="([^"]+)"/);
    types.push(typeMatch ? typeMatch[1] : "");
    paths.push(dMatch[1]);
  }

  return { paths, types };
}

async function fetchStrokesForChar(char) {
  const hex = char.codePointAt(0).toString(16).padStart(5, "0");
  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Could not fetch SVG for ${char} (${hex}): HTTP ${res.status}`);
      return null;
    }
    const svg = await res.text();
    return parseSvgPaths(svg);
  } catch (err) {
    console.warn(`Error fetching ${char} (${hex}):`, err.message);
    return null;
  }
}

async function run() {
  console.log(`Starting stroke order fetch for ${n3.kanji.length} N3 kanji...`);

  let successCount = 0;
  const batchSize = 15;

  for (let i = 0; i < n3.kanji.length; i += batchSize) {
    const batch = n3.kanji.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (k) => {
        const strokeData = await fetchStrokesForChar(k.character);
        if (strokeData && strokeData.paths.length) {
          k.stroke_order = {
            types: strokeData.types,
            paths: strokeData.paths,
          };
          successCount++;
        }
      })
    );
    process.stdout.write(`Processed ${Math.min(i + batchSize, n3.kanji.length)}/${n3.kanji.length} kanji...\r`);
  }

  console.log(`\nSuccessfully fetched stroke orders for ${successCount}/${n3.kanji.length} N3 kanji!`);

  fs.writeFileSync(n3Path, JSON.stringify(n3, null, 2), "utf8");
  console.log("Updated data/kanji_n3.json with stroke order data!");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
