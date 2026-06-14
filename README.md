# Airport Ops Visual v15

V15 is a QA/polish pass after v14. It keeps the same canonical production map, but moves further toward a real asset pipeline.

## What changed from v14

- Extracted individual NPC sprites from the generated NPC reference sheet.
- Extracted plane and service-vehicle sprites from the generated plane/vehicle sheet.
- Pixi renderer now uses the extracted sprites instead of only vector placeholders.
- NPCs swap between walk/wait/luggage textures while moving through the sim paths.
- Plane and service vehicle visuals are more aligned with the generated art direction.
- Added `?autostart=1` dev shortcut for direct live-map QA.
- Kept the same fixed canonical terminal base: no new scene reinterpretation.
- Build tested successfully.

## Run

```bash
npm install --no-audit --no-fund
npm run dev
```

Open:

```text
http://localhost:5173/
```

For direct live-view QA:

```text
http://localhost:5173/?autostart=1
```

## Notes

This is still not final production polish. The important improvement is pipeline quality: the map stays fixed, while people, planes, vehicles, doors and overlays are separate dynamic layers.
