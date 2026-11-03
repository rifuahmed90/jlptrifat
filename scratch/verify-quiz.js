const vm = require("vm");
const fs = require("fs");

const dataJs = fs.readFileSync("js/data.js", "utf8");
const viewsJs = fs.readFileSync("js/views.js", "utf8");
const appJs = fs.readFileSync("js/app.js", "utf8");

// Mock browser environment
const ctx = {
  console,
  setTimeout: () => {},
  clearTimeout: () => {},
  window: { scrollTo: () => {} },
  document: {
    getElementById: () => ({ dataset: {}, classList: { toggle: () => {}, remove: () => {}, add: () => {} }, innerHTML: "", addEventListener: () => {} }),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {},
    body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } }
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  },
  navigator: {},
  location: { protocol: "http:" },
  speakJapanese: () => {}
};

vm.createContext(ctx);
vm.runInContext(dataJs, ctx);
vm.runInContext(viewsJs, ctx);
vm.runInContext(appJs, ctx);

// Test startQuiz for each level and mode
console.log("=== Testing Quiz Engine ===");

vm.runInContext('startQuiz("N5", "reading", "all")', ctx);
let quiz = vm.runInContext("quiz", ctx);
let q = quiz.questions[0];
console.log("\n[N5 - Reading Mode]");
console.log("Kanji:", q.char);
console.log("Mondai:", q.mondaiType);
console.log("Sentence Prompt:", q.sentencePrompt);
console.log("Answer:", q.answer);
console.log("Options (1-4):", q.options);

vm.runInContext('startQuiz("N5", "reverse", "all")', ctx);
quiz = vm.runInContext("quiz", ctx);
q = quiz.questions[0];
console.log("\n[N5 - Reverse / 表記 Mode]");
console.log("Kanji:", q.char);
console.log("Mondai:", q.mondaiType);
console.log("Sentence Prompt:", q.sentencePrompt);
console.log("Meaning:", q.meaning);
console.log("Answer:", q.answer);
console.log("Options (1-4):", q.options);

vm.runInContext('startQuiz("N3", "reading", "all")', ctx);
quiz = vm.runInContext("quiz", ctx);
q = quiz.questions[0];
console.log("\n[N3 - Reading Mode]");
console.log("Kanji:", q.char);
console.log("Mondai:", q.mondaiType);
console.log("Sentence Prompt:", q.sentencePrompt);
console.log("Answer:", q.answer);
console.log("Options (1-4):", q.options);

vm.runInContext('startQuiz("N3", "reverse", "all")', ctx);
quiz = vm.runInContext("quiz", ctx);
q = quiz.questions[0];
console.log("\n[N3 - Reverse / 表記 Mode]");
console.log("Kanji:", q.char);
console.log("Mondai:", q.mondaiType);
console.log("Meaning:", q.meaning);
console.log("Answer:", q.answer);
console.log("Options (1-4):", q.options);

// Test rendering
console.log("\n[Testing renderQuizActive HTML output]");
vm.runInContext('startQuiz("N5", "reading", "all")', ctx);
const html = vm.runInContext('renderQuizActive()', ctx);
console.log("HTML length:", html.length);
console.log("Contains quiz-mondai-badge:", html.includes("quiz-mondai-badge"));
console.log("Contains quiz-sentence:", html.includes("quiz-sentence"));
console.log("Contains options:", html.includes("class=\"options\""));
