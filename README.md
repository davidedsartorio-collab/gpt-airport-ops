# Airport Ops — Visual v2

Versione 2D del prototipo Airport Ops.

Questa versione sposta il gioco verso la direzione corretta: non una dashboard statica, ma una **live ops view** dove il giocatore vede passeggeri, code, gate e pista muoversi in tempo reale.

## Cosa cambia rispetto alla v1

- Codice separato in moduli:
  - `src/sim/` = motore simulazione
  - `src/render/` = rendering Canvas 2D
  - `src/ui/` = componenti UI
- Nuovo `TerminalCanvas` con:
  - terminale schematico 2D
  - omini/pax animati
  - coda security visiva
  - gate visualizzati
  - pista animata
  - highlight del bottleneck
- Nuovo pannello `Ops AI` per indicare il collo di bottiglia principale.

## Avvio

```bash
npm install
npm run dev
```

Apri l'URL indicato dal terminale, di solito:

```text
http://localhost:5173
```

## Struttura

```text
src/
  App.jsx
  main.jsx
  style.css
  sim/
    constants.js
    initialState.js
    reducer.js
    selectors.js
    tick.js
  render/
    TerminalCanvas.jsx
  ui/
    BottleneckPanel.jsx
    ChartPanel.jsx
    EventBanner.jsx
    GatePanel.jsx
    InvestmentPanel.jsx
    KpiPanel.jsx
    Panel.jsx
```

## Prossimo step consigliato

Dopo questa v2, la prossima milestone è trasformare i passeggeri da visualizzazione proporzionale a entità vere nel motore:

```js
{
  id,
  x,
  y,
  state,
  target,
  flightId,
  patience
}
```

Questo renderà il gameplay più ricco e permetterà pathfinding, priorità, business pax, fast track e aeroporti sbloccabili con layout diversi.
