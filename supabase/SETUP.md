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

---

## 八、手机号验证码登录（阿里云短信）

登录页的「验证码」标签用 Supabase 原生 phone auth（`signInWithOtp` / `verifyOtp`），
短信由 `api/sms-hook.js` 经阿里云 Dysmsapi 发出。前端已就绪，只需完成以下配置。

### 1. 阿里云侧准备

1. 开通[阿里云短信服务](https://dysms.console.aliyun.com/)
2. 申请**签名**（如「家庭OS」）并等待审核通过（通常数小时～1 天）
3. 申请**验证码模板**，内容形如 `验证码 ${code}，5 分钟内有效，请勿泄露。`
   —— 变量名必须是 `code`，记下模板 CODE（形如 `SMS_123456789`）
4. 在 RAM 里建一个只有短信发送权限的 AccessKey，记下 ID 和 Secret

### 2. Vercel 环境变量

在 Vercel 项目 → Settings → Environment Variables 添加：

| 变量 | 值 |
|---|---|
| `SMS_HOOK_KEY` | 自己生成的长随机串（如 `openssl rand -hex 24`） |
| `ALI_SMS_ACCESS_KEY_ID` | 阿里云 AccessKey ID |
| `ALI_SMS_ACCESS_KEY_SECRET` | 阿里云 AccessKey Secret |
| `ALI_SMS_SIGN_NAME` | 已审核的签名，如 `家庭OS` |
| `ALI_SMS_TEMPLATE_CODE` | 验证码模板 CODE，如 `SMS_123456789` |

改完重新部署（`git push`）。

### 3. Supabase 侧开启

1. **Authentication → Providers → Phone** → 打开 **Enable Phone provider**
2. 同页把 SMS provider 留空 / 忽略内置的 Twilio 等（下一步的 hook 会接管发送）
3. **Authentication → Hooks (Beta)** → **Send SMS hook** → 选 **HTTPS**
4. URL 填：`https://family.carlxu.cn/api/sms-hook?key=<和 SMS_HOOK_KEY 相同的串>`
5. 保存

> `?key=` 是来源校验：Supabase 的 HTTP hook 不能自定义请求头，
> 用 URL 里的密钥证明请求来自 Supabase。请勿把该 URL 泄露到前端或公开仓库。

### 4. 验证

1. 访问 `/login` → 点「🔗 登录同步数据」→ 切到「验证码」标签
2. 输入手机号 → 点「发送验证码」→ 收到短信
3. 填码 → 点「登录 / 注册」
4. 新号码会跳到资料设置页（起名、选身份/头像）；老号码直接进入

> **失败排查**：短信没到先看 Vercel 函数日志里的 `sms-hook error`。
> 常见原因：签名/模板未审核通过、AccessKey 无短信权限、模板变量名不是 `code`、
> 触发了阿里云同号码日发送上限。
