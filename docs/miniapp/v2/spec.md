# 小程序 v2 技术规格（spec）

> 对应 `requirements.md` R1–R9。所有改动遵守仓库 CLAUDE.md：wxss 只用 `var(--*)` token（`app.wxss` 的 `page {}`），不硬编码颜色/尺寸；js 只管行为；`data/stories.js`、`data/readers.js`、`data/topics.js` 是生成物不手改。

## §1 Logo 动图（R1，待文件）

- 文件落位：`miniprogram/assets/logo.gif`（用户提供）。
- 首页 hero：`pages/home/home.wxml` 的 `.hero-logo` `src` 改为 `/assets/logo.gif`（`<image>` 原生播 GIF），`mode="widthFix"` 不变；若 GIF 是方形而旧 logo 是横版，调 `home.wxss` 中 `.hero-logo` 宽度（token 化）。
- canvas 分享图：GIF 无法上 canvas 动画。用脚本从 GIF 抽第 1 帧生成 `assets/logo-mark.png`（覆盖旧文件，1:1，≥176px），`share-card.js` 不需要改逻辑。抽帧脚本放 `scripts/gen-logo-frame.js`（node + sharp 或 ImageMagick，本地跑一次）。
- 体积预算：小程序主包 2MB。GIF 若 >300KB 需压缩（缩边长/减帧）。

## §2 全页面分享（R2）

新增 `miniprogram/utils/share.js`：

```js
// buildShare(title, path) -> { title, path, imageUrl? }
// buildTimeline(title, query) -> { title, query }
```

每个页面显式挂 `onShareAppMessage` + `onShareTimeline`（不做全局 Page 重写，保持可读）：

| 页面 | title | path |
|---|---|---|
| home | 好的家庭教育 · 一家人的操作系统 | /pages/home/home |
| role（已有，补 timeline） | 给{角色}：{tag} | /pages/role/role?role=id |
| toolbox | 家庭工具箱 | /pages/toolbox/toolbox |
| mine | 好的家庭教育 | /pages/home/home（"我的"分享落首页） |
| idea（已有，补 timeline） | {idea.title} | /pages/idea/idea?no=N |
| reader | {piece.title} | /pages/reader/reader?id=X |
| story | {story.title} | /pages/story/story?id=X |
| topics | 饭桌问题 · 50 个话题 | /pages/topics/topics |
| quiz | 5 道小测试 | /pages/quiz/quiz |
| summer | 快乐暑假打卡 | /pages/summer/summer |
| review | 家庭周会 · 每周 10 分钟 | /pages/review/review |
| piggy | 零花钱实验室 | /pages/piggy/piggy |
| attention | 注意力账本 | /pages/attention/attention |
| games（R6 新增） | 一起玩的小游戏 | /pages/games/games |

- `onShareTimeline` 只返回 `{ title, query }`（query 如 `no=N`、`id=X`）。
- 动态页在数据未加载时回退静态 title。
- R1 文件到位后，可给 share 加统一 `imageUrl`（5:4 静态图），本期不做。

## §3 首页（R3）

- 按钮文案：`🖼️ 存成 A4 家庭墙图片（六条合一）` → `🖼️ 存成 A4 家庭墙图片`。
- 共读清单：把 `wx:if="{{selBook}}"` 的介绍卡移进书架循环——每个 `.shelf` 行之后（`.shelf-board` 之下）渲染 `wx:if="{{selRow === ri}}"` 的卡片；`pickBook` 记录 `selRow`。未选中提示 `.book-hint` 保留在书架整体下方。

## §4 称呼统一（R4）

只改以下位置（均为手工维护文件）：

| 文件 | 改动 |
|---|---|
| `data/roles.js` | eldest name `哥哥`→`老大`；youngest name `弟弟`→`老二`（desc 里如有同词一并改） |
| `data/ideas.js` | BOOKS `who`: `妻子`→`妈妈`、`哥哥`→`老大`、`弟弟`→`老二`；正文 `对哥哥现在这个年纪`→`对老大…` |
| `data/quiz.js` | 首行注释 `给哥哥`→`给老大` |
| `pages/role/role.wxml` | `给哥哥`标题与注释→`给老大`；弟弟块注释→老二 |
| `miniprogram/README.md` | 表格与说明中的哥哥/弟弟称呼同步 |

**不改**：`data/stories.js`、`data/readers.js`（生成物；且其中"弟弟/妻子"多为正文叙述）。review 页已用 老大/老二，无需动。

## §5 书架 + 翻本导航（R5）

- 抽公共书架样式：把 `home.wxss` 的 `.shelf* / .bookshelf` 系列迁到 `app.wxss`（token 化），home 与 role 共用。
- role 老大块：`GROUPS` 平铺成书脊（显示 `code` + `title`，色用现有 `item.color`），按 group 分行书架；不可读（无 id）书脊置灰 + 点击 toast 不变。
- role 老二块：`CATALOG` 书架化，封面图立在架上（`cover` 有图用图、无图 📕），`available:false` 置灰"即将上架"。
- 翻本导航：
  - `data/readers.js` 生成物**不改**；在 `reader.js` 内用 `GROUPS` 平铺出有 `id` 的有序数组，定位当前 id 的前后篇。
  - `reader.wxml` 底部（action 卡后、tabbar 前）加 `‹ 上一本 {title}` / `{title} 下一本 ›` 两按钮，边界时对应侧隐藏；跳转用 `wx.redirectTo`（防页面栈溢出）。
  - `story.js` 同理用 `CATALOG` 中 `available` 项；按钮放 `.pager` 区域内（全屏 swiper 布局，不新增滚动）。

## §6 游戏中心（R6）

### 结构

```
pages/games/games            目录页（分类 tab + 卡片流）
pages/games/play/qa          g01-direction 问答·方向感（简化移植）
pages/games/play/physics     g22-physics 物理弹弓（简化）
pages/games/play/chem        g21-chemistry 化学厨房（简化）
pages/games/play/code        g41-blocks 积木编程（简化）
pages/games/play/multi       g44-history-detective 历史侦探（简化移植）
data/games.js                手工目录：5 个 live + 47 个预告（id/名称/emoji/分类/color）
```

（小程序页面须两级目录：实际落位 `pages/games/games` 与 `pages/game-qa/game-qa` 等平级页亦可，实现时取更简单者，注册进 `app.json`。）

- 目录页：分类 tab（问答/科学/程序/多学科，对齐网站 `games/index.html`），live 卡"开始 →"，预告卡置灰"敬请期待"。预告清单从 `games/index.html` 的目录数据整理进 `data/games.js`。
- 入口：toolbox 网格加"🎮 一起玩的小游戏"卡；role 老大块加入口卡（同暑期卡样式）。

### 5 个游戏的简化标准

内容（题目/参数/文案）**必须从对应网站 HTML 提取**，不自造：

1. **qa（g01）**：情景问答，逐题选择 + 即时反馈 + 结果页。纯 view 实现，接近等价移植。
2. **multi（g44）**：历史侦探，线索→推断选择题，纯 view，接近等价移植。
3. **physics（g22）**：弹弓打靶。canvas 2d：拖动定角度/力度，抛物线飞行，命中判定。保留"角度+力度→抛物线"核心，去粒子/音效。
4. **chem（g21）**：化学厨房。简化为"选试剂组合→反应结果判定"卡片制（不做拖拽锅具动画），反应配方取自源 HTML。
5. **code（g41）**：积木编程。网格地图 + 指令队列（前进/左转/右转/循环）→ 点运行逐步执行到达目标。view 网格实现，免 canvas。

- 星级/通关记录统一存 `fo_game_stars`（`{gameId: n}`），与网站 `fo_game_stars` 键名对齐，便于未来云同步。
- 每页挂分享（§2）与 `<fo-tabbar active="toolbox" />`。
- 样式复用 token；游戏主界面+主控件同屏（遵守 `docs/GAME_UI_STANDARD.md` 精神）。

## §7 家庭周会（R7）

- 布局：`.week-bar` 改两行——第一行居中 `{{weekLabel}}`（主）+ `{{rangeLabel}}`（次），第二行三键：`← 上一周` / `回到本周`（仅非本周显示）/ `下一周 →`。按钮等宽、不换行挤压。
- 快捷分享：头部加 `<button open-type="share">` 小按钮；页面挂 `onShareAppMessage`（§2）。
- 从上周复制：头部加"⬇︎ 从上周复制"按钮。逻辑：读上周 key（当前 offset−1 的 ISO 周）数据；无数据 toast"上周还没写"；当前周已有内容时 `wx.showModal` 确认覆盖策略：**仅填充空字段，不覆盖已填**（文案说明）；复制后 `save()`。

## §8 隐私政策与免责说明（R8）

- 新页 `pages/policy/policy?type=privacy|disclaimer`（一页两用，注册进 `app.json`），静态内容写在页面 js 常量。
- mine 页"关于"卡上方加两行入口：`隐私政策 ›`、`免责说明 ›`。
- 隐私政策要点：所有数据（头像昵称、角色、阅读记录、周回顾、记账、打卡）仅存本机 storage，不上传任何服务器；头像仅本地裁剪存储；导出功能由用户主动触发、文件由用户自行保管；不接入第三方统计；删除小程序即清除全部数据；联系方式（意见反馈邮箱 ocular.sunsets0a@icloud.com）。
- 免责说明要点：内容基于李笑来家庭教育公开材料整理，仅供本家庭学习交流，非专业教育/心理/医疗建议；游戏与工具为教育用途；如内容涉第三方权利请联系处理。
- 同时在微信后台《用户隐私保护指引》按此填写（人工操作，写入 plan 的 checklist）。

## §9 内容后端规划（R9，本期只规划）

**路线：微信云开发（个人主体可用，免域名/备案）。**

### 架构

```
云开发环境 fo-prod
├─ 云存储 content/content.json   全量内容包（版本号 + 各模块）
└─ （后续可选）云数据库 collections：notices、books、topics
```

客户端 `utils/content.js`：

```
getContent(module):
  1. 读本地缓存 fo_content_cache（含 version、fetchedAt）
  2. 超过 TTL(24h) 或强刷 → wx.cloud.downloadFile(content.json) → 比 version → 更新缓存
  3. 失败/无网 → 回退缓存 → 回退打包内 data/*.js
```

### 分期

- B1：开通云开发、上传 content.json（先收编：BOOKS 书单、饭桌 topics、games 预告清单、首页公告位）；页面接 `getContent()`，打包数据兜底。
- B2：`sync-miniprogram.js` 末尾追加"生成 content.json"步骤，人工用微信开发者工具/控制台上传（或 CI 用 cloudbase CLI）。
- B3（可选）：周回顾/阅读记录云同步（涉及 openid 与隐私政策更新，单独评估）。

### 明确不做

- 不用 web-view（个人主体禁用）；不自建服务器（旧阿里云方案归档）；正文类内容（readers/stories 全文）暂不上云——体积大且更新频率低，仍走发版。

### 成本

云开发基础套餐约 ¥19.9/月；仅静态 JSON 分发时流量可忽略。
