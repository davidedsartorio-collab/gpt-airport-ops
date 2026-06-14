# Airport Ops — Implementation Notes

## 1. Separazione simulazione/render

La simulazione deve restare indipendente da Pixi.

Simulazione:
- reducer;
- tick;
- state;
- selectors;
- objectives;
- campaign;
- airport templates.

Renderer:
- carica assets;
- anima sprite;
- mostra overlay;
- legge state e selectors;
- non contiene regole economiche profonde.

## 2. File importanti

```text
src/sim/tick.js
src/sim/reducer.js
src/sim/initialState.js
src/sim/selectors.js
src/sim/objectives.js
src/sim/campaign.js
src/render-pixi/AirportPixiScene.jsx
src/render-pixi/sceneLayout.js
src/screens/LiveOpsScreen.jsx
src/data/airportTemplates.js
```

## 3. Pixi renderer

`AirportPixiScene.jsx` deve:
- inizializzare Pixi Application;
- caricare la mappa base;
- creare layers:
  - background;
  - glow/effects;
  - planes;
  - vehicles;
  - bags;
  - NPC;
  - UI labels;
- aggiornare ogni frame in base a `stateRef.current`.

## 4. Layer consigliati

```text
backgroundLayer
moduleLayer
doorLayer
planeLayer
vehicleLayer
bagLayer
npcLayer
effectsLayer
uiLayer
```

## 5. sceneLayout.js

Questo file deve essere trattato come layout source-of-truth.

Contiene:
- `SCENE.width` / `SCENE.height`;
- asset paths;
- zones;
- paths;
- gates;
- colors.

Quando si cambia background map, aggiornare prima `sceneLayout.js`.

## 6. NPC behavior target

Ogni NPC dovrebbe avere:

```js
{
  id,
  type,
  state,
  path,
  progress,
  speed,
  patience,
  luggage,
  gate,
}
```

Per ora in v15 i passeggeri sono pool visuali guidati da load/queue. In futuro v18+ possono diventare entità più realistiche.

## 7. Mission loop

Già presente:
- day length;
- mission objectives;
- evaluation;
- stars;
- localStorage campaign unlock;
- mission result modal.

Da migliorare:
- mission chip integrata nella scena;
- feedback visivo stelle;
- reward più chiaro;
- missioni specifiche per aeroporto.

## 8. Events

Gli eventi devono avere due componenti:

```text
sim effect + visual overlay
```

Esempi:
- storm: meno runway capacity + rain overlay;
- fog: takeoff slower + fog overlay;
- peak hour: demand spike + more NPC;
- maintenance: lane/gate disabled + warning.

## 9. Debug tools da aggiungere

Utili per v16:
- show paths toggle;
- show zones toggle;
- show sprite bounds toggle;
- show gate coordinates;
- asset loading error panel.

## 10. QA prima di ogni zip

Prima di creare una nuova versione:
1. npm build ok;
2. controllare asset paths;
3. controllare assenza registry interni in package-lock;
4. aprire/screenshot quando possibile;
5. aggiornare docs se cambiano regole;
6. zip senza node_modules e dist.
