const vm = require("vm");
const fs = require("fs");

const codeData = fs.readFileSync("js/data.js", "utf8");
const codeViews = fs.readFileSync("js/views.js", "utf8");

const ctx = {
  document: { addEventListener: () => {} },
  window: {},
  console: console,
  navigator: { language: "en-US" },
  localStorage: { getItem: () => null, setItem: () => {} },
  byChar: {},
  currentLevel: "all",
  icon: (name) => `<svg class="icon-${name}"></svg>`,
  escapeHtml: (s) => String(s || "")
};

vm.createContext(ctx);
vm.runInContext(codeData, ctx);
vm.runInContext(codeViews, ctx);

const res1 = vm.runInContext("renderGrammar()", ctx);
console.log("Grammar List rendered, length:", res1.length);

vm.runInContext("grammarTab = 'guide'", ctx);
const res2 = vm.runInContext("renderGrammar()", ctx);
console.log("Grammar Guide rendered, length:", res2.length);

vm.runInContext("grammarTab = 'traps'", ctx);
const res3 = vm.runInContext("renderGrammar()", ctx);
console.log("Grammar Traps rendered, length:", res3.length);

console.log("All 3 grammar views rendered successfully!");

