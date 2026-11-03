const fs = require("fs");
const path = require("path");

const cssToAdd = `
/* ============================================================
   Grammar, Conjugation & Traps Guide Styles
   ============================================================ */
.guide-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}
.guide-card-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}
.guide-card-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(143, 231, 198, 0.15);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}
.guide-card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
}
.guide-card-subtitle {
  font-size: 13px;
  color: var(--text-2);
  margin-top: 3px;
}
.guide-table-wrap {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--border);
  margin: 14px 0;
  background: var(--surface-2);
}
.guide-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}
.guide-table th {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  font-weight: 600;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.guide-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  color: var(--text-2);
  vertical-align: middle;
}
.guide-table tr:last-child td {
  border-bottom: none;
}
.guide-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}
.guide-callout {
  background: var(--surface-2);
  border-left: 4px solid var(--primary);
  border-radius: 0 12px 12px 0;
  padding: 14px 16px;
  margin: 14px 0;
  font-size: 13.5px;
  line-height: 1.6;
}
.guide-callout.warning {
  border-left-color: #ff9800;
  background: rgba(255, 152, 0, 0.08);
}
.guide-callout.danger {
  border-left-color: #f44336;
  background: rgba(244, 67, 54, 0.08);
}
.guide-callout.success {
  border-left-color: #4caf50;
  background: rgba(76, 175, 80, 0.08);
}
.rhyme-box {
  background: linear-gradient(135deg, rgba(143, 231, 198, 0.12) 0%, rgba(100, 181, 246, 0.12) 100%);
  border: 1.5px dashed var(--primary);
  border-radius: 14px;
  padding: 16px 18px;
  margin: 14px 0;
  font-size: 14px;
  line-height: 1.7;
}
.wrong-right-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 12px 0;
}
@media (max-width: 600px) {
  .wrong-right-box {
    grid-template-columns: 1fr;
  }
}
.wrong-item {
  background: rgba(244, 67, 54, 0.08);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.5;
}
.right-item {
  background: rgba(76, 175, 80, 0.08);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.5;
}
.comparison-tag-wrong {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f44336;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 6px;
}
.comparison-tag-right {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  background: #4caf50;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 6px;
}
.chip-pill {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  font-size: 12px;
  font-weight: 600;
  margin: 2px;
}
`;

// 1. Update css/styles.css if not already present
let css = fs.readFileSync("css/styles.css", "utf8");
if (!css.includes(".guide-card")) {
  fs.writeFileSync("css/styles.css", css + "\n" + cssToAdd, "utf8");
  console.log("Updated css/styles.css with grammar guide styles.");
}

// 2. Update js/app.js to handle grammar-tab action
let appJs = fs.readFileSync("js/app.js", "utf8");
if (!appJs.includes('case "grammar-tab":')) {
  appJs = appJs.replace(
    '    case "open-grammar":\n      setView("grammar");\n      break;',
    '    case "open-grammar":\n      setView("grammar");\n      break;\n    case "grammar-tab":\n      grammarTab = target.dataset.tab || "list";\n      render(false);\n      break;'
  );
  fs.writeFileSync("js/app.js", appJs, "utf8");
  console.log("Updated js/app.js with grammar-tab dispatcher.");
}

console.log("Assets preparation completed.");
