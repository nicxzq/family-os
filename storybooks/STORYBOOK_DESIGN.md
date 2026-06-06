# Storybook Design Spec

Complete reference for generating new storybooks in this project. Follow every section precisely to stay consistent with the existing library.

---

## 1. File naming & routing

- File: `storybooks/NN-slug.html` (e.g. `07-focus.html`)
- Route: `/storybooks/NN-slug` (Vercel `cleanUrls`)
- N continues from the latest number

---

## 2. Concept & content rules

All content must be grounded in Li Xiaolai's six family principles from `uploads/`:

| # | Principle | Chinese |
|---|---|---|
| 1 | Direction > goal | 方向 比 目标 重要 |
| 2 | Reading is family business | 读书 是 家事 |
| 3 | Learn together, don't lecture | 一起学，不教训 |
| 4 | Soft skills are real skills | 软技能 也是 学问 |
| 5 | Protect each other's attention | 保护 彼此的 注意力 |
| 6 | Time is your friend | 不慌，时间是朋友 |

- Audience: the youngest child (6 years old), read aloud by a parent
- Tone: warm, gentle, concrete, short sentences
- Each page: one key image + 1–3 sentences of text
- Last page: always an `end-card` with a memorable take-away phrase (no `.scene`)

---

## 3. Characters

All characters are SVG illustrations — **no external images**.

### Mao Mao (毛毛) — small chick, protagonist
```
Body: white ellipse (rx≈22 ry≈24)
Head: white circle (r≈18)
Eyes: two black filled circles (r≈3)
Beak: orange/coral triangle (points="0,-23 10,-20 0,-17")
Wing (optional): yellow ellipse, rotated
Accent color: none — always white with coral beak
```

### Dad (爸爸鸡) — tall chick, reads books
```
Body: white ellipse (rx≈32 ry≈36)
Head: white circle (r≈26)
Glasses: two white circles with #2B2419 stroke + connecting line
Beak: coral triangle (slightly larger than Mao Mao's)
Book: blue rect #4B7BA8 with white inner rect and ruled lines
```

### Kamela (卡梅拉) — Mao Mao's adventurous friend
```
Same size as Mao Mao, same structure
Distinguishing feature: tilted head or leaning pose; often drawn mid-action
```

### Generic chick / background characters
- White body + head, coral beak, black dot eyes
- Differentiate by size (larger = adult), accessories, or pose

### Character drawing rules
- All characters are pure white `#FFFDF6` (paper token) with `#E56B5A` coral beaks
- Eyes: `#2B2419` (ink token)
- Characters should be centered in their `<g>` so the `transform-origin: center center` works for interactions
- Wrap each character in `<g id="pN-name">` where N is the page number and name is the role
- Use `transform="translate(cx,cy)"` on the `<g>` so `(0,0)` is the character's visual center
- The outer character `<g id="pN-name" transform="translate(cx,cy)">` is the **position layer only**. Never apply click, shake, bounce, wobble, or float CSS transforms directly to this outer group.
- Interactive animation must run on an inner animation layer. The runtime `makeInteractive()` below creates this layer automatically for existing books; new hand-written SVG may also use `<g id="pN-name" transform="translate(cx,cy)"><g data-interaction-layer>...</g></g>`.
- If two or more characters are talking on the same page, place all speaking characters in the same SVG viewport with clear horizontal separation. Do not crop one speaker, hide one behind a prop, or place a speech bubble where it covers another speaker's face.

---

## 4. SVG scene conventions

```xml
<svg viewBox="0 0 400 320">
  <!-- background elements first (sky, ground, furniture) -->
  <!-- mid-ground next -->
  <!-- characters on top, each in their own <g id="pN-*"> -->
</svg>
```

- **viewBox always `0 0 400 320`** — do not change
- Scene fills the full viewport (see Layout section); SVG uses `preserveAspectRatio="xMidYMid meet"` (default)
- Characters should occupy the middle zone `x: 80–320, y: 60–260` to avoid clipping at viewport edges
- Interactive elements get `id="pN-name"` and are wired up in the script block

---

## 5. Color palette

Use only these tokens (mapped to CSS variables in `styles.css`):

| Token | Hex | Usage |
|---|---|---|
| `--coral` | `#E56B5A` | Primary CTA, accent text, beaks |
| `--coral-soft` | `#F4A799` | Page background "coral" |
| `--yellow` | `#F4C13E` | Sun, coins, accent |
| `--yellow-soft` | `#FBE39A` | Page background "yellow" |
| `--green` | `#6FA86D` | Plants, nature, growth |
| `--green-soft` | `--B5D4A8` | Page background "mint" |
| `--blue` | `#4B7BA8` | Books, sky, dad's items |
| `--blue-soft` | `#A8C2DE` | Page background "sky"/"blue" |
| `--cream` | `#F8F2E2` | Default page background |
| `--cream-deep` | `#F1E8D0` | Warm cream variant — use as `#FBE3D5` "peach" |
| `--ink` | `#2B2419` | Body text, eyes, outlines |
| `--ink-soft` | `#5C4F3D` | Secondary text |
| `--ink-mute` | `#8C7C66` | Muted details |
| `--paper` | `#FFFDF6` | Character bodies, cards |

**Page backgrounds** — pick one per page, cycle through for variety:

| `data-bg` value | Actual color |
|---|---|
| `cream` | `#F8F2E2` |
| `peach` | `#FBE3D5` |
| `mint` | `#D7EBC9` |
| `sky` | `#D7E7F4` |
| `yellow` | `#FBE39A` |
| `coral` | `#F4A799` |
| `blue` | `#A8C2DE` |

**Accent color for dots, big text, end-card heading** — pick one per book and use consistently:
- Coral books: `#E56B5A`
- Blue books: `#4B7BA8`
- Green books: `#6FA86D`

---

## 6. Typography

- **Font**: `"LXGW WenKai TC"` only — loaded from Google Fonts
- `.text h2`: main page heading — `clamp(22px, 4.5vw, 34px)`, weight 500
- `.text .big`: emphasis phrase — `clamp(28px, 5.5vw, 44px)`, weight 700, accent color
- `.text .small`: supporting text — `clamp(14px, 2.8vw, 16px)`, `--ink-soft`
- End-card heading: `28px`, accent color
- End-card body: `19px`, `--ink`, `line-height: 1.7`

---

## 7. Page layout (full-screen, fixed)

```
┌─────────────────────────────────────┐ ← 100vh
│  ← 回绘本目录    🔊 念给我听    📊  │ top bar (72px, z-index:20)
├─────────────────────────────────────┤
│                                     │
│          SVG scene (flex:1)         │ ← fills remaining space
│       (xMidYMid meet, natural       │
│        aspect ratio centered)       │
│                                     │
├─────────────────────────────────────┤
│       .text (flex-shrink:0)         │ ← grows with content
├─────────────────────────────────────┤
│         ● ● ● dots (48px)           │ bottom nav
└─────────────────────────────────────┘
│  ← nav-btn              nav-btn →  │ (absolute, centered vertically)
```

Key CSS rules:
```css
.page {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  padding: 72px 0 48px;
  opacity: 0; pointer-events: none;
  transition: opacity 0.6s ease;
}
.page.is-active { opacity: 1; pointer-events: auto; }

.scene {
  flex: 1; min-height: 0;
  position: relative; width: 100%;
  overflow: hidden;
}
.scene svg { width: 100%; height: 100%; }

.text {
  flex-shrink: 0;
  padding: 12px 24px 8px;
  text-align: center; max-width: 100%;
}

/* End-card pages (no .scene) */
.page:not(:has(.scene)) {
  justify-content: center;
  align-items: center;
  padding: 72px 24px 48px;
}
.end-card {
  background: white; padding: 32px; border-radius: 24px;
  max-width: 480px; width: 100%;
  box-shadow: 0 8px 0 rgba(0,0,0,0.06), 0 24px 48px -16px rgba(0,0,0,0.2);
  text-align: center;
}
```

---

## 8. Navigation & UX behavior (required in every storybook)

### 8a. Keyboard navigation
```js
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  goTo(current - 1);
  if (e.key === 'ArrowRight') goTo(current + 1);
});
```

### 8b. Swipe (touch)
```js
let _tx = 0;
document.addEventListener('touchstart', e => { _tx = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - _tx;
  if (Math.abs(dx) > 50) dx < 0 ? goTo(current + 1) : goTo(current - 1);
});
```

### 8c. Stop audio on page change
```js
function goTo(idx) {
  if (idx < 0 || idx >= total) return;
  speechSynthesis.cancel();          // ← required
  pages.forEach((p, i) => p.classList.toggle('is-active', i === idx));
  dots.querySelectorAll('span').forEach((s, i) => s.classList.toggle('is-active', i === idx));
  current = idx;
  document.getElementById('prev').disabled = idx === 0;
  document.getElementById('next').disabled = idx === total - 1;
  if (window.FO) FO.logProgress(BOOK_ID, idx, BOOK_TOTAL);
}
```

### 8d. Read-aloud button
```js
document.getElementById('readBtn').addEventListener('click', () => {
  const text = pages[current].dataset.text;
  if (!text || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN'; u.rate = 0.85; u.pitch = 1.1;
  speechSynthesis.speak(u);
});
```

---

## 9. Interactive elements

Every page should have **at least one interactive SVG element** (a character or object).

### Registration
```js
makeInteractive(document.getElementById('pN-name'), 'do-bounce', '话语文字 🐣');
```

### Available animation classes
| Class | Effect |
|---|---|
| `do-bounce` | Bounces up and back (positive reaction) |
| `do-shake` | Rotates back and forth (refusal/fear) |
| `do-wobble` | Squish-stretch (elastic/playful) |

### Speech bubble positioning
Bubbles are placed near the character's actual on-screen position — not at a fixed corner. They must stay inside the `.scene` bounds and multiple bubbles should remain visible without covering each other:

```js
function getInteractionLayer(el) {
  if (!el) return null;
  if (el._interactionLayer) return el._interactionLayer;
  const isSvgGroup = el.namespaceURI === 'http://www.w3.org/2000/svg' && el.tagName.toLowerCase() === 'g';
  if (!isSvgGroup || !el.hasAttribute('transform')) {
    el._interactionLayer = el;
    return el;
  }
  const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  layer.setAttribute('data-interaction-layer', '');
  if (el.classList.contains('float')) {
    el.classList.remove('float');
    layer.classList.add('float');
    layer.style.animationDelay = el.style.animationDelay || '';
    el.style.animationDelay = '';
  }
  while (el.firstChild) layer.appendChild(el.firstChild);
  el.appendChild(layer);
  el._interactionLayer = layer;
  return layer;
}

function placeSpeechBubble(scene, el, msg) {
  const er = el.getBoundingClientRect();
  const sr = scene.getBoundingClientRect();
  const b = document.createElement('div');
  b.className = 'speech-bubble';
  b.textContent = msg;
  b.style.maxWidth = Math.max(120, sr.width - 24) + 'px';
  scene.appendChild(b);

  const br = b.getBoundingClientRect();
  let left = er.left + er.width / 2 - sr.left;
  let top = er.top - sr.top - br.height - 10;
  if (top < 8) top = Math.min(sr.height - br.height - 8, er.bottom - sr.top + 10);

  left = Math.max(12 + br.width / 2, Math.min(sr.width - 12 - br.width / 2, left));
  const bubbles = Array.from(scene.querySelectorAll('.speech-bubble')).filter(x => x !== b);
  for (const other of bubbles) {
    const or = other.getBoundingClientRect();
    const overlaps = !(left + br.width / 2 < or.left - sr.left || left - br.width / 2 > or.right - sr.left || top + br.height < or.top - sr.top || top > or.bottom - sr.top);
    if (overlaps) top = Math.min(sr.height - br.height - 8, or.bottom - sr.top + 8);
  }

  b.style.left = left + 'px';
  b.style.top = Math.max(8, top) + 'px';
  b.style.transform = 'translateX(-50%)';
  setTimeout(() => b.remove(), 1500);
}

function makeInteractive(el, animClass, msg) {
  if (!el) return;
  const target = getInteractionLayer(el);
  el.classList.add('interactive');
  el.addEventListener('click', function () {
    if (el._busy) return;
    el._busy = true;
    target.classList.remove(animClass);
    void target.getBoundingClientRect();
    target.classList.add(animClass);
    if (msg) {
      const scene = el.closest('.scene');
      if (scene) placeSpeechBubble(scene, el, msg);
    }
    setTimeout(() => { target.classList.remove(animClass); el._busy = false; }, 750);
  });
}
```

Speech bubble CSS — no hardcoded position (set by JS above):
```css
.speech-bubble {
  position: absolute;
  background: white; border-radius: 999px;
  padding: 6px 16px; font-size: 20px;
  font-family: "LXGW WenKai TC", serif;
  box-shadow: 0 3px 0 rgba(0,0,0,0.12);
  pointer-events: none; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
  z-index: 50;
  animation: bPop 0.3s ease forwards;
}
@keyframes bPop { from { opacity:0; } to { opacity:1; } }
```

---

## 10. Complete HTML template

Replace `{{...}}` placeholders when generating a new book.

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{BOOK_TITLE_ZH}}</title>
<meta name="description" content="{{DESCRIPTION}}">
<meta property="og:title" content="{{BOOK_TITLE_ZH}}">
<meta property="og:description" content="{{DESCRIPTION}}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://family.carlxu.cn/storybooks/{{SLUG}}">
<meta property="og:image" content="https://family.carlxu.cn/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{BOOK_TITLE_ZH}}">
<meta name="twitter:description" content="{{DESCRIPTION}}">
<meta name="twitter:image" content="https://family.carlxu.cn/og.png">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "LXGW WenKai TC","LXGW WenKai",serif; background:#F8F2E2; min-height:100vh; overflow:hidden; }
  .book { width:100vw; height:100vh; position:relative; overflow:hidden; }

  /* — top bar — */
  .top { position:absolute; top:0; left:0; right:0; display:flex; justify-content:space-between; align-items:center; padding:20px 32px; z-index:20; }
  .back { text-decoration:none; color:#5C4F3D; font-size:16px; background:rgba(255,255,255,0.7); padding:8px 16px; border-radius:999px; backdrop-filter:blur(8px); }
  .read-aloud { background:{{ACCENT_COLOR}}; color:white; border:0; padding:10px 18px; border-radius:999px; font-family:inherit; font-size:16px; cursor:pointer; box-shadow:0 3px 0 rgba(0,0,0,0.1); }
  .read-aloud:active { transform:translateY(1px); box-shadow:0 2px 0 rgba(0,0,0,0.1); }

  /* — pages — */
  .page { position:absolute; inset:0; display:flex; flex-direction:column; padding:72px 0 48px; opacity:0; pointer-events:none; transition:opacity 0.6s ease; }
  .page.is-active { opacity:1; pointer-events:auto; }
  .page[data-bg="cream"]  { background:#F8F2E2; }
  .page[data-bg="peach"]  { background:#FBE3D5; }
  .page[data-bg="mint"]   { background:#D7EBC9; }
  .page[data-bg="sky"]    { background:#D7E7F4; }
  .page[data-bg="yellow"] { background:#FBE39A; }
  .page[data-bg="coral"]  { background:#F4A799; }
  .page[data-bg="blue"]   { background:#A8C2DE; }

  /* — scene (full remaining height) — */
  .scene { flex:1; min-height:0; position:relative; width:100%; overflow:hidden; }
  .scene svg { width:100%; height:100%; }

  /* — text panel — */
  .text { flex-shrink:0; padding:12px 24px 8px; text-align:center; }
  .text h2 { font-size:clamp(22px,4.5vw,34px); line-height:1.4; color:#2B2419; font-weight:500; text-wrap:balance; }
  .text .big { font-size:clamp(28px,5.5vw,44px); line-height:1.3; color:{{ACCENT_COLOR}}; font-weight:700; margin-top:8px; }
  .text .small { font-size:clamp(14px,2.8vw,16px); color:#5C4F3D; margin-top:8px; }

  /* — end card (pages without .scene) — */
  .end-card { margin:auto; background:white; padding:32px; border-radius:24px; max-width:480px; width:calc(100% - 48px); box-shadow:0 8px 0 rgba(0,0,0,0.06),0 24px 48px -16px rgba(0,0,0,0.2); text-align:center; }
  .end-card h2 { font-size:28px; color:{{ACCENT_COLOR}}; margin-bottom:16px; }
  .end-card p { font-size:19px; color:#2B2419; line-height:1.7; margin-bottom:12px; }

  /* — nav buttons — */
  .nav-btn { position:absolute; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.88); border:0; width:56px; height:56px; border-radius:50%; font-size:24px; cursor:pointer; box-shadow:0 3px 0 rgba(0,0,0,0.1); font-family:inherit; color:#2B2419; z-index:20; backdrop-filter:blur(4px); }
  .nav-btn:disabled { opacity:0.3; pointer-events:none; }
  .nav-btn:active { transform:translateY(calc(-50% + 1px)); box-shadow:0 2px 0 rgba(0,0,0,0.1); }
  #prev { left:12px; } #next { right:12px; }

  /* — progress dots — */
  .dots-wrap { position:absolute; bottom:16px; left:0; right:0; display:flex; justify-content:center; z-index:20; }
  .dots { display:flex; gap:6px; }
  .dots span { width:8px; height:8px; border-radius:50%; background:rgba(43,36,25,0.2); transition:background 0.3s,transform 0.3s; }
  .dots span.is-active { background:{{ACCENT_COLOR}}; transform:scale(1.4); }

  /* — animations — */
  .float { animation:float 3s ease-in-out infinite; }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  .pop { animation:pop 0.6s ease; }
  @keyframes pop { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  .interactive { cursor:pointer; transform-box:fill-box; transform-origin:center center; }
  .interactive:hover { opacity:0.9; }
  .do-bounce { animation:iBounce 0.6s cubic-bezier(0.36,0.07,0.19,0.97) both !important; }
  @keyframes iBounce { 0%{transform:translateY(0) scale(1)} 25%{transform:translateY(-18px) scale(1.15)} 55%{transform:translateY(-4px) scale(0.96)} 75%{transform:translateY(-8px) scale(1.05)} 100%{transform:translateY(0) scale(1)} }
  .do-shake { animation:iShake 0.55s ease both !important; }
  @keyframes iShake { 0%,100%{transform:rotate(0deg)} 18%{transform:rotate(-22deg)} 38%{transform:rotate(18deg)} 58%{transform:rotate(-14deg)} 78%{transform:rotate(9deg)} }
  .do-wobble { animation:iWobble 0.7s ease both !important; }
  @keyframes iWobble { 0%,100%{transform:scaleX(1) scaleY(1)} 20%{transform:scaleX(1.25) scaleY(0.75)} 45%{transform:scaleX(0.85) scaleY(1.2)} 65%{transform:scaleX(1.1) scaleY(0.9)} 80%{transform:scaleX(0.96) scaleY(1.04)} }

  /* — speech bubble (positioned by JS) — */
  .speech-bubble { position:absolute; background:white; border-radius:999px; padding:6px 16px; font-size:20px; font-family:"LXGW WenKai TC",serif; box-shadow:0 3px 0 rgba(0,0,0,0.12); pointer-events:none; white-space:nowrap; z-index:50; animation:bPop 0.3s ease forwards; }
  @keyframes bPop { from{opacity:0} to{opacity:1} }
</style>
</head>
<body>
<div class="book">

  <div class="top">
    <a class="back" href="../for-youngest.html">← 回绘本目录</a>
    <button class="read-aloud" id="readBtn">🔊 念给我听</button>
    <a href="../dashboard.html" class="dash-link" style="background:rgba(255,255,255,0.7);padding:8px 14px;border-radius:999px;text-decoration:none;font-size:16px;backdrop-filter:blur(8px);" title="仪表盘">📊</a>
  </div>

  <!-- PAGE 1 -->
  <div class="page is-active" data-bg="cream" data-text="{{PAGE_1_TTS_TEXT}}">
    <div class="scene">
      <svg viewBox="0 0 400 320">
        <!-- SVG content here; characters in <g id="p1-name" transform="translate(cx,cy)"> -->
      </svg>
    </div>
    <div class="text">
      <h2>{{heading}}</h2>
      <p class="small">{{body text}}</p>
    </div>
  </div>

  <!-- PAGE 2 … N-1  (same structure) -->

  <!-- LAST PAGE — end-card, no .scene -->
  <div class="page" data-bg="cream" data-text="{{END_PAGE_TTS}}">
    <div class="end-card">
      <h2>给小弟弟 ❤️</h2>
      <p>{{takeaway line}}</p>
      <p style="font-size:32px;color:{{ACCENT_COLOR}};font-weight:700;margin:16px 0;">"{{memorable phrase}}"</p>
      <p style="font-size:16px;color:#5C4F3D;">{{supporting text}}</p>
      <button class="read-aloud" style="margin-top:24px;" onclick="goTo(0)">🔄 再讲一遍</button>
    </div>
  </div>

  <button class="nav-btn" id="prev" aria-label="上一页">←</button>
  <div class="dots-wrap"><div class="dots" id="dots"></div></div>
  <button class="nav-btn" id="next" aria-label="下一页">→</button>

</div>
<script src="../fo-utils.js"></script>
<script>
  const BOOK_ID = '{{SLUG}}'; const BOOK_TITLE = '{{BOOK_TITLE_ZH}}'; const BOOK_TOTAL = {{PAGE_COUNT}};

  function getInteractionLayer(el) {
    if (!el) return null;
    if (el._interactionLayer) return el._interactionLayer;
    const isSvgGroup = el.namespaceURI === 'http://www.w3.org/2000/svg' && el.tagName.toLowerCase() === 'g';
    if (!isSvgGroup || !el.hasAttribute('transform')) {
      el._interactionLayer = el;
      return el;
    }
    const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    layer.setAttribute('data-interaction-layer', '');
    if (el.classList.contains('float')) {
      el.classList.remove('float');
      layer.classList.add('float');
      layer.style.animationDelay = el.style.animationDelay || '';
      el.style.animationDelay = '';
    }
    while (el.firstChild) layer.appendChild(el.firstChild);
    el.appendChild(layer);
    el._interactionLayer = layer;
    return layer;
  }

  function placeSpeechBubble(scene, el, msg) {
    const er = el.getBoundingClientRect();
    const sr = scene.getBoundingClientRect();
    const b = document.createElement('div');
    b.className = 'speech-bubble';
    b.textContent = msg;
    b.style.maxWidth = Math.max(120, sr.width - 24) + 'px';
    b.style.overflow = 'hidden';
    b.style.textOverflow = 'ellipsis';
    b.style.whiteSpace = 'nowrap';
    scene.appendChild(b);

    const br = b.getBoundingClientRect();
    let left = er.left + er.width / 2 - sr.left;
    let top = er.top - sr.top - br.height - 10;
    if (top < 8) top = Math.min(sr.height - br.height - 8, er.bottom - sr.top + 10);
    left = Math.max(12 + br.width / 2, Math.min(sr.width - 12 - br.width / 2, left));

    const bubbles = Array.from(scene.querySelectorAll('.speech-bubble')).filter(x => x !== b);
    for (const other of bubbles) {
      const or = other.getBoundingClientRect();
      const overlaps = !(left + br.width / 2 < or.left - sr.left || left - br.width / 2 > or.right - sr.left || top + br.height < or.top - sr.top || top > or.bottom - sr.top);
      if (overlaps) top = Math.min(sr.height - br.height - 8, or.bottom - sr.top + 8);
    }

    b.style.left = left + 'px';
    b.style.top = Math.max(8, top) + 'px';
    b.style.transform = 'translateX(-50%)';
    setTimeout(() => b.remove(), 1500);
  }

  function makeInteractive(el, animClass, msg) {
    if (!el) return;
    const target = getInteractionLayer(el);
    el.classList.add('interactive');
    el.addEventListener('click', function () {
      if (el._busy) return;
      el._busy = true;
      target.classList.remove(animClass);
      void target.getBoundingClientRect();
      target.classList.add(animClass);
      if (msg) {
        const scene = el.closest('.scene');
        if (scene) placeSpeechBubble(scene, el, msg);
      }
      setTimeout(() => { target.classList.remove(animClass); el._busy = false; }, 750);
    });
  }

  const pages = document.querySelectorAll('.page');
  const total  = pages.length;
  const dots   = document.getElementById('dots');
  let current  = 0;

  for (let i = 0; i < total; i++) {
    const d = document.createElement('span');
    if (i === 0) d.classList.add('is-active');
    dots.appendChild(d);
  }

  function goTo(idx) {
    if (idx < 0 || idx >= total) return;
    speechSynthesis.cancel();
    pages.forEach((p, i) => p.classList.toggle('is-active', i === idx));
    dots.querySelectorAll('span').forEach((s, i) => s.classList.toggle('is-active', i === idx));
    current = idx;
    document.getElementById('prev').disabled = idx === 0;
    document.getElementById('next').disabled = idx === total - 1;
    if (window.FO) FO.logProgress(BOOK_ID, idx, BOOK_TOTAL);
  }

  document.getElementById('prev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('next').addEventListener('click', () => goTo(current + 1));

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  let _tx = 0;
  document.addEventListener('touchstart', e => { _tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - _tx;
    if (Math.abs(dx) > 50) dx < 0 ? goTo(current + 1) : goTo(current - 1);
  });

  document.getElementById('readBtn').addEventListener('click', () => {
    const text = pages[current].dataset.text;
    if (!text || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; u.rate = 0.85; u.pitch = 1.1;
    speechSynthesis.speak(u);
  });

  goTo(0);

  // Wire up interactions — one per page, more if needed
  makeInteractive(document.getElementById('p1-{{name}}'), 'do-bounce', '{{reaction text 🐣}}');
  // makeInteractive(document.getElementById('p2-...'), 'do-shake', '...');

  document.addEventListener('DOMContentLoaded', () => {
    if (window.FO) FO.logHistory(BOOK_ID, BOOK_TITLE);
  });
</script>
</body>
</html>
```

---

## 11. Checklist for each new storybook

- [ ] Follows the file naming convention (`NN-slug.html`)
- [ ] All SVG characters use the standard body/head/eye/beak structure
- [ ] Characters positioned at `transform="translate(cx,cy)"` so center is (0,0)
- [ ] Character positioning and animation are separated: the positioned outer `<g>` is not directly animated; `makeInteractive()` animates an inner layer
- [ ] Pages with two or more speaking characters keep all speakers visible in the same viewport with enough separation for bubbles
- [ ] Interactive elements have unique `id="pN-name"` matching `makeInteractive` calls
- [ ] Every page has `data-text` attribute with the TTS narration text
- [ ] Last page is `end-card` (no `.scene`) with a memorable phrase
- [ ] Accent color (`{{ACCENT_COLOR}}`) is consistent throughout
- [ ] `BOOK_ID`, `BOOK_TITLE`, `BOOK_TOTAL` are correct
- [ ] `fo-utils.js` is loaded
- [ ] No hardcoded colors outside the palette

---

## 12. Common issues — do NOT repeat

| Issue | Fix applied in template |
|---|---|
| No swipe support | `touchstart`/`touchend` handlers in JS |
| Scene too small, not filling screen | `.scene { flex:1 }` + SVG `width/height: 100%` |
| Speech bubble stuck at top-left | Bubble position computed from `getBoundingClientRect()` |
| Clicked character jumps to top-left | Runtime animates an inner layer, not the outer `transform="translate(...)"` group |
| Two speakers overlap or cover each other | Keep speakers in the same viewBox with clear spacing; bubble placement clamps to the scene and offsets from existing bubbles |
| Audio keeps playing after page turn | `speechSynthesis.cancel()` at top of `goTo()` |
