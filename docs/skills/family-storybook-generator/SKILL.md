---
name: family-storybook-generator
description: Use when creating, rewriting, or repairing Family OS storybooks under storybooks/. Always trigger for requests mentioning 绘本, storybook, 毛毛, storybooks/*.html, page-turn buttons, speech bubbles, SVG character animation, or chapter-based child stories. It enforces the project's source-grounded story planning, theme matrix, UI invariants, and verification checklist.
---

# Family Storybook Generator

Use this skill for any Family OS storybook work. The repository standard is `storybooks/STORYBOOK_DESIGN.md`; read it before editing or generating a book.

## Workflow

1. Read `storybooks/STORYBOOK_DESIGN.md`.
2. Locate source material.
   - Prefer `uploads/` for Li Xiaolai source texts.
   - If `uploads/` or the requested chapter is missing, stop and report the missing source. Do not invent chapter details.
3. Choose exactly one source anchor for the book.
   - Use the theme matrix in `STORYBOOK_DESIGN.md`.
   - Keep 学习的真相, 专注的真相, 家教的真相, 教练的真相, 写作课, 读书是家事, and 时间是朋友 as distinct story angles.
4. Check existing `storybooks/*.html` titles and page text for overlap.
5. Draft the story as one concrete child-sized conflict, then implement 5-7 pages plus one end-card.
6. Preserve the technical invariants:
   - `#prev` stays on the left and `#next` stays on the right.
   - Positioned outer SVG groups use `transform="translate(cx,cy)"` only for placement.
   - Animations run on an inner `data-interaction-layer`, never directly on the positioned outer group.
   - Speech bubbles are positioned from the clicked element and clamped inside `.scene`.
7. Verify desktop and mobile rendering, page turns, keyboard arrows, swipe, TTS cancellation, speech bubbles, and click animations.

## Output Expectations

When editing files, keep changes scoped to the requested storybook and shared documentation needed for the task. In the final response, report:

- Which source anchor was used.
- Which files changed.
- Which verification checks were run.
- Any missing source material or remaining risk.
