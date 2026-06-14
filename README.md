# Airport Ops — Visual v3

This version moves the prototype toward the final direction:

- 2D live terminal view
- stylized capsule passengers inspired by playful 2D social games, but original
- first campaign/world-map layer
- unlockable airport templates
- airport-specific tuning and themes
- separated simulation/render/UI structure

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL, usually:

```text
http://localhost:5173/
```

## New v3 files

```text
src/data/airportTemplates.js
src/screens/AirportSelectScreen.jsx
src/screens/LiveOpsScreen.jsx
src/render/TerminalCanvas.jsx
```

## What changed

- `App.jsx` now controls screen flow: Airport Select → Live Ops.
- `initialState()` now accepts an airport id and loads starting values from `airportTemplates.js`.
- `tick.js` now uses airport tuning for demand and event probabilities.
- `TerminalCanvas.jsx` now uses more playful 2D capsule passengers with simple visor/body shapes.
- `style.css` includes the campaign map, airport cards, and more game-like presentation.

## Next step

Make passengers real entities in the simulation engine instead of only a proportional visualization layer.
