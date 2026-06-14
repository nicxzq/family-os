# 成长读本设计规格 · Reader Design Spec（哥哥轨道 · 12 岁）

> 配套：`storybooks/CONTENT_MAP.md`（讲"做什么"）、`storybooks/STORYBOOK_DESIGN.md`（弟弟 6 岁轨道）。
> 本文件定义**哥哥轨道**——给 12 岁、自己读的人。**不是**毛毛小鸡绘本的放大版。

---

## 1. 核心原则：把读者当成有判断力的人

| 弟弟轨道（不要照搬） | 哥哥轨道（本规格） |
|---|---|
| 童话角色毛毛小鸡 | 无吉祥物；真实场景、数据、具体人物 |
| 1–3 短句/页 | 1 段叙事 + 概念图 + 金句 |
| 🔊 念给我听（TTS） | 取消朗读；改"💬 想一想"互动 |
| "给小弟弟 ❤️"尾页 | "🎯 行动卡"：本周一个可做的小实验 |
| 命令式（"你要…"） | 邀请式（"你可能会发现…"），给数据不下命令 |

**语气清单**：承认复杂、不打包票；用真实数据和例子；用"你或许注意到"而非"你必须"；不卖惨、不恐吓、不说教。

---

## 2. 文件命名 & 路由

- 文件：`readers/NN-slug.html`（如 `01-attention-scarce.html`）
- 路由：`/readers/NN-slug`（Vercel cleanUrls）
- `NN` 顺序递增；内部对应 `CONTENT_MAP` 的篇号（如 F04）写在文件头注释里
- 目录入口：`for-eldest.html` 顶栏加 `📖 读本` pill；满 3 篇后再建 `readers/index.html` 列表页

---

## 3. 一篇的结构（固定五段）

每篇 = 一个概念。纵向滚动，分段卡片，顶部有阅读进度条。

1. **钩子 Hook** — 一个真实场景 / 反常识问题 / 一个数据。让读者"这说的就是我"。
2. **拆解 Breakdown** — 2–4 个小节，每节一个机制点，配 1 张概念图（SVG）。这是主体。
3. **金句 Quote** — 源书原话或浓缩一句，独立大字卡片。
4. **想一想 Reflect** — 1–2 个开放问题，点击展开"没有标准答案"的提示。替代弟弟版朗读。
5. **行动卡 Action** — 本周一个可执行的小实验（具体、可量化、低门槛）。

> 末尾**不要**写"给小弟弟/给哥哥 ❤️"。结尾就是行动卡 + "← 返回 / 下一篇 →"。

---

## 4. 视觉规格

- **复用站点 token**（`styles.css` 的 `--ink/--coral/--blue/--green/--cream/--paper` 等），不要硬编码颜色。
- 字体：`"LXGW WenKai TC"`（同站点）。
- **概念图用 SVG**：信息图、对比条、时间线、曲线、单格漫画。**禁止**毛毛小鸡等童话角色。
- 每篇选一个**主强调色**（coral / blue / green 之一），贯穿进度条、金句、行动卡。
- 卡片：`background:var(--paper)`，`border-radius:var(--radius-lg)`，`box-shadow:var(--shadow-card)`。
- 排版宽度上限 `680px`，居中；行高 1.8；正文 `var(--font-size-body-lg)`。

---

## 5. 交互（必备）

```js
// 阅读进度（按滚动）
// 想一想：点击展开提示
// 行动卡：可选"我要试试"按钮 → FO.logProgress(READER_ID, 1, 1)
```

- 顶部进度条随滚动百分比变化。
- `想一想` 用 `<details>` 或点击切换，展开一句"没有标准答案，写在你自己的本子上"。
- 引入 `../fo-utils.js`；`DOMContentLoaded` 时 `FO.logHistory(READER_ID, READER_TITLE)`；滚到行动卡时 `FO.logProgress(READER_ID, 1, 1)` 记为读完。
- 顶栏成员按钮逻辑同 `games/index.html`（`FO.getMember()` → 头像/登录）。
- **无 `speechSynthesis`、无 TTS 按钮。**

---

## 6. 隐私

- 与 `for-eldest.html` 一致，`<head>` 加 `<meta name="robots" content="noindex,noai,noimageai">`。
- `robots.txt` 已 Disallow `/storybooks`；上线 `readers/` 后同步加 `Disallow: /readers`。

---

## 7. HTML 模板骨架

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,noai,noimageai">
<title>{{TITLE}} · 成长读本</title>
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../styles.css">
<style>
  /* reader-local layout; colors via tokens only */
  :root { --accent: var(--coral); }            /* pick coral/blue/green per piece */
  body { background:var(--cream); color:var(--ink); font-family:"LXGW WenKai TC",serif; margin:0; }
  .progress-bar { position:fixed; top:0; left:0; height:4px; width:0; background:var(--accent); z-index:50; transition:width .1s; }
  .topbar { position:sticky; top:0; z-index:20; display:flex; justify-content:space-between; align-items:center; padding:14px 20px; background:var(--cream); }
  .wrap { max-width:680px; margin:0 auto; padding:8px 20px 80px; }
  .hook { font-size:var(--font-size-title); line-height:1.7; }
  .card { background:var(--paper); border-radius:var(--radius-lg); box-shadow:var(--shadow-card); padding:24px; margin:20px 0; }
  .quote { font-size:26px; font-weight:700; color:var(--accent); line-height:1.5; text-align:center; }
  .action { border:2px solid var(--accent); }
  figure svg { width:100%; height:auto; display:block; }
  figcaption { font-size:var(--font-size-note); color:var(--ink-mute); text-align:center; margin-top:8px; }
</style>
</head>
<body>
  <div class="progress-bar" id="bar"></div>
  <nav class="topbar">
    <a class="back" href="../for-eldest.html" style="text-decoration:none;color:var(--ink-soft);">← 读本</a>
    <button id="nav-member-btn" class="nav-member-btn"></button>
  </nav>
  <main class="wrap">
    <h1>{{TITLE}}</h1>
    <p class="hook">{{HOOK}}</p>
    <!-- 拆解小节 ×N：每节 <section class="card"> 文字 + <figure>SVG</figure> -->
    <div class="card quote">"{{金句}}"</div>
    <section class="card"><h3>💬 想一想</h3><!-- 1–2 题 + 展开提示 --></section>
    <section class="card action"><h3>🎯 行动卡 · 本周</h3><!-- 具体实验 --></section>
    <nav style="display:flex;justify-content:space-between;margin-top:24px;">
      <a href="../for-eldest.html">← 返回</a>
      <a href="#" id="next-piece">下一篇 →</a>
    </nav>
  </main>
  <script src="../fo-utils.js"></script>
  <script>
    const READER_ID='{{SLUG}}', READER_TITLE='{{TITLE}}';
    const bar=document.getElementById('bar');
    addEventListener('scroll',()=>{const h=document.documentElement;const p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);bar.style.width=(p*100)+'%';});
    // member button
    const m=window.FO?FO.getMember():null, el=document.getElementById('nav-member-btn');
    if(m){el.innerHTML=FO.avatarSVG(m.avatar,m.color,32)+'<span>'+m.name+'</span>';el.onclick=()=>location.href='../dashboard.html';}
    else{el.innerHTML='<span>登录</span>';el.onclick=()=>location.href='../login.html';}
    // log
    addEventListener('DOMContentLoaded',()=>{if(window.FO)FO.logHistory(READER_ID,READER_TITLE);});
    const act=document.querySelector('.action');
    if(act){new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting&&window.FO){FO.logProgress(READER_ID,1,1);}});}).observe(act);}
  </script>
</body>
</html>
```

---

## 8. 每篇检查清单

- [ ] `readers/NN-slug.html`，头注释写明对应 `CONTENT_MAP` 篇号
- [ ] 五段齐全：钩子 / 拆解 / 金句 / 想一想 / 行动卡
- [ ] 无吉祥物、无 TTS、无"给…❤️"尾页
- [ ] 颜色全部走 token；选定一个主强调色并贯穿
- [ ] 概念图是 SVG，信息准确（数据来自源书）
- [ ] 引入 `styles.css` 与 `fo-utils.js`；`logHistory` + 行动卡 `logProgress`
- [ ] `<meta robots noindex>` 已加
- [ ] 出完更新 `CONTENT_MAP` 对应行 status，并在 `for-eldest.html` 目录登记
