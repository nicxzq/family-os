# family-os 微信小程序

网站主要内容的微信小程序版（类目：工具 / 教育服务）。原生小程序，零依赖、零构建。

## 打开方式

微信开发者工具 → 导入项目 → 选择本目录（`miniprogram/`）。

## 页面结构（四 tab 架构，设计见仓库根 `DESIGN.md`）

| 页面 | 对应网站页 | 说明 |
|---|---|---|
| `pages/home/home` | `index.html` | **tab 首页**：大橙小原 logo、六句话 swiper、角色入口、工具箱横幅、家庭墙（一键"存成 A4 家庭墙图片"——离屏 poster canvas 把六条+插画+logo 画成 1080×1527）、共读清单（书架样式，点书看理由） |
| `pages/role/role` | — | **tab 角色**：按 `fo_role` 分块渲染四个角色内容，首次进入弹角色选择 |
| `pages/toolbox/toolbox` | — | **tab 工具箱**：6 个工具入口网格 |
| `pages/mine/mine` | — | **tab 我的**：头像（`wx.cropImage` 1:1 裁剪 + 圆形展示）昵称（本地）、角色设置、阅读记录、数据导入导出（`fo_*` 打包 JSON，`shareFileMessage` 导出 / `chooseMessageFile` 导入合并）、帮助、关于 |
| `pages/idea/idea` | `index.html` | 六句话详情页（`?no=1..6`，`data/ideas.js` + `data/idea-art.js` 插画）；页内"存成图片"生成单条原则分享卡（750×1200，含插画+logo，离屏 canvas） |
| `pages/story/story` | `storybooks/*` | 绘本阅读器：swiper 翻页，每页原版 SVG 插图 + 正文；点插图播放动画 + 弹语音气泡（迁移网页 `makeInteractive`） |
| `pages/reader/reader` | `readers/NN-*.html` | 读本正文：拆解卡片 + 概念图 + 金句 + 想一想 + 行动卡 |
| `pages/topics/topics` | `dinner-questions.html` | 饭桌问题集，50 个话题，按周定位 |
| `pages/quiz/quiz` | `for-eldest.html` | 5 题互动测试（原 `pages/eldest` 迁移） |
| `pages/summer/summer` | `summer2026.html` | 暑期打卡：进入先看日历（每天一格，颜色=当天必做完成度），点某天进当天清单；任务规则移植（默认量），本地勾选，无云同步/AI |
| `pages/review/review` | `weekly-review.html` | 家庭周会复盘：五板块表单，按 ISO 周存本地，可回看 |
| `pages/piggy/piggy` | `piggy-bank.html` | 零花钱实验室：记账 + 储蓄目标（单账本，无成员体系） |
| `pages/attention/attention` | `attention-budget.html` | 注意力账本：按天记录，堆叠条分布图（免 canvas） |
| `pages/games/games` | `games/index.html` | 游戏目录：分类 tab + 卡片流，5 个已上线其余预告（目录数据 `data/games.js` 手工对齐网站） |
| `pages/games/{qa,multi,chem,physics,code}` | `games/g01·g44·g21·g22·g41` | 5 类首个游戏的简化原生移植；星级存 `fo_game_stars`（键名与网站一致） |
| `pages/policy/policy` | — | 隐私政策 / 免责说明（`?type=privacy\|disclaimer` 一页两用） |

角色页四块内容：爸爸妈妈（`for-wife.html` 文案改写为父母共读视角，写在 role.wxml）、
老大（读本目录 + 暑期入口）、老二（绘本目录）、爷爷奶奶和朋友（三个故事）。

本地 storage 键：`fo_role`（角色）、`fo_profile`（头像昵称）、`fo_read_readers` / `fo_read_stories`
（阅读记录 `{id:{t,ts}}`）、`fo_review_<YYYY-Wnn>`（周回顾）、`fo_piggy`（存钱罐）、
`fo_attention_<YYYY-MM-DD>`（注意力）、`fo_summer_done`（暑期打卡）、`fo_game_stars`（游戏星级）。
全部只存本机，无登录无后端。

## 内容同步（重要）

**网站 HTML 是唯一内容源。** `miniprogram/data/` 下三个文件是生成物，不要手改：

- `data/stories.js` ← `for-youngest.html` + `storybooks/NN-*.html`（含每页互动效果 `fx`：从 `makeInteractive(...)` 调用抽 `do-bounce/shake/wobble` 动画 + 气泡文案）
- `data/readers.js` ← `readers/index.html`（READERS 表）+ `readers/NN-*.html`
- `data/topics.js` ← `dinner-questions.html`（TOPICS 数组）
- `data/palette.js` ← `styles.css` 设计 token 色值（canvas 绘制读不到 CSS 变量，分享卡/海报用它）

另有两个独立生成物（不在 sync-miniprogram.js 里，各自的脚本生成）：

- `data/idea-art.js` + `assets/idea-art/*.png` ← `scripts/gen-idea-art.js`：六条原则的同风格扁平插画。脚本内写 SVG（色值取自 styles.css），用 macOS `qlmanage` 光栅化 + `sips` 裁成 720×480 PNG。换非 macOS 平台需替换光栅化步骤。
- `assets/logo.gif`（动图，首页 hero 用）← 源图 `uploads/logo-source.gif`（1080×1080/2MB），ffmpeg 压到 320×320/12fps/约 260KB 以守住主包体积。`assets/logo-mark.png`（方形徽章，所有 canvas 导出图页脚都带它）← 动图完整帧（第 86 帧 coalesce）裁掉底部文字后的圆形徽章。换 logo 时重做这两步即可（旧的 `scripts/gen-logo.py` 产物已废弃）。

改了以上网站源文件后，在仓库根目录跑：

```bash
node scripts/sync-miniprogram.js
```

`scripts/sync-gate.js` 末尾会自动链式调用本脚本，因此每日 storybook 定时任务（最后一步跑 sync-gate）会顺带完成小程序数据同步——正常情况下不需要手动跑。

幂等；脚本会校验目录条目指向的文件是否存在（防 slug 漂移），并把 SVG 里的 `var(--x)`
按 `styles.css`（和页面局部定义）解析成实际值后内联为 base64 data-URI
（小程序 image 组件不能直接引用本地 .svg 文件）。有警告要人工看。

**手工维护**（内容是"信"，极少变）：`data/ideas.js`（六个想法/六条/书单 ← index.html）、
`data/quiz.js`（测试题 ← for-eldest.html）、`data/roles.js`（四个角色定义）、
父母/长辈两块正文写在 `pages/role/role.wxml`（父母块是 for-wife.html 的"父母共读视角"改写，非逐字同步）。
暑期任务规则手工移植在 `pages/summer/summer.js`（← summer2026.html 的 genTasks）。
改这些网站页面时，记得手动同步对应文件。

## 设计约定

- 设计 token 全部在 `app.wxss` 的 `page {}` 里（与网站 `styles.css` 调色板一致，rpx 化）；页面 wxss 只引用 `var(--*)`，不硬编码颜色。
- 字体用系统字体（加载 LXGW WenKai 需 `wx.loadFontFace` + 域名白名单，暂不做）。
- tabBar 图标在 `assets/tab/*.png`（81×81，普通态 ink-mute、选中态 coral），由 `scripts/gen-tab-icons.py`（Pillow 纯绘制，需 arm64 Python 环境）生成，改色/改形需重跑该脚本。
- `navigateTo` 的详情页没有原生 tabBar：统一在 wxml 末尾挂 `<fo-tabbar active="…" />`（`components/fo-tabbar`），底部常驻四 tab 且不遮挡正文（组件自带占位 `.spacer` + 安全区）。整屏页（如 story）用 `calc(100vh - var(--tabbar-h) - env(safe-area-inset-bottom))` 让出高度。

## 未收录（网站有、小程序暂无）

- 互动游戏已收录 5 个简化原生版（问答/化学/物理/编程/多学科各首个，见 `pages/games/`），其余 47+ 个仍只在网站版（逐个移植需单独立项）
- Supabase 登录、日记、共读追踪、共创系统（需换微信登录体系 + 合规的后端域名）
- 幻灯片、墙报打印版（投屏/打印场景，不适合小程序）
- 网站上绘本 04+ 和全部读本有登录门禁；小程序内暂无登录，内容直接开放（家庭内部使用，接受）
