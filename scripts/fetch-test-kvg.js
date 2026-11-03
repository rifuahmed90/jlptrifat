const char = "政";
const hex = char.codePointAt(0).toString(16).padStart(5, "0");
const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;

fetch(url)
  .then((r) => r.text())
  .then((svg) => {
    const paths = [];
    const types = [];
    const re = /<path[^>]+kvg:type="([^"]+)"[^>]+d="([^"]+)"/g;
    let m;
    while ((m = re.exec(svg)) !== null) {
      types.push(m[1]);
      paths.push(m[2]);
    }
    // Also fallback if order of attributes differs
    if (!paths.length) {
      const dMatches = [...svg.matchAll(/d="([^"]+)"/g)].map((x) => x[1]);
      paths.push(...dMatches);
    }
    console.log(`Fetched ${char} (${hex}): ${paths.length} strokes.`);
    console.log("Types:", types);
    console.log("First path:", paths[0]);
  })
  .catch(console.error);
