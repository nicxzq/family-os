# MEMORY — family-os
维护规则:学到就回写(不等提醒);凭据只记位置不记值;能从代码查到的别复制进来;以追加为主,旧条目保留并标日期。

## 架构决策
<!-- 格式:[日期] 决定了什么 — 为什么 / 否决了什么 -->
- [2026-06-22] 每日提交审查在隔离 worktree 中运行 — 避免自动修复污染主工作目录；仅对可证实问题修复、验证并创建 PR。
- [2026-06-23] 站点保持纯静态 HTML/CSS/JS,不引入构建步骤 — 线上直接由 Vercel 以 clean URLs 暴露页面;本地开发只需静态服务器
- [2026-06-23] 共享视觉 token 统一放在 `styles.css` — 页面可加局部样式,但不得在 HTML/JS 中硬编码 UI 数值
- [2026-06-23] 交互游戏默认遵守 `docs/GAME_UI_STANDARD.md` — 核心玩法与主控件需在首屏相邻,避免桌面端/移动端来回滚动
- [2026-07-18] 新增 `miniprogram/` 微信小程序（类目：工具/教育服务）——原生 WXML/WXSS/JS 零依赖；设计 token 集中在 `miniprogram/app.wxss`（与 styles.css 调色板一致，rpx 化）；游戏、Supabase 登录、幻灯片未移植（见 miniprogram/README.md）。
- [2026-07-18] 小程序内容同步走 `scripts/sync-miniprogram.js`：网站 HTML 是唯一内容源，脚本解析 for-youngest/storybooks、readers、dinner-questions 生成 `miniprogram/data/{stories,readers,topics}.js`（生成物勿手改）；SVG 插图把 var(--x) 按 styles.css+页面局部变量解析后内联 base64（小程序 image 不能引本地 .svg）。ideas/quiz/wife/family 四块是手工同步。改完网站内容必须重跑该脚本。[2026-07-18 补] `sync-gate.js` 末尾已链式调用 `sync-miniprogram.js`（子进程失败不影响门禁，只置非零退出码）——每日 storybook 任务跑 sync-gate 即自动同步小程序，无需改任务定义。
- [2026-07-18] 小程序改版为四 tab(首页/角色/工具箱/我的),spec 在根目录 `DESIGN.md`——角色只四个(爸妈合并为一,老二不进);v1 纯本地无微信登录(个人主体 + Supabase 域名无备案);工具箱本期移植每周回顾/存钱罐/注意力预算,52 游戏不进;"留档"=阅读记录(本地 storage)。`docs/miniapp/` 旧 Taro 方案(06-05)已废弃勿参照。[同日已实现] wife/eldest/family/youngest/readers 五页并入 role/quiz;新增 idea/summer/review/piggy/attention;storage 键清单见 miniprogram/README.md;父母文案是 for-wife 的"共读视角"改写(手工维护,非逐字同步);暑期任务规则手工移植自 summer2026.html 的 genTasks,网站改规则要同步 pages/summer/summer.js。
- [2026-07-19] 小程序改版一批（八项）：① 首页家庭墙每条原则可"存图"——离屏 `<canvas type="2d" id="share-canvas">` + `miniprogram/utils/share-card.js` 绘制 750×1000 卡 + `saveImageToPhotosAlbum`；canvas 读不到 CSS 变量，色值走新生成物 `data/palette.js`（sync-miniprogram.js 的 `syncPalette()` 从 styles.css 抽，勿手改）。② 共读清单改书架（`.shelf`/`.shelf-board`，每架 3 本，点书展开理由）。③ tabBar 四组图标 `miniprogram/assets/tab/*.png`，由 `scripts/gen-tab-icons.py`（Pillow，须 arm64 venv）生成。④ 详情页底部不遮挡：新增全局组件 `components/fo-tabbar`，所有 navigateTo 详情页 wxml 末尾挂 `<fo-tabbar active="…" />`（自带占位+安全区），story 整屏页高度改 `calc(100vh - var(--tabbar-h) - safe-area)`。⑤ 我的头像 `wx.cropImage` 1:1 裁剪+圆形展示。⑥ 数据导入导出：mine 页把所有 `fo_*` 键打包 JSON，`shareFileMessage` 导出（去掉本机头像路径）/`chooseMessageFile` 导入（对象型键做并集合并）。⑦ 绘本互动迁移：sync 脚本解析 storybooks 的 `makeInteractive(...)`（两种写法：`getElementById('pN-x')` 与直接 `'pN-x'`，及 forEach 批量）抽 `do-bounce/shake/wobble`+气泡文案存进 `data/stories.js` 每页 `fx`，story 页点插图播 wxss 动画+弹气泡。全 36 本已覆盖，anim 仅这三种。⑧ 暑期打卡进入先日历（每天格，绿=全勤/黄=部分/灰=未打卡），点某天进当天清单（summer.js 加 view 状态 cal/day + buildCal）。tabBar 图标改色须同步 gen-tab-icons.py。
- [2026-07-19 补] 存图分享改版 + 品牌化：① 六条原则每条加同风格扁平插画——`scripts/gen-idea-art.js`（脚本内写 SVG，色值取 styles.css，`qlmanage` 光栅 + `sips` 裁 720×480）生成 `assets/idea-art/*.png` + `data/idea-art.js`（id→路径）；idea 详情页 `<image>` 展示。② 存图从首页每条移到 idea 详情页内（单条分享卡 750×1200，含插画+logo）。③ 首页"存图"改为一键生成 A4 家庭墙海报（1080×1527，六条+插画+logo 合一，`saveWallPoster`）。④ 新增品牌"大橙小原"logo（`scripts/gen-logo.py` Pillow 出 `assets/logo.png`/`logo-mark.png`），所有导出页脚带 logo mark + "大橙小原 · 好的家庭教育"，首页 hero 也放 logo。canvas 载图用 `canvas.createImage()`（避免 SVG，故插画用 PNG）；`share-card.js` 全异步 Promise 化。gen-idea-art.js 依赖 macOS qlmanage/sips，换平台要改。
- [2026-07-11] 暑期 AI 创造营作为家庭内部小项目接入根路由 `ai-camp.html`（线上 `/ai-camp`）：任务、想法、日志、版本和反馈只存浏览器 `localStorage` 键 `fo_ai_camp_2026`，不写入 Supabase；入口必须同时在首页工具箱、哥哥页和仪表盘可见。

## 踩坑 / Gotchas
- 本地访问通常需要带 `.html` 后缀,因为只有线上 Vercel 配了 `cleanUrls: true`
- 修改 UI 后必须跑 `ui-tokenize` 检查,changed files 里不能留下硬编码视觉值
- `storybooks/` 下的文件改动前要先读 `storybooks/STORYBOOK_DESIGN.md`,并保持 `#prev` 左 / `#next` 右与 `data-interaction-layer` 动画约束
- `readers/index.html` 和 `storybooks/CONTENT_MAP.md` 里的 slug 可能和真实文件漂移; 新增或补登记读本时要先用文件系统核对目标文件是否存在（2026-07-18 已修一处：F02 指向的 03-short-video.html 实为 03-variable-reward.html；sync-miniprogram.js 会自动校验并警告）
- 当前仓库没有可直接调用的 `ui-tokenize` 命令; 审查 UI 改动时至少要对 changed files 做 `hex`/`px` 残留检查,避免把硬编码视觉值带进主分支

## 我的纠正 / 偏好
- 先读仓库根目录 `AGENTS.md` 和 `MEMORY.md`,没有就先补齐,再做任何会改文件或外部状态的工作
- 结论先行,说明为什么以及对用户的影响,不要只讲实现
- 默认做最小且直接的修复,不顺手重构无关代码

## 外部资源位置
- 部署配置在 `vercel.json`
- 数据库 schema 在 `supabase/schema.sql`
- 游戏界面规范在 `docs/GAME_UI_STANDARD.md`
- Storybook 设计规范在 `storybooks/STORYBOOK_DESIGN.md`
- Codex 自动任务 `automation-3`（每日审查并修复最近提交）：每天 07:00（Asia/Hong_Kong）审查过去 24 小时提交。

## 凭据位置(只记位置,不记值)
- Supabase URL 与 anon key 由 `fo-supabase.js` 读取,具体值应查本地环境或部署配置

## 未决 / 待确认
- 当前自动化审查流程如何记录“已审过的提交范围”,需要在后续运行中沉淀到自动化 memory
