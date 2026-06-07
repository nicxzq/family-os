# Game UI Standard

This repository's games should be playable from the first viewport. Do not put
the main play surface at the top and the controls below the fold when the game
depends on repeated adjustment.

## Core Layout

- Keep the primary game surface and primary controls visible together on desktop.
- Use a two-column workbench on desktop: play surface on the left, controls on
  the right.
- Keep status feedback close to the play surface and controls.
- Treat explanations as secondary. Put concept notes after the workbench or in a
  compact side panel only when they do not push controls out of view.
- Avoid tutorial text as the first screen. The first screen should be playable.

## Responsive Behavior

- Desktop and tablet landscape: use side-by-side play surface and controls.
- Phone and narrow tablet: keep the play surface and controls adjacent in the
  first viewport. Prefer play surface first, immediately followed by compact
  controls. Controls may move before the play surface only when the game is
  controlled entirely by sliders and the play surface remains visible without
  further scrolling.
- Size canvases with `aspect-ratio`, `max-height`, and `object-fit`-like layout
  constraints so the workbench fits in one viewport when practical.
- Use touch-friendly controls with stable heights. Sliders and buttons must not
  jump or resize during play.
- Never rely on hover-only interactions for core play.

## Implementation Rules

- Prefer shared game shells over one-off page layouts.
- Put visual rules in shared CSS and use design tokens from `styles.css`.
- JavaScript should provide behavior and game state, not hard-coded layout.
- New games should follow this order in the DOM or via CSS grid areas:
  navigation, title/status, play surface, controls, feedback, notes.
- Verify at least one desktop and one mobile viewport before considering a new
  interactive game done.
