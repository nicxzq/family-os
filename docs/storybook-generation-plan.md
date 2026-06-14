# Storybook generation plan

## Source copy

Copied `../carlxus/04_ARCHIVE/笑来知识/` into `uploads/` so new storybooks can be grounded in local source material.

## Existing theme check

Current storybooks already cover:

- `读书是家事`: `02-the-library.html`, `14-family-reading-day.html`, `16-family-reads.html`
- `专注的真相`: `03-ten-minutes.html`, `10-attention.html`
- `时间是朋友`: `04-the-mountain.html`, `08-patient-seeds.html`, `13-no-rush.html`, `15-no-hurry.html`
- `方向 比 目标 重要`: `06-the-direction.html`, `09-good-direction.html`
- `一起学，不教训`: `05-why-why.html`, `12-learn-together.html`
- `软技能 也是 学问`: `07-soft-skills.html`, `11-new-friend.html`

## New books

### 17. 毛毛的小小练习场

- File: `storybooks/17-practice-loop.html`
- Source anchor: `uploads/学习的真相.md`
- Grounded idea: learning is simple and useful; practice gradually builds useful ability, not just school scores.
- Child-sized conflict: Mao Mao wants to draw a star for Grandma, but the star keeps turning crooked. Dad helps her make a tiny practice loop: look, try, compare, try again.
- Distinct angle: not "read more books"; the story shows learning as a visible change in what Mao Mao can do.
- End phrase: "学会，就是多会做一点点。"

### 18. 爸爸的一个好问题

- File: `storybooks/18-good-coach.html`
- Source anchor: `uploads/教练的真相.md`
- Grounded idea: parents are the closest coaches; good coaching is loving, present, and helps the child find the next attempt.
- Child-sized conflict: Mao Mao's paper bridge keeps falling. Dad does not grab the paper or give an answer; he asks one useful question and helps Mao Mao design the next try.
- Distinct angle: not parent-as-answer-giver and not a lecture about education; the visible action is one better question producing one better attempt.
- End phrase: "好问题，会带你试下一步。"

## Verification checklist

- One source chapter anchors one storybook.
- Existing storybook overlap checked before writing.
- Each book has 6 story pages plus one end-card.
- `#prev` remains left and `#next` remains right.
- Positioned outer SVG groups use placement transforms; click animations target inner `data-interaction-layer`.
- Speech bubbles are generated from clicked elements and clamped inside the scene.
- Keyboard arrows, swipe, TTS, progress dots, and replay buttons are included.
