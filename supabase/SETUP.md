# Supabase 后端配置说明

Family OS 的云端同步功能（日记、历史、进度）基于 Supabase。
本地运行无需配置 — 未配置时所有数据仍存在 `localStorage`。

---

## 一、创建 Supabase 项目

1. 前往 <https://supabase.com> → **Start your project**
2. 创建一个新 Organization 和 Project（建议名称：`family-os`）
3. 选择离家人最近的 Region（例如 Northeast Asia）
4. 记下 **Database Password**（之后不再显示）

---

## 二、初始化数据库

1. 打开 Supabase 控制台 → **SQL Editor** → **New query**
2. 把 `supabase/schema.sql` 的全部内容粘贴进去，点 **Run**
3. 看到 `Success. No rows returned` 说明执行成功

初始化后会自动创建四张表、RLS 策略、触发器和四个默认邀请码：

| 码 | 用途 | 上限 |
|---|---|---|
| `FAMILY2026` | 家庭成员注册 | 100 次 |
| `FRIEND01` | 朋友邀请码 1 | 5 次 |
| `FRIEND02` | 朋友邀请码 2 | 5 次 |
| `FRIEND03` | 朋友邀请码 3 | 5 次 |

---

## 三、填入密钥

1. Supabase 控制台 → **Settings** → **API**
2. 复制 **Project URL** 和 **anon public** key
3. 打开 `fo-supabase.js`，替换顶部两行：

```javascript
const _SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';  // ← 替换
const _SUPABASE_KEY  = 'YOUR_ANON_KEY';                         // ← 替换
```

4. 保存后重新部署到 Vercel（`git push`）

> `anon` key 是公开安全的，可以放在前端代码里。
> 数据隔离通过 Row Level Security (RLS) 实现，不依赖 key 保密。

---

## 四、配置邮件验证（可选）

默认 Supabase 会在注册时发送确认邮件。在开发阶段可以关闭：

- **Authentication** → **Providers** → Email → 关闭 **Confirm email**

生产环境建议保持开启。

---

## 五、验证流程

### 家庭成员注册

1. 访问 `/login`
2. 点击 **🔗 登录同步数据**
3. 切换到「注册」标签
4. 填写邮箱、密码、邀请码 `FAMILY2026`
5. 选择角色（孩子 / 家长）
6. 点击「注册」→ 收到确认邮件 → 点击链接 → 再次登录

### 朋友注册

1. 家长登录后，在 Supabase 控制台的 `invite_codes` 表中创建新码（或使用 `FRIEND01~03`）
2. 把邀请码告诉朋友
3. 朋友用该码注册，角色选「朋友」

### 功能验证清单

- [ ] 登录后刷新页面 → 状态保持（Supabase session 自动恢复）
- [ ] 访问绘本页面 → 翻页时进度同步到 `reading_progress` 表
- [ ] 访问游戏页面 → 完成游戏时历史记录到 `activity_history` 表
- [ ] 访问 `/diary` → 写一篇日记 → 刷新页面 → 日记仍在
- [ ] 两台设备用同一账号登录 → 数据一致

---

## 六、添加自定义邀请码（家长操作）

家长登录后，可通过 Supabase 控制台的 **Table Editor → invite_codes** 手动插入新码：

| 字段 | 说明 |
|---|---|
| `code` | 邀请码文本（建议全大写，如 `WANG2026`） |
| `label` | 备注（如「王阿姨的邀请码」） |
| `max_uses` | 最多使用次数 |
| `expires_at` | 过期时间（可留空） |

---

## 七、数据表说明

| 表 | 内容 |
|---|---|
| `profiles` | 用户档案（姓名、头像、颜色、角色） |
| `invite_codes` | 邀请码及使用记录 |
| `diary_entries` | 日记（内容、心情、时间） |
| `activity_history` | 看绘本 / 玩游戏历史 |
| `reading_progress` | 绘本翻页进度 |
