#!/usr/bin/env node
/**
 * gen-idea-art.js — 为六条原则生成"同风格"扁平插画。
 *
 * 输出 PNG 到 miniprogram/assets/idea-art/<id>.png（<id> = data/ideas.js 的 idea.id），
 * 并写 miniprogram/data/idea-art.js（id → 包内路径映射，生成物勿手改）。
 *
 * 为什么用 PNG 而非内联 SVG：微信 canvas 2d 的 createImage 在部分机型不能解码 svg data-URI，
 * 而分享卡/家庭墙导出要把插画画进 canvas，PNG 全平台可用。<image> 组件也直接用同一 PNG。
 *
 * 风格对齐 storybooks：纯色扁平、圆润、白色角色（paper）+ coral 五官，取自 styles.css 调色板。
 * 光栅化用 macOS 的 qlmanage（本仓库开发机为 darwin；换平台需替换该步）。
 *
 * 用法：node scripts/gen-idea-art.js（幂等）。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ASSET_DIR = path.join(ROOT, 'miniprogram', 'assets', 'idea-art');
const OUT = path.join(ROOT, 'miniprogram', 'data', 'idea-art.js');
fs.mkdirSync(ASSET_DIR, { recursive: true });

const CSS = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
function cssVar(name) {
  const m = CSS.match(new RegExp('--' + name + '\\s*:\\s*([^;]+);'));
  return m ? m[1].trim() : null;
}
const C = {
  coral: cssVar('coral'), coralSoft: cssVar('coral-soft'),
  yellow: cssVar('yellow'), yellowSoft: cssVar('yellow-soft'),
  green: cssVar('green'), greenSoft: cssVar('green-soft'),
  blue: cssVar('blue'), blueSoft: cssVar('blue-soft'),
  cream: cssVar('cream'), creamDeep: cssVar('cream-deep'),
  paper: cssVar('paper'), ink: cssVar('ink'), inkMute: cssVar('ink-mute')
};

function frame(inner) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">' +
    '<rect width="240" height="160" rx="16" fill="' + C.cream + '"/>' + inner + '</svg>';
}
function chick(cx, cy, r) {
  return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + C.paper + '"/>' +
    '<circle cx="' + (cx - r * 0.32) + '" cy="' + (cy - r * 0.12) + '" r="' + (r * 0.14) + '" fill="' + C.ink + '"/>' +
    '<circle cx="' + (cx + r * 0.32) + '" cy="' + (cy - r * 0.12) + '" r="' + (r * 0.14) + '" fill="' + C.ink + '"/>' +
    '<polygon points="' + cx + ',' + (cy + r * 0.05) + ' ' + (cx + r * 0.5) + ',' + (cy + r * 0.22) + ' ' + cx + ',' + (cy + r * 0.32) + '" fill="' + C.coral + '"/>';
}

const ART = {};

// 1. 方向比目标：山坡 + 蜿蜒小路 + coral 旗 + 走路的小角色
ART.development = frame(
  '<circle cx="196" cy="40" r="18" fill="' + C.yellow + '"/>' +
  '<path d="M0 132 Q60 104 120 122 T240 110 V160 H0 Z" fill="' + C.greenSoft + '"/>' +
  '<path d="M44 140 C84 116 96 148 134 124 S192 108 204 92" fill="none" stroke="' + C.inkMute + '" stroke-width="4" stroke-dasharray="5 9" stroke-linecap="round"/>' +
  '<line x1="204" y1="92" x2="204" y2="56" stroke="' + C.ink + '" stroke-width="4"/>' +
  '<polygon points="204,56 232,64 204,74" fill="' + C.coral + '"/>' +
  chick(48, 126, 13)
);

// 2. 读书是家事：一摞书 + 翻开的书
ART.reading = frame(
  '<rect x="52" y="112" width="120" height="16" rx="4" fill="' + C.coral + '"/>' +
  '<rect x="60" y="96" width="112" height="16" rx="4" fill="' + C.blue + '"/>' +
  '<rect x="68" y="80" width="104" height="16" rx="4" fill="' + C.green + '"/>' +
  '<path d="M120 40 C104 30 84 30 72 40 V78 C84 68 104 68 120 78 Z" fill="' + C.paper + '"/>' +
  '<path d="M120 40 C136 30 156 30 168 40 V78 C156 68 136 68 120 78 Z" fill="' + C.yellowSoft + '"/>' +
  '<line x1="120" y1="42" x2="120" y2="78" stroke="' + C.inkMute + '" stroke-width="3"/>'
);

// 3. 一起学不教训：两个白角色 + 中间 yellow 灯泡
ART['learn-together'] = frame(
  '<circle cx="120" cy="44" r="20" fill="' + C.yellow + '"/>' +
  '<rect x="114" y="60" width="12" height="10" rx="2" fill="' + C.inkMute + '"/>' +
  '<line x1="120" y1="18" x2="120" y2="8" stroke="' + C.yellow + '" stroke-width="4" stroke-linecap="round"/>' +
  '<line x1="150" y1="30" x2="158" y2="22" stroke="' + C.yellow + '" stroke-width="4" stroke-linecap="round"/>' +
  '<line x1="90" y1="30" x2="82" y2="22" stroke="' + C.yellow + '" stroke-width="4" stroke-linecap="round"/>' +
  chick(72, 118, 26) +
  chick(168, 118, 26)
);

// 4. 软技能也是学问：饭桌 + 两个对话气泡
ART['soft-skills'] = frame(
  '<rect x="40" y="112" width="160" height="14" rx="6" fill="' + C.blue + '"/>' +
  '<rect x="58" y="126" width="10" height="22" rx="3" fill="' + C.inkMute + '"/>' +
  '<rect x="172" y="126" width="10" height="22" rx="3" fill="' + C.inkMute + '"/>' +
  '<circle cx="120" cy="108" r="10" fill="' + C.yellow + '"/>' +
  '<path d="M60 36 h56 a12 12 0 0 1 12 12 v16 a12 12 0 0 1 -12 12 h-30 l-12 12 v-12 h-14 a12 12 0 0 1 -12 -12 v-16 a12 12 0 0 1 12 -12 Z" fill="' + C.coralSoft + '"/>' +
  '<path d="M150 62 h32 a10 10 0 0 1 10 10 v12 a10 10 0 0 1 -10 10 h-20 l-10 10 v-10 h-2 a10 10 0 0 1 -10 -10 v-12 a10 10 0 0 1 10 -10 Z" fill="' + C.blueSoft + '"/>'
);

// 5. 保护注意力：同心圆专注光环 + coral 焦点 + 守护括弧
ART.attention = frame(
  '<circle cx="120" cy="80" r="54" fill="none" stroke="' + C.coralSoft + '" stroke-width="6"/>' +
  '<circle cx="120" cy="80" r="36" fill="none" stroke="' + C.yellow + '" stroke-width="6"/>' +
  '<circle cx="120" cy="80" r="16" fill="' + C.coral + '"/>' +
  '<path d="M40 44 C18 70 18 90 40 116" fill="none" stroke="' + C.green + '" stroke-width="7" stroke-linecap="round"/>' +
  '<path d="M200 44 C222 70 222 90 200 116" fill="none" stroke="' + C.green + '" stroke-width="7" stroke-linecap="round"/>'
);

// 6. 不慌时间是朋友：沙漏 + 绿叶 + 平静小角色
ART.time = frame(
  '<path d="M84 36 H156 L124 80 L156 124 H84 L116 80 Z" fill="' + C.blueSoft + '"/>' +
  '<path d="M84 36 H156 M84 124 H156" stroke="' + C.ink + '" stroke-width="5" stroke-linecap="round"/>' +
  '<path d="M108 52 H132 L122 70 H118 Z" fill="' + C.yellow + '"/>' +
  '<path d="M110 118 H130 L124 96 H116 Z" fill="' + C.yellow + '"/>' +
  '<path d="M168 120 q16 -6 22 -22 q-16 2 -22 22 Z" fill="' + C.green + '"/>' +
  chick(56, 120, 16)
);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-art-'));
const map = {};
Object.keys(ART).forEach(function (id) {
  const svgPath = path.join(tmp, id + '.svg');
  fs.writeFileSync(svgPath, ART[id].replace(/\s{2,}/g, ' '));
  // qlmanage 光栅化：-s 720 → 长边 720，得 720x480 PNG
  execFileSync('qlmanage', ['-t', '-s', '720', '-o', tmp, svgPath], { stdio: 'ignore' });
  const png = path.join(tmp, id + '.svg.png');
  if (!fs.existsSync(png)) { throw new Error('qlmanage 未生成 ' + png + '（需 macOS）'); }
  // qlmanage 把缩略图放进正方形画布（720x720），上下留透明边；居中裁回 3:2 内容区
  execFileSync('sips', ['-c', '480', '720', png], { stdio: 'ignore' });
  fs.copyFileSync(png, path.join(ASSET_DIR, id + '.png'));
  map[id] = '/assets/idea-art/' + id + '.png';
});
fs.rmSync(tmp, { recursive: true, force: true });

const out = '// GENERATED by scripts/gen-idea-art.js — 不要手改，改插画改脚本后重跑\n' +
  '// 六条原则的同风格扁平插画路径，键 = data/ideas.js 里的 idea.id\n' +
  'const IDEA_ART = ' + JSON.stringify(map, null, 2) + ';\n' +
  'module.exports = { IDEA_ART };\n';
fs.writeFileSync(OUT, out);
console.log('✓ idea-art：' + Object.keys(map).length + ' 张 PNG → assets/idea-art/，映射写入 idea-art.js');
