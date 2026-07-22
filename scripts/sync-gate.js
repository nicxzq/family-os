#!/usr/bin/env node
/* sync-gate.js — enforce the login gate on all gated content. Idempotent.
 *
 * Run it after adding/generating any content (the daily storybook task calls it
 * as its final step). It guarantees every gated page loads /fo-gate.js, so new
 * storybooks/readers can never ship unprotected even if generation forgets.
 *
 * Policy (single source of truth):
 *   - Eldest readers:   every readers/*.html content page (except index.html).
 *   - Youngest books:   numeric storybooks linked in for-youngest.html with
 *                       number >= 4 (01–03 stay free). Their listing card is
 *                       also forced to data-gated="true". Middle-child m##
 *                       bear books are NOT touched.
 *   - Eldest games:     every games/g*.html except the first game of each group
 *                       (the free tasters below).
 *
 * Usage:  node scripts/sync-gate.js          (from repo root)
 */
const fs = require('fs');
const path = require('path');
const glob = require('fs').readdirSync;

const ROOT = path.resolve(__dirname, '..');
const GUARD = '<script src="/fo-gate.js"></script>';
const FREE_GAMES = new Set([
  'g01-direction', 'g21-chemistry', 'g22-physics', 'g41-blocks', 'g44-history-detective',
]);
const FREE_YOUNGEST_MAX = 3; // storybooks 01–03 are free

const changes = [];
const warnings = [];

function injectGuard(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) { warnings.push(`missing file: ${relPath}`); return; }
  let s = fs.readFileSync(abs, 'utf8');
  if (s.includes('/fo-gate.js')) return;            // already guarded
  if (!s.includes('</head>')) { warnings.push(`no </head>: ${relPath}`); return; }
  s = s.replace('</head>', GUARD + '</head>');
  fs.writeFileSync(abs, s);
  changes.push(`guarded: ${relPath}`);
}

// 1) Eldest readers — every content page.
for (const f of glob(path.join(ROOT, 'readers'))) {
  if (f.endsWith('.html') && f !== 'index.html') injectGuard(`readers/${f}`);
}

// 2) Eldest games — every game except the free tasters.
for (const f of glob(path.join(ROOT, 'games'))) {
  if (/^g.*\.html$/.test(f) && !FREE_GAMES.has(f.replace('.html', ''))) {
    injectGuard(`games/${f}`);
  }
}

// 3) Youngest storybooks — gate NN>=4 books linked from for-youngest.html and
//    force data-gated on their cards.
const listingPath = path.join(ROOT, 'for-youngest.html');
let listing = fs.readFileSync(listingPath, 'utf8');
let listingChanged = false;
listing = listing.replace(/<a\b[^>]*class="book"[^>]*>/g, (tag) => {
  const href = (tag.match(/href="storybooks\/(\d+)-[^"]*\.html"/) || [])[0];
  const numM = tag.match(/href="storybooks\/(\d+)-/);
  if (!href || !numM) return tag;                  // not a numeric youngest book
  const num = parseInt(numM[1], 10);
  if (num <= FREE_YOUNGEST_MAX) return tag;        // free book
  const file = href.match(/storybooks\/[^"]+/)[0];
  injectGuard(file);                               // guard the book page
  if (/\bdata-gated=/.test(tag)) return tag;       // card already marked
  listingChanged = true;
  changes.push(`marked data-gated: ${file}`);
  return tag.replace('<a ', '<a data-gated="true" ');
});
if (listingChanged) fs.writeFileSync(listingPath, listing);

// Report
if (changes.length) {
  console.log('sync-gate: applied ' + changes.length + ' change(s):');
  changes.forEach((c) => console.log('  - ' + c));
} else {
  console.log('sync-gate: all gated content already protected. No changes.');
}
if (warnings.length) {
  console.log('sync-gate: ' + warnings.length + ' warning(s):');
  warnings.forEach((w) => console.log('  ! ' + w));
}

// 4) Chain: regenerate the storybook order and inject cross-book navigation
//    (the daily storybook task adds new books, so this must never be manual).
try {
  require('child_process').execFileSync(
    process.execPath, [path.join(__dirname, 'gen-booklist.js')],
    { stdio: 'inherit' }
  );
  require('child_process').execFileSync(
    process.execPath, [path.join(__dirname, 'sync-book-nav.js')],
    { stdio: 'inherit' }
  );
} catch (e) {
  console.log('sync-gate: book nav sync failed (gating unaffected): ' + e.message);
  process.exitCode = 1;
}

// 5) Chain: regenerate mini-program data from website content (the daily
//    storybook task runs sync-gate as its final step, so this keeps
//    miniprogram/data/ in sync automatically). Failure must not break gating.
try {
  require('child_process').execFileSync(
    process.execPath, [path.join(__dirname, 'sync-miniprogram.js')],
    { stdio: 'inherit' }
  );
} catch (e) {
  console.log('sync-gate: sync-miniprogram.js failed (gating unaffected): ' + e.message);
  process.exitCode = 1;
}
