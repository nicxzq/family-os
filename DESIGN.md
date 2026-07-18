# Design Spec — 小程序改版:四 tab 信息架构

> 日期:2026-07-18。范围:`miniprogram/` 目录。网站不动。
> 本文是产品意图来源;现有小程序代码是工程事实来源。实现前先读 `miniprogram/README.md`。
> `docs/miniapp/` 下的旧 Taro 方案(2026-06-05)已废弃,不要参照。

## Goal

现有 3 tab(首页/绘本/饭桌问题)信息架构不符合家庭成员实际使用习惯:首页过长、角色入口混在长页里、工具分散。改为四 tab:**首页 / 角色 / 工具箱 / 我的**。

已确认的产品决定:

- 角色只有四个:**爸爸妈妈**(不再区分"给妻子")、**哥哥**、**弟弟**、**爷爷奶奶和朋友**。老二(for-middle 熊绘本)不进小程序。
- v1 **纯本地,不做微信登录**(个人主体 + Supabase 域名无备案,openid 换取无后端可用)。角色、头像、进度全部存本地 storage。
- 工具箱本期移植:**每周回顾、存钱罐、注意力预算**;已有的饭桌问题、5 题测试直接挂入。52 个游戏不进。
- "我的"里的"留档"= **阅读记录**(看过什么、什么时候看的)。

## Users

| 角色 | storage 值 | 角色页内容 |
|---|---|---|
| 爸爸妈妈 | `parents` | 父母原则(由 wife 页内容改写为父母共读视角) |
| 哥哥(12岁) | `eldest` | 成长读本 4 组 28 篇 + 暑期计划 |
| 弟弟(6岁) | `youngest` | 毛毛绘本 36 本 |
| 爷爷奶奶和朋友 | `family` | 三个短故事 |

当前角色存 `wx.setStorageSync('fo_role', <值>)`。无角色时进"角色"tab 弹出角色选择(全屏友好弹层,四张卡)。

## Screens

### app.json 页面与 tabBar

```jsonc
"pages": [
  "pages/home/home",        // tab1 首页(重构)
  "pages/role/role",        // tab2 角色(新)
  "pages/toolbox/toolbox",  // tab3 工具箱(新)
  "pages/mine/mine",        // tab4 我的(新)
  "pages/idea/idea",        // 六句话详情(新,?no=1..6)
  "pages/story/story",      // 绘本阅读器(保留)
  "pages/reader/reader",    // 读本正文(保留)
  "pages/topics/topics",    // 饭桌问题(从 tab 降为普通页)
  "pages/quiz/quiz",        // 5 题测试(原 pages/eldest 改名迁移)
  "pages/summer/summer",    // 暑期计划(新,内容源 summer2026.html)
  "pages/review/review",    // 每周回顾(新,内容源 weekly-review.html)
  "pages/piggy/piggy",      // 存钱罐(新,内容源 piggy-bank.html)
  "pages/attention/attention" // 注意力预算(新,内容源 attention-budget.html)
]
```

tabBar 四项:首页 / 角色 / 工具箱 / 我的。v1 允许纯文字 tab(现状即纯文字);若补图标,放 `miniprogram/assets/tab/`,81×81 png,普通态用 `--ink-mute` 色系、选中态用 coral 色系。

**删除/合并的旧页**:`pages/wife`(内容改写进角色页 parents 块)、`pages/eldest`(测试部分迁 `pages/quiz`)、`pages/family`(故事迁角色页 family 块)、`pages/youngest`(目录迁角色页 youngest 块)、`pages/readers`(目录迁角色页 eldest 块)。`pages/story`、`pages/reader` 详情页保留,入口改从角色页进。

### Tab1 首页 `pages/home/home`

自上而下:

1. **Hero**(压缩版):eyebrow "A FAMILY OS" + 一句主标题。删掉现在的长副标题和四个 pill(角色入口下移为卡片区)。
2. **六句话轮播**:`<swiper>` 全部 6 张,`autoplay`(间隔 5s)`circular`,指示点。每张卡 = 序号 + 标题 + 场景句 + 关键句,沿用 `card--{{color}}` 四色。**点卡 `navigateTo` 到 `pages/idea/idea?no=N`** 看完整 detail 段落(数据仍取 `data/ideas.js`,详情页一页复用)。不在 swiper 内做展开(高度会跳)。
3. **角色入口**:2×2 四张卡(爸爸妈妈/哥哥/弟弟/爷爷奶奶和朋友),点击 = `wx.setStorageSync('fo_role', x)` 然后 `wx.switchTab` 到角色 tab。
4. **工具箱入口**:一条横幅卡("工具箱 · 饭桌问题、存钱罐、每周回顾…"),点击 `switchTab` 工具箱。
5. **家庭墙六条**:保留现有 wall 块原样。
6. **共读清单**:保留现有 book 卡列表原样。
7. footer 保留。

### Tab2 角色 `pages/role/role`

- **顶栏**:当前角色名 + "切换"按钮(点开半屏 action 弹层换角色,弹层复用首次选择的四卡样式)。切换即时刷新本页内容并回写 storage。
- **无角色首进**:直接展示选择弹层,选完落到对应内容。
- 内容按 `fo_role` 用 `wx:if` 分块渲染(单页,不做子页面跳转):
  - `parents`:父母原则。**文案改写**:现 `pages/wife/wife.wxml` 的正文是"丈夫写给妻子"视角,改为"我们做父母的"共读视角(称呼从"你"改"我们",删去写信口吻的开头结尾;六条原则本体、场景例子不变,内容仍须忠于 `uploads/` 源文本)。小程序独立维护此文案(README 已允许 wife/family 类正文手写在 wxml),网站 for-wife.html 不动。
  - `eldest`:两个 section——①成长读本:沿用现 `pages/readers` 的分组目录(4 组 28 篇,数据 `data/readers.js`),点条目 `navigateTo` reader;②暑期计划:入口卡 → `pages/summer/summer`。
  - `youngest`:毛毛绘本目录,沿用现 `pages/youngest` 的封面网格(数据 `data/stories.js`),点封面进 story。SVG 封面 base64 较重,`data/stories.js` 仅在 role=youngest 时 `require`(role.js 里按需加载再 setData)。
  - `family`:三个故事,沿用现 `pages/family` 正文(手写 wxml 内容平移)。
- 分享:`onShareAppMessage` 带当前角色 path,转发给对应家人点开直达其角色内容。

### Tab3 工具箱 `pages/toolbox/toolbox`

网格(每行 2 个)六张工具卡,四色轮换:

| 工具 | 状态 | 落点 |
|---|---|---|
| 饭桌问题 | 已有 | `pages/topics/topics`(页面原样,只是从 tab 变 navigateTo) |
| 五题小测试 | 已有 | `pages/quiz/quiz`(原 eldest 页迁移,去掉"给哥哥的信"定位文案,改中性标题"测一测") |
| 每周回顾 | 本期移植 | `pages/review/review` |
| 存钱罐 | 本期移植 | `pages/piggy/piggy` |
| 注意力预算 | 本期移植 | `pages/attention/attention` |
| 更多工具 | 占位 | 灰态卡"网站版还有 52 个小游戏",不可点 |

三个移植工具的规约(行为对齐网站页,交互简化为小程序习惯;**先读对应网站 HTML 源再实现**):

- **每周回顾** `weekly-review.html` → 表单页:本周勾选项 + 文本框,按周存 storage(键 `fo_review_<ISO周,如2026-W29>`),顶部可切换查看历史周。网站版是打印排版,小程序版不做打印,做"填写 + 回看"。
- **存钱罐** `piggy-bank.html` → 零花钱台账:余额 + 记一笔(收/支/存)+ 流水列表,逻辑对齐网站页,数据键沿用网站 localStorage 键名(前缀 `fo_`,具体以源码为准)迁到 wx storage。
- **注意力预算** `attention-budget.html` → 追踪小游戏:对齐网站页玩法;若含 canvas,遵守 `docs/GAME_UI_STANDARD.md`(主玩法面与主控件同屏)。
- 暑期计划 `summer2026.html` → 按天任务视图 + 本地勾选打卡(任务生成规则移植自网站 genTasks,取默认量;`fo_summer_done` 独立存本地,不与网站互通)。日历/周回顾/AI 点评不移植,页尾注明完整版在网站。工具箱与哥哥角色页都给入口。

### Tab4 我的 `pages/mine/mine`

列表式设置页:

1. **头像昵称卡**:`<button open-type="chooseAvatar">` + `<input type="nickname">`(微信头像昵称填写能力)。头像临时路径需 `wx.getFileSystemManager().saveFile` 转持久路径再存;存 `fo_profile = { nickname, avatarPath }`。未设置时显示默认占位(cream 底 + 首字)。
2. **当前角色**:显示角色名,点击换角色(同角色页弹层)。
3. **阅读记录**:两行统计(读本已读 x/28、绘本已读 y/36)+ 点击展开最近记录列表(名称 + 日期)。数据:`fo_read_readers`、`fo_read_stories`,均为 `{ slug: 时间戳 }` 映射;分别在 reader/story 页 `onLoad` 时回写。
4. **帮助**:静态说明(这是什么、四个 tab 怎么用、内容来自哪),写在 mine 页内弹层或内嵌 section,不单开页面。
5. **关于/版本**:版本号 + 一句话介绍 + "内容源:family.carlxu.cn"。
6. 不出现任何登录/账号 UI(v1 无后端)。

## Visual Direction

- 全部沿用 `miniprogram/app.wxss` 现有 token(与网站 `styles.css` 调色板一致):cream 底、coral/yellow/green/blue 四色卡、`--radius`/`--shadow-card`。**不新增颜色,不硬编码视觉值**;缺 token 就在 app.wxss 加语义 token。
- 新页面卡片风格对齐现有 `card card--{{color}}` 体系。
- swiper 指示点用 coral;工具箱网格卡与首页角色卡同构(tag + 标题 + 一句描述 + "打开 →")。

## Data and States

- storage 键汇总:`fo_role`、`fo_profile`、`fo_read_readers`、`fo_read_stories`、`fo_review_<week>`、存钱罐/注意力沿用或新起 `fo_` 前缀键。
- `data/{stories,readers,topics}.js` 仍是 `sync-miniprogram.js` 生成物,**不手改**;本次改版不改动生成脚本的输出格式。实现时核对脚本无对页面路径的引用(理论上只产数据)。
- `data/ideas.js`、`data/quiz.js` 手工维护,格式不变;quiz 数据被 `pages/quiz` 复用。

## Acceptance Criteria

1. tabBar 为四项且均可达;旧 5 个被合并页面从 `app.json` 移除,工程无死路由、无未引用页面目录残留。
2. 首页六句话为自动轮播 swiper,点任意卡进入对应详情页,详情内容与 `data/ideas.js` detail 一致。
3. 首页点"哥哥"卡后:角色 tab 直接是哥哥内容;杀掉小程序重进,角色 tab 仍是哥哥(storage 生效)。
4. 清空 storage 首次进角色 tab,出现四选一弹层,选择后不再弹。
5. parents 文案无"妻子/写给你"等信件口吻残留;原则内容与 uploads 源一致。
6. 弟弟绘本、哥哥读本目录与改版前条目数一致(36/28),点击可读,阅读后"我的"里计数 +1。
7. 工具箱 5 个可用工具都能打开并完成一次核心操作(答一题/记一笔/填一次回顾),数据杀进程后仍在。
8. 每周回顾按周隔离:本周填写不影响上周记录,可回看历史周。
9. "我的"可设头像昵称,重进后仍显示。
10. 全部改动页 wxss 无硬编码颜色/尺寸(过 ui-tokenize 检查);无 console 报错。
11. `node scripts/sync-miniprogram.js` 跑通无新增警告(数据文件格式未被破坏)。
12. `miniprogram/README.md` 页面结构表更新为新架构。
