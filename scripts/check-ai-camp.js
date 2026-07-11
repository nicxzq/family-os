const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const data = read('ai-camp-data.js');
const page = read('ai-camp.html');
const styles = read('styles.css');
const home = read('index.html');
const eldest = read('for-eldest.html');
const dashboard = read('dashboard.html');
const expectedIds = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

expectedIds.forEach((id) => {
  assert(data.includes("id: '" + id + "'"), 'Missing task ID: ' + id);
});
assert((data.match(/id: '[EGL][1-6]'/g) || []).length === expectedIds.length, 'Expected exactly 18 task records');
['fo_ai_camp_2026', 'export-data', 'import-data', 'clear-data', '完成证据', '先留下一条完成证据'].forEach((marker) => {
  assert(page.includes(marker), 'Missing console capability: ' + marker);
});
['ai-camp.html', '暑期 AI 创造营'].forEach((marker) => {
  assert(home.includes(marker), 'Homepage entry is missing ' + marker);
  assert(eldest.includes(marker), 'Eldest entry is missing ' + marker);
  assert(dashboard.includes(marker), 'Dashboard entry is missing ' + marker);
});
assert(styles.includes('.camp-page'), 'Missing camp page styles');
assert(fs.existsSync(path.join(root, 'ai-camp-og.png')), 'Missing social preview image');

const inlineScript = page.match(/<script>\s*([\s\S]*?)\s*<\/script>\s*<\/body>/);
assert(inlineScript, 'Missing inline camp behavior script');
new Function(inlineScript[1]);

console.log('AI camp checks passed');
