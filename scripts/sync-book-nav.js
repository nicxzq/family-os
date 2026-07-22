#!/usr/bin/env node
/**
 * Inject cross-book navigation into the youngest child's storybooks.
 *
 * Idempotent and self-correcting, like sync-gate.js: it adds the stylesheet,
 * the generated booklist and the one-line init call to any numeric storybook
 * (NN-*.html) that is missing them. Middle-child `m##` bear books are skipped.
 *
 * The nav itself only becomes visible on a book's last page (see
 * FO.initBookNav in fo-utils.js).
 *
 * Chained from scripts/sync-gate.js, after scripts/gen-booklist.js.
 * Run standalone: node scripts/sync-book-nav.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'storybooks');

const CSS_TAG = '<link rel="stylesheet" href="/storybooks/book-nav.css">';
const LIST_TAG = '<script src="/storybooks/booklist.js"></script>';
const INIT_TAG = '<script>if (window.FO && window.FO.initBookNav) FO.initBookNav(BOOK_ID);</script>';

function patch(file) {
  const full = path.join(DIR, file);
  let html = fs.readFileSync(full, 'utf8');
  const before = html;

  if (!html.includes(CSS_TAG)) {
    html = html.replace('</head>', `${CSS_TAG}\n</head>`);
  }
  // booklist + init must run after the book's own script defines BOOK_ID
  if (!html.includes(LIST_TAG)) {
    html = html.replace('</body>', `${LIST_TAG}\n${INIT_TAG}\n</body>`);
  }

  if (html === before) return false;
  fs.writeFileSync(full, html);
  return true;
}

const books = fs
  .readdirSync(DIR)
  .filter((f) => /^\d{2}-.*\.html$/.test(f))
  .sort();

let patched = 0;
const skipped = [];
for (const file of books) {
  const html = fs.readFileSync(path.join(DIR, file), 'utf8');
  if (!html.includes('</body>') || !html.includes('BOOK_ID')) {
    skipped.push(file);
    continue;
  }
  if (patch(file)) patched++;
}

console.log(`sync-book-nav: ${books.length} books, ${patched} patched`);
if (skipped.length) console.log(`sync-book-nav: skipped (no BOOK_ID/</body>): ${skipped.join(', ')}`);
