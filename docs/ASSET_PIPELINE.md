# Airport Ops — Asset Pipeline

Questo documento spiega come usare immagini, sheet e sprite nel progetto senza perdere coerenza.

## 1. Regola centrale

Le immagini complete generate servono solo come base o reference. Gli elementi dinamici devono essere asset separati.

```text
base map = statica
NPC = separati
planes = separati
vehicles = separati
doors = stati separati
events = overlay separati
UI = React/CSS o texture dedicate
```

## 2. Cartelle asset

Struttura consigliata:

```text
public/assets/airport/terra01/
  maps/
    terminal-base-production.png
    apron-runway-production.png
  reference/
    npc-style-sheet.png
    planes-vehicles-sheet.png
    interaction-ui-sheet.png
  sprites/
    npc/
    planes/
    vehicles/
  modules/
    checkin/
    security/
    gates/
    baggage/
    shop/
    tower/
  overlays/
    weather/
    alerts/
    bottlenecks/
```

## 3. Come usare le reference sheet

Le sheet non vanno mostrate intere nel gioco. Devono essere usate per:
- tagliare asset singoli;
- ricreare sprite coerenti;
- definire stile e stati;
- controllare palette e proporzioni.

## 4. Sprite extraction

In v15 sono stati estratti:

```text
sprites/npc/*.png
sprites/planes/*.png
sprites/vehicles/*.png
```

Priorità per prossime estrazioni:
- door states;
- gate status;
- security busy/idle;
- baggage carousel active/empty;
- bottleneck icons;
- weather overlay tiles.

## 5. Standard file naming

NPC:

```text
standard-idle.png
standard-walk1.png
standard-walk2.png
standard-waiting.png
standard-luggage.png
business-idle.png
...
```

Planes:

```text
plane-blue.png
plane-pink.png
plane-teal.png
plane-orange.png
```

Vehicles:

```text
baggage-train.png
fuel-truck.png
pushback-tug.png
bus.png
service-van.png
catering-truck.png
```

Modules:

```text
checkin-lv1.png
checkin-lv2.png
checkin-lv3.png
security-lv1.png
security-lv2.png
security-lv3.png
gates-lv1.png
gates-lv2.png
gates-lv3.png
```

Doors:

```text
entrance-door-closed.png
entrance-door-opening.png
entrance-door-open.png
entrance-door-closing.png
gate-door-closed.png
gate-door-open.png
```

Overlays:

```text
storm-rain.png
lightning-flash.png
fog-layer.png
bottleneck-glow.png
delay-alert.png
peak-hour-marker.png
```

## 6. Implementation principles

Il renderer Pixi deve:
- caricare la base map come background;
- caricare sprite separati tramite Assets.load;
- usare pool di NPC invece di creare/distruggere continuamente;
- aggiornare texture/stato in base alla simulazione;
- applicare scale coerenti;
- mantenere percorsi mappati in sceneLayout.js.

## 7. Percorsi e coordinate

`src/render-pixi/sceneLayout.js` è la fonte per:
- dimensioni scena;
- coordinate zone;
- path NPC;
- gate positions;
- taxi path;
- overlay zones.

Quando cambia la mappa base, va aggiornato questo file.

## 8. Cosa evitare

Evitare:
- usare sheet intere come texture in game;
- generare una nuova mappa per ogni evento;
- cambiare prospettiva degli asset;
- mischiare stili diversi;
- mettere NPC nello sfondo;
- creare UI dentro le immagini se deve essere interattiva.

## 9. Target asset finali

Per una versione più rifinita servono:

```text
1 terminal base definitive
1 apron/runway base definitive
35+ NPC sprites
8+ plane sprites / states
6+ vehicles
12+ door/gate states
15+ upgrade modules
8+ event overlays
20+ UI icons/cards
```

Non vanno generati tutti uno per uno. Meglio sheet coerenti, poi estrazione pulita.
