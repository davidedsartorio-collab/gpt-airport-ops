# Airport Ops Visual v12

V12 is a bigger milestone, not a tiny visual pass.

## Main changes
- Keeps the current simulation/reducer architecture clean.
- Continues the Pixi illustrated-map renderer direction.
- Switches the live map toward the runway-focused illustrated background.
- Adds stronger runway lights, taxi movement, multiple planes, and visible mission clock overlay.
- Adds a real win/fail loop:
  - the day ends after a fixed duration
  - structured objectives are evaluated by code
  - the result awards 0–3 stars
  - 2 stars unlock the next airport
  - progress is saved to localStorage
- Fail states still exist:
  - bankruptcy
  - reputation collapse

## New logic files
- `src/sim/objectives.js`
- `src/sim/campaign.js`

## Renderer direction
The final target is still: illustrated map + sprite layers + animation from state.
This version keeps moving toward that pipeline without touching the core sim model too much.

## Run
```bash
npm install
npm run dev
```
