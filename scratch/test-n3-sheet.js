const vm = require("vm");
const fs = require("fs");

const dataJs = fs.readFileSync("js/data.js", "utf8");
const viewsJs = fs.readFileSync("js/views.js", "utf8");
const appJs = fs.readFileSync("js/app.js", "utf8");

const ctx = {
  console,
  setTimeout: () => {},
  clearTimeout: () => {},
  setInterval: () => 123,
  clearInterval: () => {},
  window: { scrollTo: () => {} },
  document: {
    getElementById: () => ({ dataset: {}, classList: { toggle: () => {}, remove: () => {}, add: () => {} }, innerHTML: "", addEventListener: () => {} }),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {},
    body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } }
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  navigator: {},
  location: { protocol: "http:" },
  speakJapanese: () => {}
};

vm.createContext(ctx);
vm.runInContext(dataJs, ctx);
vm.runInContext(viewsJs, ctx);
vm.runInContext(appJs, ctx);

const kSei = vm.runInContext("KANJI.find(k => k.char === '政')", ctx);
const html = vm.runInContext(`sheetMarkup(KANJI.find(k => k.char === '政'))`, ctx);

console.log("=== Testing Sheet for N3 Kanji '政' ===");
console.log("Has Memory Story Panel:", html.includes("Memory story"));
console.log("Has Component Chips:", html.includes("component-chips"));
console.log("Story text included:", html.includes("ন্যায় বা সঠিক"));
