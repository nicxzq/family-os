#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'readers', 'index.html');
const readersDir = path.join(repoRoot, 'readers');
const source = fs.readFileSync(indexPath, 'utf8');

const entryPattern = /\[\s*'([^']+)'\s*,\s*'[^']*'\s*,\s*'[^']*'\s*,\s*(null|'([^']+)')\s*,\s*'([^']+)'\s*\]/g;
const failures = [];
const seenCodes = new Set();

let match;
let count = 0;

while ((match = entryPattern.exec(source)) !== null) {
  count += 1;
  const [, code, rawFile, file, accent] = match;

  if (seenCodes.has(code)) {
    failures.push(`${code}: duplicated catalog code`);
  }
  seenCodes.add(code);

  if (rawFile !== 'null') {
    const filePath = path.join(readersDir, file);
    if (!fs.existsSync(filePath)) {
      failures.push(`${code}: missing reader file readers/${file}`);
    }
  }

  if (!accent.startsWith('var(--')) {
    failures.push(`${code}: accent must use a CSS token, got "${accent}"`);
  }
}

if (count === 0) {
  failures.push('No reader entries parsed from readers/index.html');
}

if (failures.length > 0) {
  console.error('Reader index validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Reader index validation passed for ${count} entries.`);
