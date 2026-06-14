# Airport Ops — Roadmap

## Stato attuale: v15

La v15 ha introdotto:
- base map production;
- asset reference;
- sprite NPC estratti;
- sprite aerei e veicoli estratti;
- renderer Pixi con texture reali;
- mission loop già presente;
- preview QA statica.

Il prossimo lavoro non è generare nuove idee, ma rendere il sistema più vivo, coerente e giocabile.

## v16 — Visual QA & alignment

Obiettivo: rendere la vista meno “asset sopra mappa” e più gioco vivo.

Task:
- verificare scala NPC/aerei sulla mappa;
- allineare percorsi NPC con corridoi reali;
- migliorare posizionamento gate/porte;
- ridurre elementi troppo grandi/piccoli;
- aggiungere debug overlay opzionale per path;
- migliorare HUD mobile;
- screenshot QA reale prima dello zip.

Deliverable:
- v16 zip;
- docs updated;
- screenshot QA nel repo.

## v17 — Door & gate states

Obiettivo: prime interazioni visive vere.

Task:
- entrance doors open/close;
- gate doors open/close;
- gate status visuale: free, boarding, ready, delayed;
- NPC che spariscono/entrano al gate;
- label gate più chiari;
- boarding flow più visibile.

## v18 — Queue system visual

Obiettivo: code leggibili.

Task:
- queue formation per check-in;
- queue formation per security;
- queue formation per gate;
- NPC rallentati in bottleneck;
- linee/rope dinamici;
- colore zona in base a congestione.

## v19 — Aircraft operations

Obiettivo: pista/apron con gameplay visivo.

Task:
- aereo at gate;
- pushback tug;
- taxi path;
- holding point;
- takeoff animation;
- delay state;
- runway bottleneck.

## v20 — Upgrade visuals

Obiettivo: l'aeroporto evolve visivamente.

Task:
- check-in lv1/lv2/lv3;
- security lv1/lv2/lv3;
- gate lv1/lv2/lv3;
- baggage/café/shop upgrades;
- tower/runway upgrades;
- visual feedback post-acquisto.

## v21 — Events as gameplay

Obiettivo: storm/fog/peak hour non solo decorativi.

Task:
- storm overlay + delay logic;
- fog overlay + runway slowdown;
- peak hour + demand spike;
- low staff event;
- maintenance event;
- event cards con scelta player.

## v22 — Mobile-first polish

Obiettivo: giocabile bene da smartphone.

Task:
- top HUD compatta;
- drawer gate/bottleneck;
- upgrade menu espandibile;
- task/shop/news buttons;
- responsive scene scaling;
- touch-friendly interactions.

## v23 — Campaign layer

Obiettivo: progressione più chiara.

Task:
- airport map progression;
- unlock airports;
- star objectives;
- airport modifiers;
- daily challenge;
- achievements.

## Priorità immediata

La priorità è v16:

```text
vedere bene la build
fare QA visivo
allineare asset e percorsi
non generare nuove scene
```
