# MEMORY — family-os
维护规则:学到就回写(不等提醒);凭据只记位置不记值;能从代码查到的别复制进来;以追加为主,旧条目保留并标日期。

## 架构决策
<!-- 格式:[日期] 决定了什么 — 为什么 / 否决了什么 -->
- [2026-06-22] 每日提交审查在隔离 worktree 中运行 — 避免自动修复污染主工作目录；仅对可证实问题修复、验证并创建 PR。
- [2026-06-23] 站点保持纯静态 HTML/CSS/JS,不引入构建步骤 — 线上直接由 Vercel 以 clean URLs 暴露页面;本地开发只需静态服务器
- [2026-06-23] 共享视觉 token 统一放在 `styles.css` — 页面可加局部样式,但不得在 HTML/JS 中硬编码 UI 数值
- [2026-06-23] 交互游戏默认遵守 `docs/GAME_UI_STANDARD.md` — 核心玩法与主控件需在首屏相邻,避免桌面端/移动端来回滚动

## 踩坑 / Gotchas
- 本地访问通常需要带 `.html` 后缀,因为只有线上 Vercel 配了 `cleanUrls: true`
- 修改 UI 后必须跑 `ui-tokenize` 检查,changed files 里不能留下硬编码视觉值
- `storybooks/` 下的文件改动前要先读 `storybooks/STORYBOOK_DESIGN.md`,并保持 `#prev` 左 / `#next` 右与 `data-interaction-layer` 动画约束
- `readers/index.html` 和 `storybooks/CONTENT_MAP.md` 里的 slug 可能和真实文件漂移; 新增或补登记读本时要先用文件系统核对目标文件是否存在
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
