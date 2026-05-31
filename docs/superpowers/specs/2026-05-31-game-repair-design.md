# Game Repair Design

## Scope

Repair the timeline retry flow in History Detective, correct the History Detective
success message, redraw the Fibonacci spiral in Math Gallery, and register the
newer games in dashboard progress.

## History Detective Timeline

The timeline keeps a single ordered selection array. Clicking an unselected event
appends it to the order. Clicking a selected event removes it and recomputes all
visible sequence numbers.

Add a visible reset button below the events. Reset clears the selection array,
all selection and validation classes, all sequence numbers, all revealed years,
and the validation message.

When an incorrect order is submitted:

1. Temporarily lock event selection and both action buttons.
2. Reveal the event years and highlight incorrect positions for two seconds.
3. Clear the full timeline state and unlock the controls so the player starts a
   fresh attempt.

Correct submissions remain completed and locked. The success message uses a real
arrow character instead of HTML entity text.

## Fibonacci Spiral

Keep the existing Fibonacci square construction and educational description.
Draw one quarter-circle arc inside each square in square order. Each arc must
share an endpoint with the previous arc and turn in the same direction, forming
a continuous inward-to-outward spiral.

## Dashboard Progress

Dashboard progress must register every live game currently exposed by the game
library. Completion IDs must be consistent between each game and the library
registry. History Detective uses `g44-history-detective`; Words Cipher uses
`g46-words-cipher`.

## Verification

Verify timeline selection, deselection, reset, incorrect retry cleanup, correct
completion text, and the disabled completed state. Check Fibonacci arc endpoint
continuity mathematically and inspect the rendered canvas. Confirm dashboard
registration and completion IDs for the newer games.
