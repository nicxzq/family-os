# family-os · 升级日志

记录每个阶段的改动与决策。格式：`版本 · 阶段名 · 日期`。

---

## v0.2 · P0 隐私分区 + 去过度承诺 · 2026-06-02

对应方案 **C1（隐私分区）+ C2（去过度承诺）**。核心原则：只改写/脱敏，不删内容；先堵住被动泄露，再做功能。

### C1 · 年龄脱敏

精确年龄从所有公开页面移除，改为称呼/年龄段描述：

| 文件 | 改动 |
|---|---|
| `index.html` | "给十二岁哥哥/给六岁弟弟" → "给哥哥/给弟弟"；"十二岁正好" → "这个年纪正好" |
| `for-eldest.html` | title/OG/Twitter/h1/nav/h3 六处"十二岁的你" → "正在长大的你" |
| `games/index.html` | title/h1/导航链接去掉精确年龄 |
| `docs/miniapp/data.js` | 同步脱敏（4 处年龄标签） |
| `docs/miniapp/storydata.js` | intro 标题"十二岁的你" → "正在长大的你" |

### C1 · noindex 注入

直发页只发给特定家人，不需要被搜索引擎/AI 抓取：

- `for-eldest.html` — 新增 `<meta name="robots" content="noindex,noai,noimageai">`
- `for-youngest.html` — 同上
- `robots.txt` — 已在上一版配置（Allow 公开理念层，Disallow /private /miniapp /for-eldest /for-youngest /storybooks）

### C2 · 去过度承诺

将"满到做不到"的绝对承诺改写为"诚实且赋权"版：

- **原**：`for-eldest.html` 第 491 行 — "二 · 你犯错可以，被指责不行。这家里没有'批评教育'。"
- **改**：二 · 你犯错可以。我们尽量先一起解决问题，而不是先指责你。如果哪天我们没忍住、先怪了你——你可以提醒我们这条。
- `docs/miniapp/storydata.js` result.secret[1] 已同步（该文件此前已更新为改写版）

### 验收

- 全站 `.html/.js`（排除 Docs/ uploads/）中"十二岁/六岁/批评教育"命中数 = 0 ✓
- `for-eldest.html` / `for-youngest.html` 各含 `noindex,noai,noimageai` ✓
- `robots.txt` 存在且屏蔽直发页 ✓

---

## v0.4 · P2 真实问题库（C4）· 2026-06-03

对应方案 **C4（真实问题库 · 双层卡片）**。核心原则：公开方法，私密实例。

### 新增文件

| 文件 | 说明 |
|---|---|
| `problems-data.js` | 问题库数据源。结构 `{id, theme, title, no, public:{scene,before,wrong,after,pact}, family:{}}`。`public` 字段脱敏可公开；`family` 字段留本地私密区。 |
| `problems.html` | 问题列表页（`/problems`）。按六条原则主题分组；每张卡片顶部标"脱敏公开"；登录后显示 `family` 私密实例，未登录显示锁定提示。 |
| `scripts/check-problems.sh` | CI 黑名单校验。检测 `problems-data.js` 的 public 字段是否含年龄/姓名禁词，命中即非零退出。向数据文件追加内容前运行一次。 |

### `index.html` 改动

- `#coauthor` 区块内追加"真实问题库"入口卡，链接到 `/problems`。

### 使用说明

- **追加新问题**：向 `problems-data.js` 的 `PROBLEMS` 数组追加对象，运行 `bash scripts/check-problems.sh` 确认无禁词，再发布。
- **记录私密实例**：在 `family` 字段写入具体场景（`instance` 字段），登录家人可见，不公开抓取。
- **6 条问题**当前均为公开脱敏版；私密层为空占位，等家庭会议后逐步填入。

---

## v0.3 · P1 家庭共创模块（C3）· 2026-06-02

对应方案 **C3（家庭共创）**。把"爸爸的宣言"变成"有别人笔迹的系统"。

### 新增文件

- **`family-changelog.js`** — 修订日志数据源。格式 `{date, who, change, privacy, ideaId?}`。`privacy:"public"` 才渲染到主页；`ideaId` 有值时作为对应理念卡的"反对意见"显示。

### `index.html` 改动

| 位置 | 改动 |
|---|---|
| `<style>` | 新增 `.coauthor-*`、`.changelog-*`、`.image-slot`、`.idea-objection` 样式 |
| topnav | 追加"共同创作"链接 → `#coauthor` |
| 六条理念卡 | 各加 `data-idea-id`（development/reading/learn-together/soft-skills/attention/time）|
| `</main>` 前 | 新增 `#coauthor` 板块：5 个角色行 + 弟弟画图占位 + 修订日志列表 |
| `<footer>` | "上次更新"由 JS 自动取 changelog 最新公开条目填充 |
| `<script>` | 加载 `family-changelog.js`；JS 渲染修订日志、更新页脚、为有 ideaId 的条目注入反对意见卡片 |
| scroll-spy | ids 数组追加 `'coauthor'` |

### 使用说明

- **记录新改动**：向 `family-changelog.js` 的 `FAMILY_CHANGELOG` 数组追加一条即可，主页自动更新。
- **记录反对意见**：追加条目时加 `ideaId: 'time'`（对应想法卡），该卡片会自动出现意见标记。
- **弟弟的画**：把图片放到 `assets/` 并将 `#coauthor` 里 `.image-slot` 替换成 `<img>` 即可。

---

## v0.1 · 初始建站 · 2026-05 以前

家庭操作系统首版上线，含：主页六条理念、给妻子/哥哥/弟弟/家人朋友的专属页、游戏库（10 款）、共读书架、绘本系列、工具面板（dashboard/piggy-bank/weekly-review/attention-budget）、slides 演示、wall 海报生成器。
