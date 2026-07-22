#!/usr/bin/env node
/**
 * sync-miniprogram.js — 网站内容 → 小程序数据文件的单向同步。
 *
 * 网站 HTML 是唯一内容源。本脚本解析：
 *   1. storybooks/NN-*.html（经 for-youngest.html 目录）→ miniprogram/data/stories.js
 *   2. readers/NN-*.html（经 readers/index.html 的 READERS 表）→ miniprogram/data/readers.js
 *   3. dinner-questions.html 的 TOPICS 数组        → miniprogram/data/topics.js
 *
 * 插图：抽取每页/每节的第一个 <svg>，把 var(--x) 替换为 styles.css 里解析出的实际值，
 * 以 base64 data-URI 内联（小程序 image 组件不能直接引用本地 .svg 文件）。
 *
 * 用法：node scripts/sync-miniprogram.js     （在仓库根目录运行，幂等）
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'miniprogram', 'data');

const warnings = [];
function warn(msg) { warnings.push(msg); console.warn('⚠ ' + msg); }

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

// 从 styles.css 解析 CSS 自定义属性表（SVG 独立渲染时替换 var() 用）
const CSS_VARS = (function () {
  const css = read('styles.css');
  const vars = {};
  const re = /(--[a-z][a-z0-9-]*)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    if (!(m[1] in vars)) vars[m[1]] = m[2].trim();
  }
  return vars;
})();

function stripTags(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

// 页面 <style> 里可能定义局部变量（如读本的 --accent），抽出来覆盖全局表
function localVarsOf(html) {
  const vars = {};
  const re = /(--[a-z][a-z0-9-]*)\s*:\s*([^;}]+)[;}]/g;
  let m;
  while ((m = re.exec(html)) !== null) vars[m[1]] = m[2].trim();
  return vars;
}

function resolveVars(svg, localVars) {
  let depth = 0;
  let s = svg;
  // var() 的值可能又引用别的 var()，最多解 5 层
  while (/var\(--/.test(s) && depth < 5) {
    s = s.replace(/var\((--[a-z][a-z0-9-]*)(?:\s*,\s*([^()]+))?\)/g, function (m, name, fallback) {
      if (localVars && localVars[name]) return localVars[name];
      if (CSS_VARS[name]) return CSS_VARS[name];
      if (fallback) return fallback.trim();
      warn('找不到 CSS 变量 ' + name + '，替换为 currentColor');
      return 'currentColor';
    });
    depth++;
  }
  return s;
}

function svgToDataUri(svg, localVars) {
  let s = resolveVars(svg, localVars)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (!/xmlns=/.test(s)) s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  return 'data:image/svg+xml;base64,' + Buffer.from(s, 'utf8').toString('base64');
}

// 抽取字符串中第一个完整的 <svg>…</svg>
function firstSvg(html) {
  const start = html.indexOf('<svg');
  if (start === -1) return null;
  const end = html.indexOf('</svg>', start);
  if (end === -1) return null;
  return html.slice(start, end + 6);
}

function attr(tag, name) {
  const m = tag.match(new RegExp(name + '="([^"]*)"'));
  return m ? m[1] : null;
}

/* ── 1. 绘本 ─────────────────────────────────────────────── */

function syncStorybooks() {
  const catalogHtml = read('for-youngest.html');
  const catalogVars = localVarsOf(catalogHtml);
  // 目录卡片：<a class="book" data-bg=".." [data-gated="true"] href="storybooks/NN-slug.html"> … </a>
  const cardRe = /<a class="book"([^>]*)>([\s\S]*?)<\/a>/g;
  const books = [];
  let m;
  while ((m = cardRe.exec(catalogHtml)) !== null) {
    const href = attr(m[1], 'href');
    if (!href || !/^storybooks\//.test(href)) continue;
    const body = m[2];
    const title = stripTags((body.match(/<h3>([\s\S]*?)<\/h3>/) || [, ''])[1]);
    const theme = stripTags((body.match(/class="theme">([\s\S]*?)<\/div>/) || [, ''])[1]);
    const desc = stripTags((body.match(/class="desc">([\s\S]*?)<\/div>/) || [, ''])[1]);
    const badge = stripTags((body.match(/class="badge">([\s\S]*?)<\/div>/) || [, ''])[1]);
    const cover = firstSvg(body);
    const id = (href.match(/storybooks\/(\d+)/) || [, href])[1];
    books.push({
      id, file: href, title, theme, desc, badge,
      cover: cover ? svgToDataUri(cover, catalogVars) : null,
      gatedOnWeb: /data-gated="true"/.test(m[1])
    });
  }

  const contents = {};
  books.forEach(function (b) {
    const p = path.join(ROOT, b.file);
    if (!fs.existsSync(p)) { warn('绘本文件缺失：' + b.file + '（目录条目「' + b.title + '」）'); return; }
    const html = fs.readFileSync(p, 'utf8');
    const lv = localVarsOf(html);

    // 互动效果：makeInteractive(document.getElementById('pN-xxx'), 'do-anim', '气泡文案')
    // 小程序端整图触发，每页取第一条；forEach 批量注册的写法由第二个正则覆盖
    const fx = {};
    // 两种写法：makeInteractive(document.getElementById('pN-xxx'), …) 与 makeInteractive('pN-xxx', …)
    const fxRe = /makeInteractive\(\s*(?:document\.getElementById\(\s*)?['"]p(\d+)-[^'"]*['"]\s*\)?\s*,\s*['"]do-([a-z]+)['"]\s*,\s*['"]([^'"]*)['"]/g;
    // forEach 批量注册：['pN-a','pN-b'].forEach(id => makeInteractive(…, 'do-anim', 'msg'))
    const feRe = /\[\s*['"]p(\d+)-[^\]]*\]\s*\.forEach\(\s*id\s*=>\s*makeInteractive\([^,]*,\s*['"]do-([a-z]+)['"]\s*,\s*['"]([^'"]*)['"]/g;
    let fm;
    while ((fm = fxRe.exec(html)) !== null) {
      if (!fx[+fm[1]]) fx[+fm[1]] = { anim: fm[2], msg: fm[3] };
    }
    while ((fm = feRe.exec(html)) !== null) {
      if (!fx[+fm[1]]) fx[+fm[1]] = { anim: fm[2], msg: fm[3] };
    }

    const pages = [];
    // 正文页：<div class="page…" data-bg=".." data-text="..">…下一页前的内容里取第一个 svg
    const pageRe = /<div class="page[^"]*"([^>]*data-text="[^"]*"[^>]*)>/g;
    const starts = [];
    let pm;
    while ((pm = pageRe.exec(html)) !== null) {
      starts.push({ idx: pm.index, tag: pm[1] });
    }
    starts.forEach(function (s, i) {
      const blockEnd = i + 1 < starts.length ? starts[i + 1].idx : html.length;
      const block = html.slice(s.idx, blockEnd);
      const svg = firstSvg(block);
      pages.push({
        bg: attr(s.tag, 'data-bg') || 'yellow',
        text: stripTags(attr(s.tag, 'data-text') || ''),
        art: svg ? svgToDataUri(svg, lv) : null,
        fx: fx[i + 1] || null
      });
    });
    if (pages.length === 0) { warn(b.file + ' 未解析到任何 data-text 页，跳过正文'); return; }
    contents[b.id] = pages;
  });

  const out = '// GENERATED by scripts/sync-miniprogram.js — 不要手改，改网站源文件后重跑脚本\n' +
    'const CATALOG = ' + JSON.stringify(books.map(function (b) {
      return { id: b.id, title: b.title, theme: b.theme, desc: b.desc, badge: b.badge, cover: b.cover, available: !!contents[b.id] };
    })) + ';\n' +
    'const PAGES = ' + JSON.stringify(contents) + ';\n' +
    'function getStory(id) {\n' +
    '  const meta = CATALOG.find(function (b) { return b.id === id; });\n' +
    '  if (!meta || !PAGES[id]) return null;\n' +
    '  return Object.assign({}, meta, { pages: PAGES[id] });\n' +
    '}\n' +
    'module.exports = { CATALOG, getStory };\n';
  fs.writeFileSync(path.join(OUT, 'stories.js'), out);
  console.log('✓ stories.js：目录 ' + books.length + ' 本，正文 ' + Object.keys(contents).length + ' 本');
}

/* ── 2. 读本 ─────────────────────────────────────────────── */

function syncReaders() {
  const idxHtml = read('readers/index.html');
  const tableM = idxHtml.match(/const READERS = (\{[\s\S]*?\n    \});/);
  if (!tableM) { warn('readers/index.html 中未找到 READERS 表'); return; }
  const table = vm.runInNewContext('(' + tableM[1] + ')');

  const accentKey = function (a) {
    const km = String(a || '').match(/--([a-z]+)/);
    return km ? km[1] : 'coral';
  };

  const groups = [];
  const contents = {};
  Object.keys(table).forEach(function (groupName) {
    const items = [];
    table[groupName].forEach(function (row) {
      const code = row[0], title = row[1], sub = row[2], file = row[3], accent = row[4];
      if (!file) { items.push({ code, title, sub, color: accentKey(accent), id: null }); return; }
      const p = path.join(ROOT, 'readers', file);
      if (!fs.existsSync(p)) {
        warn('读本文件缺失：readers/' + file + '（' + code + ' ' + title + '）——按"敬请期待"处理');
        items.push({ code, title, sub, color: accentKey(accent), id: null });
        return;
      }
      const id = file.replace(/\.html$/, '');
      items.push({ code, title, sub, color: accentKey(accent), id });
      contents[id] = parseReader(fs.readFileSync(p, 'utf8'), id);
    });
    groups.push({ group: groupName, items });
  });

  const out = '// GENERATED by scripts/sync-miniprogram.js — 不要手改，改网站源文件后重跑脚本\n' +
    'const GROUPS = ' + JSON.stringify(groups) + ';\n' +
    'const CONTENT = ' + JSON.stringify(contents) + ';\n' +
    'function getReader(id) { return CONTENT[id] || null; }\n' +
    'module.exports = { GROUPS, getReader };\n';
  fs.writeFileSync(path.join(OUT, 'readers.js'), out);
  const n = groups.reduce(function (acc, g) { return acc + g.items.length; }, 0);
  console.log('✓ readers.js：' + groups.length + ' 组 ' + n + ' 篇（' + Object.keys(contents).length + ' 篇有正文）');
}

function parseReader(html, id) {
  const lv = localVarsOf(html);
  const pick = function (re) { const m = html.match(re); return m ? m[1] : ''; };
  const kicker = stripTags(pick(/<span class="kicker">([\s\S]*?)<\/span>/));
  const title = stripTags(pick(/<h1>([\s\S]*?)<\/h1>/)).replace(/\n/g, '');
  const hook = stripTags(pick(/<p class="hook">([\s\S]*?)<\/p>/));

  const sections = [];
  const secRe = /<section class="card">([\s\S]*?)<\/section>/g;
  let sm;
  while ((sm = secRe.exec(html)) !== null) {
    const body = sm[1];
    const h3 = stripTags((body.match(/<h3>([\s\S]*?)<\/h3>/) || [, ''])[1]);
    const paras = [];
    const pRe = /<p>([\s\S]*?)<\/p>/g;
    let pm2;
    while ((pm2 = pRe.exec(body)) !== null) paras.push(stripTags(pm2[1]));
    const svg = firstSvg(body);
    const caption = stripTags((body.match(/<figcaption>([\s\S]*?)<\/figcaption>/) || [, ''])[1]);
    sections.push({ h3, paras, art: svg ? svgToDataUri(svg, lv) : null, caption });
  }
  if (sections.length === 0) warn(id + ' 未解析到拆解卡片');

  const quoteBlock = pick(/<section class="card quote">([\s\S]*?)<\/section>/);
  const quote = stripTags((quoteBlock.match(/<p>([\s\S]*?)<\/p>/) || [, ''])[1]).replace(/\n/g, '');
  const quoteSrc = stripTags((quoteBlock.match(/class="src">([\s\S]*?)<\/span>/) || [, ''])[1]);

  const reflect = [];
  const refBlock = pick(/<section class="card reflect">([\s\S]*?)<\/section>/);
  const dRe = /<details>([\s\S]*?)<\/details>/g;
  let dm;
  while ((dm = dRe.exec(refBlock)) !== null) {
    reflect.push({
      q: stripTags((dm[1].match(/<summary>([\s\S]*?)<\/summary>/) || [, ''])[1]),
      hint: stripTags((dm[1].match(/class="hint">([\s\S]*?)<\/p>/) || [, ''])[1])
    });
  }

  const actionBlock = pick(/<section class="card action">([\s\S]*?)<\/section>/);
  const actionTitle = stripTags((actionBlock.match(/<h3>([\s\S]*?)<\/h3>/) || [, ''])[1]);
  const action = stripTags((actionBlock.match(/<p>([\s\S]*?)<\/p>/) || [, ''])[1]);

  return { id, kicker, title, hook, sections, quote, quoteSrc, reflect, actionTitle, action };
}

/* ── 3. 饭桌问题 ─────────────────────────────────────────── */

function syncTopics() {
  const html = read('dinner-questions.html');
  const m = html.match(/var TOPICS=(\[[\s\S]*?\n\]);/);
  if (!m) { warn('dinner-questions.html 中未找到 TOPICS 数组'); return; }
  const topics = vm.runInNewContext('(' + m[1] + ')');
  const om = html.match(/var THEMES_ORDER=(\[[^\]]*\]);/);
  const order = om ? vm.runInNewContext('(' + om[1] + ')') : [];
  const out = '// GENERATED by scripts/sync-miniprogram.js — 不要手改，改网站源文件后重跑脚本\n' +
    'const TOPICS = ' + JSON.stringify(topics) + ';\n' +
    'const THEMES_ORDER = ' + JSON.stringify(order) + ';\n' +
    'function weekOfYear() {\n' +
    '  const now = new Date();\n' +
    '  const start = new Date(now.getFullYear(), 0, 1);\n' +
    '  const day = Math.floor((now - start) / 864e5);\n' +
    '  return Math.min(' + topics.length + ', Math.max(1, Math.floor(day / 7) + 1));\n' +
    '}\n' +
    'module.exports = { TOPICS, THEMES_ORDER, weekOfYear };\n';
  fs.writeFileSync(path.join(OUT, 'topics.js'), out);
  console.log('✓ topics.js：' + topics.length + ' 个话题');
}

/* ── 4. 调色板 ───────────────────────────────────────────── */
// canvas 绘制（分享卡等）读不到 CSS 变量，从 styles.css 生成 JS 调色板，保持单一来源。
function syncPalette() {
  const names = ['coral', 'coral-soft', 'yellow', 'yellow-soft', 'green', 'green-soft',
    'blue', 'blue-soft', 'cream', 'cream-deep', 'paper', 'ink', 'ink-soft', 'ink-mute'];
  const palette = {};
  names.forEach(function (n) {
    const v = CSS_VARS['--' + n];
    if (!v) { warn('styles.css 缺少 --' + n + '，palette.js 跳过该项'); return; }
    // key 转驼峰：cream-deep → creamDeep
    const key = n.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
    palette[key] = v;
  });
  const out = '// GENERATED by scripts/sync-miniprogram.js — 不要手改，色值来自 styles.css 设计 token\n' +
    'const PALETTE = ' + JSON.stringify(palette, null, 2) + ';\n' +
    'module.exports = { PALETTE };\n';
  fs.writeFileSync(path.join(OUT, 'palette.js'), out);
  console.log('✓ palette.js：' + Object.keys(palette).length + ' 色');
}

/* ── main ───────────────────────────────────────────────── */

syncStorybooks();
syncReaders();
syncTopics();
syncPalette();

['stories.js', 'readers.js', 'topics.js', 'palette.js'].forEach(function (f) {
  const size = fs.statSync(path.join(OUT, f)).size;
  console.log('  ' + f + ' → ' + (size / 1024).toFixed(0) + ' KB');
});

/* ── 体积守护 ─────────────────────────────────────────────
   微信小程序主包上限 2 MB。内容是每天自动增长的（storybooks/readers
   由定时任务新增），所以每次同步都必须检查，不能等到上传时才发现。 */
function checkBundleSize() {
  const ROOT_MP = path.resolve(__dirname, '..', 'miniprogram');
  const LIMIT = 2 * 1024 * 1024;
  const WARN_AT = 1.9 * 1024 * 1024;
  const files = [];

  (function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else files.push({ path: path.relative(ROOT_MP, full), size: fs.statSync(full).size });
    });
  })(ROOT_MP);

  const total = files.reduce(function (a, f) { return a + f.size; }, 0);
  const mb = (total / 1024 / 1024).toFixed(2);
  console.log('\nminiprogram 总体积：' + mb + ' MB / 2.00 MB 上限');

  if (total < WARN_AT) return;

  console.log('体积最大的文件：');
  files.sort(function (a, b) { return b.size - a.size; }).slice(0, 8).forEach(function (f) {
    console.log('  ' + (f.size / 1024).toFixed(0).padStart(6) + ' KB  ' + f.path);
  });

  if (total >= LIMIT) {
    console.error('\n✗ 超过 2 MB 主包上限，无法上传。请先精简内容或拆分分包。');
    process.exit(1);
  }
  console.log('\n! 已超过 1.9 MB 预警线，离上限不远了。');
}

if (warnings.length) {
  console.log('\n共 ' + warnings.length + ' 条警告（见上）。');
} else {
  console.log('\n无警告，同步完成。');
}

checkBundleSize();
