# spec.md · 2026-07-22 需求批次

> 执行者：codex。遵守仓库 CLAUDE.md / AGENTS.md 全部约定（tokens、字体、配色、Game UI Standard、commit 规范）。
> 完成每项后按 commit 规范独立提交。最后统一运行 `node scripts/sync-gate.js`（会链式跑 sync-miniprogram）。

## 1. logo.gif 降规格 + 上首页

现状：`miniprogram/assets/logo.gif` 320×320 / 36 帧 / ~12fps / 265KB。源文件 `uploads/logo-source.gif`（1080×1080 / 86 帧）。

- 从 `uploads/logo-source.gif` 重新生成：**280×280、10fps**，帧数按比例抽帧，尽量压缩体积（目标 ≤150KB）。可用 ffmpeg 或 PIL，生成命令写进 `scripts/`（复用或扩展 gen-logo.py 附近的做法均可）。
- 替换 `miniprogram/assets/logo.gif`（小程序 home 页 `hero-logo` 引用不变，直接受益减体积）。
- 网站根目录放一份 `logo.gif`，在 `index.html` hero 的 h1 slogan「……一辈子的事。」**句号之后紧靠着**插入 `<img>`：
  - 行内展示，基线/垂直居中对齐文字，高度约等于 h1 的一行字高（用 em/相对单位）。
  - 样式写成 class（遵守 tokenization 规则，不许内联 style 硬编码）。
  - 移动端不换行挤压 slogan；放不下时允许 img 缩小。
  - `alt=""` 装饰性。

## 2. 四类游戏每类 +1（共 4 个新游戏）

四类 = games/index.html 的 4 个 tab：问答(qa) / 科学(science) / 编程(code) / 多学科(multi)。科学类本次加**物理**（已确认）。

| 类别 | 新文件 | 标题（建议，可微调） | 玩法要点 |
|---|---|---|---|
| 问答 | `games/g60-mistakes.html` | 错误博物馆 🏛️ | 呈现"犯错场景"，选应对方式，呼应「先一起解决问题，再想别的」，风格对齐 g01–g20 |
| 物理 | `games/g61-physics-buoyancy.html` | 浮力沉浮舱 ⚓ | 复用 `physics-playground.css/js` 外壳；调密度/排水量让物体沉浮到目标位置 |
| 编程 | `games/g62-loop-factory.html` | 循环工厂 🔁 | **必须复用 `code-lab.css/js` 公共外壳，星级存 `fo_game_stars`**；用循环指令批量生产零件，比较"手写 N 次 vs 循环" |
| 多学科 | `games/g63-food-chain.html` | 食物链平衡 🦉 | 生物/生态题材（补当前 史/地/文/数 缺口）；增删物种观察生态链连锁反应 |

- 全部遵守 `docs/GAME_UI_STANDARD.md`（主画面+主控件同屏，桌面 workbench 布局）。
- 在 `games/index.html` 对应数组注册（qaGames / physGames / codeGames / multiGames）。
- 4 个新游戏都**不是**各组第一个 → 属于 gated，交给 `sync-gate.js` 处理，不要手写豁免。
- 内容基调需与 `uploads/` 李笑来六原则一致，不编造引文。

## 3. 打卡做成通用工具（小程序优先，网页原地通用化）

### 3a. 小程序 `pages/summer`（优先，改动最大）

现状：任务规则硬编码在 `summer.js` 的 `genTasks()`，无设置、无编辑、无激励。打卡数据 `fo_summer_done`。

- **配置驱动**：新增本地配置 `fo_checkin_cfg`：`{ title, start, end, slots[], items[] }`。
  - item 结构：`{ id, name, slot, req, time, days }`（days 为周几过滤或特定日期，覆盖现在 genTasks 里的所有规则：周二/周五范文、7-15~7-19 英语课、8-16/8-23 单日任务、周六 Switch 等）。
  - 默认配置 = 现有硬编码计划原样迁移 → 老用户 `fo_summer_done` 数据继续有效，**不做迁移**。
- **右上角设置入口**（页面标题栏区域放 ⚙️）：设置页可改标题、日期跨度（起止日期 picker）、时间段(slots)增删改、每日项目增删改（名称/时间段/时间文字/必做自选/重复规则）。
- **长按条目**：day 视图长按任务 → actionSheet：改名称 / 改时间 / 仅今天删除 / 从计划中删除。
- **激励撒花**：轻量 canvas 粒子（自己写，不引库，参考网站 summer2026.html 的 fx 实现思路）：
  - 单次勾选：小型爆花（勾选处）。
  - 连续勾满 3 项：中型撒花 + toast。
  - 当天必做全部完成：全屏大撒花 + toast。
- 体积敏感：只加代码不加图片资源，见第 6 条。

### 3b. 网站 `summer2026.html`（原地通用化）

已有：设置 tab、云同步、逐日增删改任务(added/removed/renamed)、撒花(勾选爆花/连击/全完成 celebrate)。**这些全部保留**。缺口只有配置化：

- 把 `const START/END`、标题「快乐暑假 2026」、任务骨架 genTasks 规则改为配置驱动，存入现有状态 S（随云同步走），默认值 = 现状。
- 设置 tab 增加：标题、日期跨度、时间段、任务模板（骨架级增删改，区别于现有的按天 diff）。
- 移动端 day 视图任务条目支持**长按**唤出编辑（复用现有 rename/remove 逻辑，不重写）。
- 撒花已达标，不动。

## 4. 弟弟绘本：仅最后一页显示「上一本 / 返回目录 / 下一本」

现状：`storybooks/NN-*.html` 只有页内 ←/→ 翻页，无跨本导航。

- 新增跨本导航条：**仅当翻到本书最后一页**（`idx === total - 1`）时显示「← 上一本 · 返回目录 · 下一本 →」；其他页一律不显示（翻回去要隐藏）。
- 「返回目录」→ `/for-youngest`。
- 书序**必须生成，禁止手维护**（每日自动任务会新增绘本）：从 `for-youngest.html` 的绘本卡片顺序生成 `storybooks/booklist.js`（生成逻辑挂进 `scripts/sync-gate.js` 链，与 sync-miniprogram 同级）。注意存在 15/16 重号文件，以 for-youngest.html 卡片顺序为准。
- 导航渲染逻辑放 `fo-utils.js` 共享函数（各书已有 `BOOK_ID/BOOK_TOTAL`），每本书只加一行调用；仅作用于弟弟的数字编号系列，`m##` 小熊系列不加。
- 首本无「上一本」、末本无「下一本」（隐藏该按钮即可）。下一本若是 gated 页，由目标页 fo-gate 自行处理，不特判。

### 附：整本下载/分享（本次不实现，仅记录方案）

朋友想按"一本绘本"为单位下载/分享。建议高级版做法：
1. **自包含单文件导出**（推荐）：脚本把某本 HTML 的 styles.css 相关子集 + fo-utils 依赖内联，产出单文件 HTML 供下载（插画本身是内联 SVG，天然自包含）。
2. 打印样式 → 每页一屏的 print CSS，用户"存为 PDF"。
3. 分享即链接：现有 URL + og 图已可分享，补每本独立 og:image 即可。

## 5. 小程序「我的」：头像圆角正方形 + 反馈机制

- 头像：现状 `avatar-btn` 用 `--radius-full`，实际渲染成"椭圆边长方形"（button 原生 min-width 把按钮撑宽了）。修复：`min-width:0` 等手段保证 128×128rpx 正方形，圆角改用 **`--radius-lg`（圆角正方形）**，`avatar-img`、`avatar-placeholder` 同步。检查小程序内其他展示头像处（如 home 问候）一并统一。
- 反馈：mine 页新增「意见反馈」区块：
  - `<button open-type="feedback">`（微信原生反馈，后台可查可回）。
  - 次要按钮「复制邮箱」→ `wx.setClipboardData` 复制 `ocular.sunsets0a@icloud.com` + toast 提示去邮件 App。
- 网站侧：`index.html` 页脚加一条 `mailto:ocular.sunsets0a@icloud.com?subject=[family-os 反馈]` 链接，文案低调。

## 6. 小程序体积守护（当前 2.0M，红线 2M）

- 本批次不新增任何小程序图片资源；logo.gif 降规格预计省 ~100KB+。
- `scripts/sync-miniprogram.js` 末尾加体积检查：统计 `miniprogram/` 总大小，>1.9M 打印警告并列出 top 文件，>2.0M 直接 exit 1。
- 全部改完后运行 `node scripts/sync-gate.js`，确认体积检查通过并在最终汇报中给出小程序总大小。

## 验收清单

- [ ] logo.gif 280×280/10fps，≤150KB；首页 slogan 句号后紧跟 logo，移动端不破版
- [ ] 4 个新游戏可玩、注册进 index、遵守 GAME_UI_STANDARD、被 sync-gate 正确 gated（免费首游不变）
- [ ] 小程序打卡：设置可改标题/跨度/时间段/项目；长按可编辑；三档撒花生效；老打卡数据不丢
- [ ] 网站打卡：配置驱动 + 模板编辑 + 长按；原云同步/按天 diff/撒花不回归
- [ ] 绘本：非最后一页看不到跨本导航；最后一页三个入口正确；booklist 为生成物
- [ ] 「我的」头像为圆角正方形（非椭圆）；原生反馈+复制邮箱可用；网站页脚 mailto
- [ ] `node scripts/sync-gate.js` 跑通；miniprogram 总大小 <1.9M
- [ ] 提交历史符合 commit 规范（英文、type(scope)、按里程碑分开）
