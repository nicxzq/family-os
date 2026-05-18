# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local Development

No build step required. Serve the root directory with any static server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Vercel's `cleanUrls: true` removes `.html` suffixes in production; locally you access files with the full name (e.g., `/for-wife.html`).

## Architecture

Pure static site — zero bundler, zero build. All pages are self-contained HTML files that load assets via CDN and reference `styles.css` from the root.

### Pages

| File | Route | Audience |
|---|---|---|
| `index.html` | `/` | Full homepage |
| `for-wife.html` | `/for-wife` | Quick overview for wife |
| `for-eldest.html` | `/for-eldest` | Interactive quiz for 12-year-old |
| `for-youngest.html` | `/for-youngest` | Storybook for 6-year-old |
| `for-family-friends.html` | `/for-family-friends` | Short stories for grandparents/friends |
| `slides.html` | `/slides` | 14-slide weekend presentation |
| `wall.html` | `/wall` | Chooser for printable wall posters |
| `wall-portrait.html`, `wall-landscape.html`, `wall-cards.html` | `/wall-*` | Three poster layout variants |
| `storybooks/` | `/storybooks/*` | Additional illustrated storybooks |

### Key Scripts

- **`deck-stage.js`** — Custom web component (`<deck-stage>`) powering `slides.html`. Handles keyboard nav (←/→/Space/Home/End), auto-scaling to 1920×1080, speaker notes, thumbnail rail, slide reordering, and print-to-PDF. Slides stay in the DOM with `visibility: hidden` (never unmounted).

- **`tweaks-panel.jsx`** — React component for live in-page editing, loaded via CDN Babel (`<script type="text/babel">`). Used in the wall poster pages. Exposes `useTweaks(defaults)` hook and a set of form controls (`TweakSlider`, `TweakRadio`, `TweakColor`, `TweakToggle`). State persists to `localStorage`. The editable JSON block is delimited by `/*EDITMODE-BEGIN*/` … `/*EDITMODE-END*/` comments so the host can locate and patch default values.

### Design System (`styles.css`)

All shared tokens and components live in `styles.css`. Each page links it with `<link rel="stylesheet" href="styles.css">` and may add page-specific overrides in a `<style>` block.

**Palette (do not introduce new colors):**
- Coral: `--coral: #E56B5A` / soft: `--coral-soft: #F4A799`
- Yellow: `--yellow: #F4C13E` / soft: `--yellow-soft: #FBE39A`
- Green: `--green: #6FA86D` / soft: `--green-soft: #B5D4A8`
- Blue: `--blue: #4B7BA8` / soft: `--blue-soft: #A8C2DE`
- Cream background: `--cream: #F8F2E2`
- Text: `--ink: #2B2419`, `--ink-soft: #5C4F3D`, `--ink-mute: #8C7C66`

**Font:** `"LXGW WenKai TC"` only — loaded from Google Fonts CDN. Do not introduce other typefaces.

**Layout conventions:** `.wrap` (max 1080px) / `.wrap-narrow` (max 720px); cards use `.idea`, `.person`, `.book` with `--shadow-card` and `--radius`/`--radius-lg`. Color accents on cards use `data-color="coral|yellow|green|blue"`.

### Content Source

All content is grounded in Li Xiaolai (李笑来) materials in `uploads/`. The six core principles are:

1. 方向 比 目标 重要
2. 读书 是 家事
3. 一起学，不教训
4. 软技能 也是 学问
5. 保护 彼此的 注意力
6. 不慌，时间是朋友

When adding or editing content, quotes and ideas must be faithful to the source texts in `uploads/`.

## Pages (extended)

| File | Route | Notes |
|---|---|---|
| `dashboard.html` | `/dashboard` | Reading progress panel + family overview |
| `piggy-bank.html` | `/piggy-bank` | Pocket money lab for eldest |
| `weekly-review.html` | `/weekly-review` | Printable weekly family review |
| `attention-budget.html` | `/attention-budget` | Attention tracker game for eldest |
| `games/index.html` | `/games` | Catalog of 10 interactive games for eldest |
| `games/g01-direction.html` … `g10-questions.html` | `/games/g0N-*` | Individual game pages |
| `login.html` | `/login` | Family member selector |

## Commit conventions

- **Language**: English only.
- **Format**: `type(scope): short imperative summary` — no trailing period, under 72 chars.
- **Types**: `feat` · `fix` · `docs` · `refactor` · `style`
- **Scope**: filename stem or feature area (e.g. `eldest`, `index`, `games`, `roadmap`).
- **Body**: bullet list of what changed; task-oriented, no filler.
- Commit after each meaningful milestone, not after every file edit.

## Deployment

Deployed to Vercel with no build command and no output directory. `vercel.json` configures `cleanUrls`, `trailingSlash: false`, and cache headers. To add a new page, create an `.html` file in the root; it becomes accessible at `/<name>` automatically.
