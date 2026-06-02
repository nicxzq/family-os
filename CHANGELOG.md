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

## v0.1 · 初始建站 · 2026-05 以前

家庭操作系统首版上线，含：主页六条理念、给妻子/哥哥/弟弟/家人朋友的专属页、游戏库（10 款）、共读书架、绘本系列、工具面板（dashboard/piggy-bank/weekly-review/attention-budget）、slides 演示、wall 海报生成器。
