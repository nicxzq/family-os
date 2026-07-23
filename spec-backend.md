# spec-backend.md · Family OS 后端服务规划

> 状态：待 Carl 确认。确认后按「实施路线」分阶段指挥 codex 实现。
> 本文档只做规划，不含代码。字段/接口名用英文，说明用中文。

---

## 0. 一句话结论

把你那台**已备案域名的服务器**升级成**统一后端 API 网关**：对外是你的备案域名（满足小程序合法域名要求），对内接数据层（Postgres）。三种微信/短信登录都在服务器换成统一的自签 JWT，微信 AppSecret / LLM key / 数据库凭证全部只存在服务器端。在此之上新增「AI 课程」「孩子 AI 产品展示」两个内容模块，配一套「功能/内容上下架」和「游客/注册/付费」三级权限。

---

## 1. 现状盘点（已有的，不重造）

- **数据 + 认证**：Supabase（Postgres + Auth + RLS）。schema 已含 `profiles / invite_codes / diary_entries / activity_history / reading_progress / wechat_bindings(unionid) / contributions / summer_plan`。
- **微信/短信登录雏形**：`api/` 下 serverless（部署在 Vercel，域名 `family.carlxu.cn`）——公众号 openid 授权、开放平台 unionid 扫码、阿里云短信 OTP，均用 `SUPABASE_SERVICE_ROLE_KEY` 从服务端写 Supabase。
- **网站**：浏览器直连 Supabase（`fo-supabase.js`，anon key + RLS + Supabase Auth）。
- **小程序**：目前纯本地存储（`wx.getStorageSync`），**尚未联网**。

## 2. 核心约束（决定架构的 why）

1. **小程序合法域名 = ICP 备案 + HTTPS + 后台白名单**。`*.supabase.co` 无法备案，**小程序不能直连 Supabase**——必须打你自己的备案域名。这是把服务器升级成网关的根本原因。
2. **密钥不能进客户端**：微信 AppSecret、Supabase service_role、LLM key、支付私钥，只能待在服务器。
3. **数据跟用户走**：一个用户在小程序、网站、H5 看到的是同一份数据 → 需要**统一的用户主体**和**统一的 token**。
4. **一人公司省力**：能托管就不自己运维（数据库备份、证书续期等尽量自动化）。

## 3. 架构总览

```
                 ┌─────────────────────────────────────────────┐
  小程序 ─┐      │   你的服务器（备案域名 api.carlxu.cn, HTTPS）  │
  网站   ─┼─────▶│                                             │
  H5     ─┘      │   Caddy(自动证书) → Node API(Fastify+TS)     │
                 │     ├─ Auth: 三种登录 → 统一 JWT             │
                 │     ├─ 业务: 课程/产品/上下架/权限/订单        │
                 │     ├─ 代理: 微信 code2session、LLM、支付      │
                 │     └─ 定时任务/备份                          │
                 └───────────────┬─────────────────────────────┘
                                 │ 内网/连接串（service_role 或直连 PG）
                                 ▼
                    数据层 Postgres（Supabase 托管 或 服务器自建）
```

**请求流示例（小程序登录）**：小程序 `wx.login()` 拿 code → POST `https://api.carlxu.cn/auth/wechat/miniapp` → 服务器用 AppSecret 调 `code2session` 拿 openid/unionid → 查/建 `profiles` + `wechat_bindings` → 签发 **本项目自己的 JWT** 返回 → 之后小程序每个请求带 `Authorization: Bearer <jwt>`。

## 4. 需要你拍板的决策点

| # | 决策 | 我的推荐 | 理由 / 代价 |
|---|---|---|---|
| D1 | **数据层：保留 Supabase 托管 PG，还是服务器自建 PG** | **保留 Supabase 托管**，服务器用连接串直连 | 省掉自己装 PG、配备份、扛宕机。你已有 schema 和数据，零迁移。缺点：多一个外部依赖。若你想练全栈/彻底自主，可选自建（+1~2 天运维搭建，日后自己管备份）。 |
| D2 | **认证 token：自签 JWT 还是继续用 Supabase Auth 的 JWT** | **自签 JWT** | 小程序用不了 Supabase 客户端 SDK，扫码/短信/小程序三条线本来就在服务器汇聚，自己签发最统一、可控。网站过渡期可维持 Supabase Auth，长期收敛到自签。 |
| D3 | **部署：自有服务器长驻进程 还是继续 Vercel serverless** | **自有服务器（Docker + Caddy）** | 你有服务器；长驻进程适合扫码登录轮询、WebSocket、LLM 流式、定时备份，且无 serverless 超时/冷启动。Vercel 可保留只托管静态网站前端。 |
| D4 | **网站是否也改成走服务器 API** | **过渡期不动**（网站继续直连 Supabase），新功能（课程/产品/支付）走服务器 | 避免大重写；等稳定后再统一。 |

> 这四项里 D1 最关键。若你选「自建 PG」，spec 的数据层和实施路线会相应调整——告诉我即可。

## 5. 技术栈选型（含 why）

- **语言/框架**：Node + **TypeScript** + **Fastify**。理由：与前端同语言（你要做 AI 全栈），Fastify 性能好、schema 校验内建（利于「安全接口」）。
- **数据访问**：**Prisma**（类型安全 + 迁移工具，直接服务「数据维护」需求）。连 Supabase/自建 PG 都用同一套。
- **认证**：`jsonwebtoken` 自签 JWT（access 短期 + refresh 长期）。
- **反向代理/HTTPS**：**Caddy**（自动申请续期 Let's Encrypt 证书，省运维）。
- **进程/部署**：**Docker Compose**（api + caddy [+ postgres 若自建]）。
- **限流/安全**：`@fastify/rate-limit`、`@fastify/helmet`、`@fastify/cors`。
- **LLM 代理（P2）**：服务器持有 key，统一出口 + 用量计费。

## 6. 认证设计

统一用户主体 = `profiles.id`（沿用现有）。三种登录都归一到它：

1. **小程序**：`POST /auth/wechat/miniapp { code }` → `code2session` → openid+unionid → upsert `wechat_bindings` → 签 JWT。
2. **网站扫码**：沿用现有 open platform unionid 流程，回调改成签自签 JWT（而非 Supabase session）。
3. **短信 OTP**：`POST /auth/sms/send { phone }` + `POST /auth/sms/verify { phone, code }` → 签 JWT。手机号存 `profiles.phone`（新增列）。

**JWT 载荷**：`{ sub: profile_id, tier: 'guest|registered|paid', role, exp }`。access token 短期（如 2h）、refresh token 长期（如 30d，存 `refresh_tokens` 表可吊销）。同一用户多端共用同一 profile → 数据天然跟人走。

## 7. 数据模型（新增/改动，草案）

沿用现有表，新增：

```
-- 用户分层与联系方式
alter table profiles add column tier  text default 'registered'
      check (tier in ('guest','registered','paid'));
alter table profiles add column phone text unique;

-- refresh token（可吊销）
refresh_tokens(id, user_id, token_hash, expires_at, revoked_at, created_at)

-- 功能/内容上下架开关（后台可控）
feature_flags(key text pk, enabled bool, audience text     -- all|registered|paid
             , payload jsonb, updated_at)

-- AI 课程
courses(id, slug uniq, title, subtitle, cover, summary, body_md,
        price_cents int default 0, tier_required text default 'registered',
        status text default 'draft'    -- draft|published|archived（上下架）
        , sort int, created_at, updated_at)
course_sections(id, course_id fk, title, body_md, video_url, sort)
course_enrollments(user_id, course_id, source, created_at, primary key(user_id,course_id))

-- 孩子的 AI 产品展示
kid_products(id, slug uniq, title, author_profile_id fk, cover,
             summary, body_md, links jsonb,      -- 演示/仓库/视频链接
             tier_required text default 'registered',
             status text default 'draft', sort, created_at, updated_at)

-- 订单/支付（为 D=三级付费预留，P2 才真正接支付）
orders(id, user_id fk, item_type text, item_id text, amount_cents,
       status text default 'created'  -- created|paid|refunded|failed
       , provider text, provider_txn text, created_at, paid_at)
```

**权限落地**：读接口按 `tier_required` 和请求者 `tier` 过滤；`status != 'published'` 的内容只有管理员可见。RLS 仍可作为数据层兜底（网站直连那条线）。

## 8. 接口清单（REST，草案）

```
Auth
  POST /auth/wechat/miniapp        小程序 code 换 JWT
  GET  /auth/wechat/qr/start       网站扫码：拿二维码/轮询票据
  GET  /auth/wechat/qr/poll        轮询扫码结果 → JWT
  POST /auth/sms/send              发验证码
  POST /auth/sms/verify            验证码换 JWT
  POST /auth/refresh               refresh → 新 access
  POST /auth/logout                吊销 refresh

Me（需登录）
  GET  /me                         资料 + tier
  PATCH/me                         改昵称/头像
  GET  /me/data                    导出「数据跟人走」的聚合（进度/打卡/日记…）

Content（读：按 tier 过滤；写：管理员）
  GET  /courses                    已上架课程列表
  GET  /courses/:slug              课程详情（含 sections，付费墙按 tier）
  POST /courses/:slug/enroll       报名/解锁
  GET  /kid-products               已上架作品列表
  GET  /kid-products/:slug         作品详情
  GET  /feature-flags              前端拉取「哪些功能开着」

Admin（需 role=parent/admin）
  POST/PATCH /admin/courses...     课程增改、上下架（改 status）
  POST/PATCH /admin/kid-products...作品增改、上下架
  PATCH      /admin/feature-flags/:key  功能开关
  GET        /admin/users          用户/分层管理

Pay（P2）
  POST /orders                     下单
  POST /pay/notify/:provider       支付回调（验签）
```

## 9. 安全（接口安全清单）

- 全站 **HTTPS**，HSTS；备案域名 + 小程序后台配 request 合法域名白名单。
- **密钥仅服务端**：AppSecret / service_role / LLM key / 支付私钥走环境变量，永不下发前端。
- **JWT**：access 短期 + refresh 可吊销；关键接口校验 `tier/role`。
- **限流 + 防刷**：短信/登录接口按 IP+手机号限流；图形/滑块或微信侧风控兜底。
- **输入校验**：Fastify JSON schema 校验所有入参。
- **CORS**：只允许你自己的前端域名。
- **支付回调验签**、**幂等**（订单去重）。
- **CSRF**：扫码 state（现有 `_wechat-shared` 已有雏形，沿用）。
- **审计**：管理操作（上下架、改权限）记 `audit_log`。

## 10. 功能 / 内容上下架机制

两层，覆盖你说的「功能上下架」：

1. **内容级**：`courses/kid_products.status = draft|published|archived`。管理接口一改，前端列表即时生效（未上架不返回）。
2. **功能级**：`feature_flags` 表 + `GET /feature-flags`。前端（网站/小程序）启动时拉一次，决定某个入口/页签是否显示、对谁显示（`audience=all|registered|paid`）。上线新功能可先灰度对 `paid` 开，再放全量——无需发版。

## 11. 权限三级（游客 / 注册 / 付费）

- **游客**：只看标了免费/试玩的内容（沿用现有 gate 的免费首游思路）。
- **注册**：解锁「注册后可看全部」的免费内容（绘本、游戏、多数课程介绍、孩子作品）。
- **付费**：解锁 `tier_required='paid'` 的内容（未来的 AI 互动课程等）。
- 判定完全由服务器按 JWT.tier + 内容 tier_required 做，前端只负责展示与引导升级。

## 12. 数据维护 / 迁移 / 备份 / 后台

- **迁移**：Prisma migrate，版本化、可回滚，服务「数据维护」。
- **备份**：Supabase 托管自带每日备份（选 D1=保留时零成本）；自建 PG 则 cron `pg_dump` + 异地存储（写进部署脚本）。
- **管理后台**：P1 先用「受保护的 admin HTML 页」（走 Admin 接口，最小可用）；量大了再考虑独立后台。

## 13. 实施路线（分阶段，按此指挥 codex）

- **P0 · 地基（1）**：服务器 Docker+Caddy+Fastify 骨架跑通 HTTPS；接 Postgres（D1 决定）；健康检查；备案域名配进小程序白名单。→ 验收：`GET /health` 线上 200。
- **P1 · 认证统一（2）**：三种登录 → 自签 JWT；`/me`；refresh/logout；小程序接第一个真实接口。→ 验收：小程序能登录并读到自己的数据。
- **P2 · 内容与上下架（3）**：courses / kid_products / feature_flags 表 + 读接口 + admin 上下架 + 三级权限；网站与小程序展示课程和孩子作品。→ 验收：后台上下架，两端即时生效。
- **P3 · 付费与 AI（4）**：接支付（微信支付）→ 付费墙；课程内互动 AI（服务器代理 LLM + 用量计费）。→ 验收：付费解锁 + AI 对话跑通。

## 14. 对现有前端的改动

- **小程序**：新增 `request` 封装（带 JWT、指向备案域名）；登录页接 `wx.login`；课程/作品/我的接真实接口。（注意双前端：见项目约定，网站也要各改一遍。）
- **网站**：过渡期维持 Supabase 直连；新增课程/作品/付费页走服务器 API。
- **`api/` 现有 serverless**：迁到服务器 Fastify 路由（逻辑基本可平移），或过渡期并存。

## 15. codex 分工建议

后端是新目录（如 `server/`），文件多、逻辑重。codex 单次 ~60s 超时，按 P0→P3 的**子任务**逐个下发：一次一个路由模块 / 一张表的 migration / 一个登录流程。每步给明「输入、输出、验收命令（curl/单测）」。大文件与整体架构骨架由我起，codex 填充具体实现。

## 16. 待确认 / 开放问题

1. **D1 数据层**：保留 Supabase 托管 PG（推荐）还是服务器自建？
2. 服务器现状：系统、是否已有备案域名（`family.carlxu.cn` 是否已备案可直接给小程序用？）、能否跑 Docker？
3. 小程序是否已注册、有没有微信支付商户号（P3 需要）？
4. AI 课程首批内容谁产出（你写，还是我按大纲起草）？
5. 「孩子的 AI 产品」首批展示哪些、由谁维护？
