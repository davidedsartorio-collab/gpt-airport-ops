# Airport Ops — Project Memory

Questo documento raccoglie le informazioni operative emerse nella chat e serve come memoria interna del progetto. Deve essere letto prima di fare nuove versioni.

## 1. Identità del progetto

**Nome di lavoro:** Airport Ops / gpt-airport-ops  
**Repo GitHub:** `https://github.com/davidedsartorio-collab/gpt-airport-ops`  
**Cartella locale Mac:** `~/Desktop/"GPT Game"/airport-ops-claude-vite`

Airport Ops è un gioco gestionale/operativo aeroportuale. Non deve essere una semplice dashboard e non deve essere un tycoon decorativo. Il cuore è l'ottimizzazione operativa:

```text
voli → domanda passeggeri → flussi nel terminale → colli di bottiglia → allocazione risorse → KPI → ricavi/reputazione → upgrade → domanda più alta
```

Il giocatore deve capire cosa sta succedendo guardando la scena, non solo leggendo pannelli numerici.

## 2. Visione di gameplay

Il gioco deve funzionare come una piccola macchina aeroportuale viva.

Loop principale:
1. Arrivano voli e passeggeri.
2. I passeggeri entrano nel terminale.
3. Passano da check-in, security, waiting area, gate, baggage, arrivals.
4. Le aree hanno capacità limitata.
5. Se una zona satura, aumenta l'attesa.
6. L'attesa riduce reputazione e puntualità.
7. Il player investe in upgrade.
8. Gli upgrade migliorano capacità e throughput.
9. A fine giornata vengono valutati obiettivi e stelle.
10. Le stelle sbloccano aeroporti successivi.

Ispirazioni concettuali:
- Factorio: sistema operativo e throughput.
- Mini Metro: flussi leggibili e colli di bottiglia.
- Airport Tycoon: tema e progressione.
- Plague Inc map/progression: mappe/missioni sbloccabili.

## 3. Decisione visiva fondamentale

La direzione definitiva è:

```text
mappa cartoon top-down / 3-4 dall'alto
+ asset dinamici separati
+ Pixi renderer
+ UI mobile-first integrata
```

Non bisogna più generare nuove scene complete casuali. Serve una vista canonica stabile.

## 4. Regole visive fissate

### Regola 1 — Una sola mappa canonica
La vista operativa principale deve usare sempre la stessa base map. Eventi e upgrade non devono rigenerare l'intero mondo.

### Regola 2 — Nessun NPC nello sfondo
Le persone devono essere generate dal gioco. Lo sfondo deve contenere solo architettura, props fissi, stanze e segnaletica.

### Regola 3 — Elementi dinamici come layer
Devono essere separati:
- NPC;
- aerei;
- veicoli;
- valigie;
- porte;
- gate states;
- overlay meteo;
- bottleneck glow;
- alert;
- UI.

### Regola 4 — Upgrade come moduli
Gli upgrade modificano un modulo specifico, non tutta la scena.

### Regola 5 — Eventi come overlay
Storm, fog e peak hour sono layer sopra la stessa mappa, non mappe alternative complete.

## 5. Layout canonico della mappa

La disposizione da mantenere:

- alto sinistra: departures;
- sinistra centro: check-in;
- sinistra basso: bag drop;
- centro alto: security;
- centro: waiting area / main lounge;
- destra alto: boarding gates;
- destra centro: baggage claim;
- destra basso: café/shop;
- basso centro: entrance/arrivals;
- destra esterna: apron, taxiway, aerei e mezzi.

## 6. Stile grafico canonico

Stile scelto dopo le generazioni:

- cartoon management game;
- pavimento viola/blu;
- muri blu/viola con outline scura;
- insegne gialle e blu;
- props chiari e leggibili;
- atmosfera tipo gioco mobile premium;
- personaggi crew-like con corpo tondeggiante e visore azzurro;
- outline scura e shading coerente;
- camera top-down / 3-4 dall'alto.

Lo stile precedente più realistico/planimetrico non è quello finale. La reference corretta è la scena cartoon tipo “Skeld Airport”, adattata al nostro gioco.

## 7. Asset attuali in v15

La v15 contiene già:

```text
public/assets/airport/terra01/maps/terminal-base-production.png
public/assets/airport/terra01/maps/apron-runway-production.png
public/assets/airport/terra01/reference/npc-style-sheet.png
public/assets/airport/terra01/reference/planes-vehicles-sheet.png
public/assets/airport/terra01/reference/interaction-ui-sheet.png
public/assets/airport/terra01/sprites/npc/*.png
public/assets/airport/terra01/sprites/planes/*.png
public/assets/airport/terra01/sprites/vehicles/*.png
```

Sono stati estratti NPC, aerei e veicoli dalle reference sheet. La build usa Pixi per posizionarli sopra la mappa.

## 8. Stato tecnico attuale

Stack:
- React + Vite;
- PixiJS per rendering della live view;
- simulazione separata dal renderer;
- mission loop con stelle e localStorage;
- asset in `public/assets/airport/terra01/`.

Struttura importante:

```text
src/sim/                  simulazione e reducer
src/render-pixi/          renderer Pixi
src/render/TerminalCanvas.jsx
src/screens/LiveOpsScreen.jsx
src/screens/AirportSelectScreen.jsx
src/data/airportTemplates.js
public/assets/airport/terra01/
docs/
```

## 9. Come installare localmente

```bash
cd ~/Downloads
rm -rf airport-ops-visual-vXX
unzip -o airport-ops-visual-vXX.zip
rsync -av airport-ops-visual-vXX/ ~/Desktop/"GPT Game"/airport-ops-claude-vite/

cd ~/Desktop/"GPT Game"/airport-ops-claude-vite
npm install --no-audit --no-fund
npm run dev
```

Aprire:

```text
http://localhost:5173/
```

Per live view diretta:

```text
http://localhost:5173/?autostart=1
```

## 10. Problema npm già incontrato

Se `package-lock.json` punta a registry interni OpenAI, npm fallisce con errori tipo:

```text
packages.applied-caas-gateway1.internal.api.openai.org
```

Soluzione:

```bash
cd ~/Desktop/"GPT Game"/airport-ops-claude-vite
rm -rf node_modules package-lock.json
npm config set registry https://registry.npmjs.org/
npm install --no-audit --no-fund --registry=https://registry.npmjs.org/
npm run dev
```

Da v13 in poi è stata aggiunta `.npmrc` con registry pubblico.

## 11. Come pushare

Devi essere nella cartella Git, non in Downloads.

```bash
cd ~/Desktop/"GPT Game"/airport-ops-claude-vite
git status
git add .
git commit -m "Use extracted production sprites for live ops"
git push
```

Se serve il branch:

```bash
git branch --show-current
git push origin main
```

## 12. Version history sintetica

- v2: refactor sim/render, canvas 2D.
- v3: airport selection, mission templates.
- v3.1: deterministic RNG, balance harness.
- v4/v5: prime prove grafiche canvas.
- v6: UI compatta e mission modal.
- v7: diorama canvas.
- v8/v9: art helper e asset canvas.
- v10: CSS/sprite DOM scene, ma qualità ancora insufficiente.
- v11: primo Pixi renderer con mappa illustrata.
- v12: mission win/fail loop, stelle, unlock, pista più forte.
- v13: clean map foundation, HUD in-map, package lock pubblico.
- v14: production art foundation con mappa canonica e reference sheet.
- v15: QA/polish, sprite estratti e usati nel renderer.

## 13. Principio per le prossime versioni

Non generare più “belle immagini sparse”.

Ogni versione futura deve migliorare una di queste cose:
- integrazione asset;
- movimento NPC;
- stati porte/gate;
- code reali;
- upgrade visivi;
- eventi overlay;
- gameplay readability;
- mobile-first UI.
