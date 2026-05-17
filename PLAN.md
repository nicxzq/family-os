# Family OS 新功能计划 — 会员体系 + 共读追踪 + 零花钱实验室

> Phases A–F（翻页按钮修复、互动动效、绘本 04/05/06、for-youngest 更新）已完成。
> 本计划仅包含新功能 Phases G–K。

---

## 数据层约定（localStorage，无需后端）

所有数据存在 `localStorage`，key 前缀统一用 `fo_`：

| Key | 类型 | 说明 |
|---|---|---|
| `fo_member` | JSON object | 当前登录成员 |
| `fo_members` | JSON array | 本设备所有成员档案 |
| `fo_family_code` | string | 家庭解锁码，默认 `"1234"` |
| `fo_progress` | JSON object | 阅读进度，按 memberId → bookId |
| `fo_history` | JSON array | 浏览历史，最多保留 200 条 |
| `fo_piggy` | JSON object | 零花钱账本，按 memberId |

```javascript
// fo_member 结构
{
  id: "uuid-v4",        // crypto.randomUUID() 生成
  name: "小弟",
  role: "child",         // "parent" | "child"
  avatar: "chick",       // "chick" | "dad" | "mom" | "star"
  color: "coral",        // "coral" | "blue" | "green" | "yellow"
  joined: 1716000000000  // Date.now()
}

// fo_progress 结构
{
  "member-uuid": {
    "01-try-it": { pages: [0,1,2,3,4], completed: true, last: 4, lastTs: 1716000000000 },
    "04-the-mountain": { pages: [0,1], completed: false, last: 1, lastTs: 1716000000000 }
  }
}

// fo_history 条目
{ bookId: "01-try-it", title: "试一试", ts: 1716000000000, memberId: "uuid" }

// fo_piggy 结构
{
  "member-uuid": {
    balance: 25.5,
    entries: [
      { id: "uuid", type: "income", amount: 10, label: "零花钱", emoji: "🎁", ts: 1716000000000 }
    ],
    goals: [
      { id: "uuid", name: "买书", target: 50, saved: 25, emoji: "📚" }
    ]
  }
}
```

---

## 共用工具模块（`fo-utils.js`，新建）

创建 `/fo-utils.js`，导出以下函数（用全局挂载，`window.FO = {...}`，不用 ES modules，兼容无构建）：

```javascript
window.FO = {
  getMember()         // 返回 fo_member 对象或 null
  setMember(obj)      // 写入 fo_member
  getMembers()        // 返回 fo_members 数组
  addMember(obj)      // 追加成员到 fo_members
  updateMember(obj)   // 按 id 更新 fo_members 中的成员
  getFamilyCode()     // 返回 fo_family_code（默认"1234"）
  setFamilyCode(c)    // 写入 fo_family_code
  logHistory(bookId, title)   // 写入 fo_history
  logProgress(bookId, pageIdx, total) // 写入 fo_progress
  getProgress(memberId)       // 返回该成员的进度对象
  getHistory(memberId, n)     // 返回最近 n 条历史（n 默认 20）
  getPiggy(memberId)          // 返回该成员的 fo_piggy 子对象
  setPiggy(memberId, obj)     // 写入该成员的 fo_piggy 子对象
  formatTimeAgo(ts)           // 返回 "今天" / "昨天" / "3天前" 等
  uuid()                      // 返回 crypto.randomUUID()
  avatarSVG(avatar, color, size) // 返回内联 SVG 字符串（用于头像）
}
```

`avatarSVG` 内置 4 种角色 SVG（纯内联，不引用外部文件）：
- `chick`：圆形小鸡（椭圆身体 + 小翅膀 + 喙）
- `dad`：带眼镜的鸡（大眼镜圈 + 肚子圆）
- `mom`：有花朵装饰的鸡（头顶小花）
- `star`：圆形 + 五角星图案

颜色映射到现有 palette：
- `coral` → `#E56B5A`
- `blue` → `#4B7BA8`
- `green` → `#6FA86D`
- `yellow` → `#F4C13E`

---

## Phase G: 登录页 + 成员体系

**新建文件**: `login.html`

### 页面结构

```
顶栏：← 返回（若有 back 参数则显示）
标题：家庭成员
副标题：选择你是谁
```

**成员网格**（`.member-grid`，CSS grid 2列或3列）：
- 每个已有成员：卡片（`avatarSVG()` 生成头像 + 名字 + 角色 badge）
  - 点击 → `FO.setMember(member)` → 跳转 back 参数 URL 或 `index.html`
- 最后一个卡片：`+ 新建成员`（虚线边框）→ 展开创建表单

**创建表单**（`.create-form`，初始 `display:none`，点 + 展开）：
1. 名字输入框（`<input type="text" placeholder="叫什么名字？" maxlength="8">`）
2. 头像选择（4 个按钮，每个显示对应 avatarSVG，选中态加边框）：`chick` / `dad` / `mom` / `star`
3. 颜色选择（4 个色块 16px 圆形按钮）：coral / blue / green / yellow
4. 角色选择（2 个大按钮）：🐣 孩子 / 🐓 家长
5. 如选"家长"，展示家庭码输入：`<input type="password" placeholder="家庭码（默认 1234）">`
6. 确认按钮："开始阅读 →"
   - 验证：名字不空；如是家长则校验家庭码（`FO.getFamilyCode()`）
   - 生成 uuid，调用 `FO.addMember()` + `FO.setMember()` → 跳转

**底部**：
- "以访客继续" 链接 → 清除 fo_member + 跳转（访客只能看 01-03）

### 样式要求

- 背景：`--cream`（`#F8F2E2`）
- 成员卡片：`border-radius: var(--radius-lg)`，`box-shadow: var(--shadow-card)`，白色背景
- 头像圆圈：64px × 64px，圆形，accent 色背景
- 创建表单：内嵌滑入展开，不跳新页

### 权限检查（修改 `for-youngest.html`）

在 `for-youngest.html` 的 `<script>` 中加入：

```javascript
// 在 DOMContentLoaded 后检查
document.querySelectorAll('a.book[data-gated]').forEach(a => {
  a.addEventListener('click', function(e) {
    if (!FO.getMember()) {
      e.preventDefault();
      location.href = 'login.html?back=' + encodeURIComponent(a.href);
    }
  });
});
```

将 books 04-06 的 `<a class="book"` 加上 `data-gated="true"` 属性。

显示成员问候语（已登录时）：在 `.head` 之前插入 `.member-bar`：

```html
<div class="member-bar">
  <!-- JS 动态渲染：头像 + "你好，小弟！" + dashboard 链接 -->
</div>
```

### `fo-utils.js` 引用

`login.html` 和所有需要用到成员数据的页面，在 `</body>` 前加：
```html
<script src="/fo-utils.js"></script>
```

---

## Phase H: 共读追踪面板

**新建文件**: `dashboard.html`

### 阅读日志注入（修改所有 6 个绘本）

在每个绘本的 `<script>` 顶部加载 `/fo-utils.js`，并修改 `goTo(n)` 函数：

**在 storybooks/01-try-it.html 至 06-the-direction.html 各文件的 `goTo` 函数末尾加入**：

```javascript
// 在每个绘本定义 bookId 常量（各文件不同）：
const BOOK_ID = '01-try-it'; // 各文件改为对应值
const BOOK_TITLE = '试一试'; // 各文件改为对应值
const BOOK_TOTAL = 5; // 各文件改为实际页数（不含 top 栏和结尾卡）

// 在 goTo(n) 末尾追加：
FO.logProgress(BOOK_ID, n, BOOK_TOTAL);
```

**在每个绘本 DOMContentLoaded 时加入**：
```javascript
FO.logHistory(BOOK_ID, BOOK_TITLE);
```

bookId / title / total 对照表：
| 文件 | BOOK_ID | BOOK_TITLE | BOOK_TOTAL |
|---|---|---|---|
| 01-try-it.html | `01-try-it` | 试一试 | 5 |
| 02-the-library.html | `02-the-library` | 图书馆 | 5 |
| 03-ten-minutes.html | `03-ten-minutes` | 十分钟 | 5 |
| 04-the-mountain.html | `04-the-mountain` | 上山 | 5 |
| 05-why-why.html | `05-why-why` | 为什么 | 5 |
| 06-the-direction.html | `06-the-direction` | 毛毛的路 | 5 |

### dashboard.html 页面结构

**顶栏**（`.dash-top`）：
- 左：`← 返回` 链接（到 `index.html`）
- 右：成员切换按钮（头像 + 名字，点击跳 `login.html`）

**成员栏**（`.hero-member`）：
- 大头像（96px）+ 名字 + 角色 badge
- "已读 X 本 · 共 Y 页" 统计数字（从 `fo_progress` 计算）

**共读进度**（`.progress-section`，标题"📚 阅读进度"）：
- 6 本书各一卡片（`.book-progress-card`）：
  - 左：色块（对应书的 accent 色，24×64px 圆角）
  - 中：书名 + 进度条（`<progress value="n" max="5">`）+ "第 n/5 页"
  - 右：已完成 → "✓ 完成" badge（coral 背景）；未读 → "未开始" badge（muted）
- 未登录时显示提示："登录后查看进度"

**最近阅读**（`.history-section`，标题"🕐 最近阅读"）：
- `FO.getHistory(member.id, 20)` 倒序渲染
- 每条：圆色点（书的 accent 色）+ 书名 + 时间（`formatTimeAgo`）
- 无历史时显示："还没有阅读记录，从第一本开始吧！"

**家庭总览**（`.family-section`，标题"👨‍👩‍👧‍👦 家庭进度"，仅 parent role 可见）：
- `FO.getMembers()` 中所有成员各一行：头像（32px）+ 名字 + "已完成 X 本"

**底部快捷入口**：
- 卡片链接：打开绘本 / 零花钱实验室 / 编辑档案

### 样式

- 整体背景：`--cream`
- 进度条：`<progress>` 自定义样式（height: 8px，accent 颜色）
- 卡片：白底，`var(--shadow-soft)`，`var(--radius)` 圆角

---

## Phase I: 零花钱实验室

**新建文件**: `piggy-bank.html`

### 页面结构

**顶栏**：`← 返回` + 标题"零花钱实验室🐷"+ 成员头像（点击 → login）

**存钱罐视觉**（`.piggy-wrap`，固定高度 220px）：

SVG 存钱罐（viewBox="0 0 200 200"）：
- 主体：椭圆（rx=90 ry=80，coral 色）
- 底部四条腿（矩形）
- 顶部投币口（圆角矩形）
- 尾巴（螺旋线）
- 鼻子（粉色圆椭圆 + 两个小圆鼻孔）
- 眼睛（两个小黑圆）
- 余额填充：在存钱罐内用 clip-path 做一个从底部向上填充的矩形，高度 = `balance / MAX_BALANCE * 100%`，颜色 `#FBE39A`（yellow-soft）

存钱罐下方：**余额数字**（`¥ 25.50`，大字，居中）

**快捷操作**（`.quick-actions`，两个大按钮水平排列）：
- `+ 收入`（green 背景）→ 展开收入表单
- `- 支出`（coral 背景）→ 展开支出表单

**内嵌记录表单**（`.entry-form`，展开时滑入）：
- 金额：`<input type="number" inputmode="decimal" placeholder="0.00">`
- 分类选择（横向滑动 chip 列表）：
  - 收入类：🎁 零花钱 / 🧹 做家务 / 🎂 生日礼金 / 🏆 奖励
  - 支出类：🍔 零食 / 📚 买书 / 🎮 玩具 / 🎨 文具 / 💝 礼物
- 确认按钮：点击 → `FO.setPiggy(...)` + 播放投币动画（SVG 小硬币从顶部落入存钱罐）

**账本**（`.ledger`）：
- 标题"📓 账本"
- 倒序列表：emoji + 标签 + 日期 + 金额（+green / -coral）
- 若无记录："还没有记录，先记一笔吧！"

**储蓄目标**（`.goals-section`）：
- 标题"🎯 储蓄目标"
- 每个目标卡片：emoji + 名字 + 进度条（`saved/target`）+ `¥ saved / ¥ target`
- "+ 新目标" 按钮（展开内嵌表单：名字 + 目标金额 + emoji 选择）
- 若余额 >= goal.target：显示"🎉 达成！" badge

### 动画效果

投币动画（`.coin-anim`）：
```css
@keyframes coinDrop {
  0%   { transform: translateY(-60px); opacity: 1; }
  80%  { transform: translateY(100px); opacity: 0.8; }
  100% { transform: translateY(100px); opacity: 0; }
}
```
- 点击确认 → 在存钱罐上方创建一个黄色圆形 `div.coin`，动画 0.6s 后移除
- 余额填充高度用 CSS transition 0.5s 更新

---

## Phase J: 个人形象维护

**修改文件**: `dashboard.html`（加编辑面板）

在 dashboard 底部加 "✏️ 编辑档案" 按钮，点击展开内嵌面板 `.edit-profile`：

**可编辑字段**：
- 名字（text input）
- 头像（4 选项，同 login.html）
- 颜色（4 色块）
- 仅 parent：家庭码（password input + "修改" 按钮）

**危险区**：
- "退出登录"（清除 fo_member，跳 login.html）
- "删除此档案"（confirm dialog → 从 fo_members 删除此成员 + 清除 fo_member → 跳 login.html）

保存时 → `FO.updateMember(edited)` + `FO.setMember(edited)` + 刷新页面头像

---

## Phase K: 导航集成

**修改文件**: `index.html`, `for-youngest.html`, `for-eldest.html`

在每个主页的顶部导航加 **成员角标**（`.nav-member`）：

```javascript
// 页面加载后执行
const m = FO.getMember();
const el = document.getElementById('nav-member-btn');
if (m) {
  el.innerHTML = FO.avatarSVG(m.avatar, m.color, 32) + '<span>' + m.name + '</span>';
} else {
  el.textContent = '登录';
}
el.onclick = () => location.href = m ? 'dashboard.html' : 'login.html';
```

HTML（加在每个主页的 `<header>` 或顶部导航中）：
```html
<button id="nav-member-btn" class="nav-member-btn" aria-label="成员"></button>
```

CSS（加在各页 `<style>` 中）：
```css
.nav-member-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.85);
  border: 0;
  border-radius: 999px;
  padding: 6px 14px 6px 6px;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  color: var(--ink-soft, #5C4F3D);
  box-shadow: 0 2px 0 rgba(43,36,25,0.08);
}
```

在绘本页面（`storybooks/*.html`）的 `.top` 栏右侧，加仪表盘入口图标（📊，链接到 `../dashboard.html`）。

---

## 实施顺序

1. **fo-utils.js** — 所有其他阶段的基础，先建
2. **Phase G** — login.html + for-youngest.html 权限改造
3. **Phase H** — dashboard.html + 6个绘本注入日志
4. **Phase I** — piggy-bank.html
5. **Phase J** — dashboard.html 编辑面板
6. **Phase K** — index / for-youngest / for-eldest 导航集成

---

## 技术约束

- **零依赖**：纯 HTML + CSS + JS，无 npm，无构建步骤
- **字体**：`"LXGW WenKai TC"` only
- **颜色**：仅使用已有 CSS 变量（`--coral`, `--blue`, `--green`, `--yellow`, `--cream`, `--ink` 等）
- **SVG**：所有图形用内联 SVG
- **持久化**：仅 localStorage，无网络请求
- **fo-utils.js**：挂载到 `window.FO`，无需 import/export
- **验证**：`python3 -m http.server 8000` 启动后逐页验证
