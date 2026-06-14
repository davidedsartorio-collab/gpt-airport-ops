# Airport Ops — Visual Bible v2

Questa è la guida artistica ufficiale del progetto. Serve a mantenere coerenza tra mappa, NPC, aerei, UI, upgrade ed eventi.

## 1. Obiettivo visivo

Airport Ops deve sembrare un gioco gestionale aeroportuale cartoon, vivo e leggibile.

La scena deve comunicare:
- traffico passeggeri;
- code;
- colli di bottiglia;
- aerei in movimento;
- upgrade dell'aeroporto;
- eventi operativi;
- successo/fallimento missione.

Non deve sembrare:
- una dashboard statica;
- una planimetria tecnica;
- una foto di sfondo con sprite appiccicati;
- una scena diversa a ogni generazione.

## 2. Stile base

Stile visivo:
- cartoon 2D top-down / 3-4 dall'alto;
- colori saturi ma controllati;
- pavimento viola/blu;
- outline scure;
- luci gialle/blu;
- UI blu navy con accenti gialli/verdi/rossi;
- oggetti leggibili anche piccoli;
- ambiente “mobile game premium”.

## 3. Camera e proporzioni

Camera fissa:
- 16:9;
- top-down / 3-4 dall'alto;
- terminale come protagonista;
- apron/pista visibili ma non dominanti;
- proporzioni costanti tra NPC, banchi, porte, aerei.

La camera non deve cambiare tra upgrade o eventi.

## 4. Mappa canonica

La base map deve essere una singola immagine senza elementi dinamici.

Contiene:
- muri;
- pavimenti;
- stanze;
- signage;
- banchi;
- sedie;
- scanner;
- belt bagagli;
- café/shop;
- gate;
- porta entrata;
- props fissi.

Non contiene:
- passeggeri;
- staff;
- code;
- aerei operativi;
- veicoli dinamici;
- alert;
- meteo;
- UI finale;
- mission cards.

## 5. Layout fisso

- Departures: alto sinistra.
- Check-in: sinistra centro.
- Bag drop: sinistra basso.
- Security: centro alto.
- Waiting area: centro.
- Gates: destra alto.
- Baggage claim: destra centro.
- Café/shop: destra basso.
- Entrance/arrivals: basso centro.
- Apron/taxiway: destra esterna.

## 6. NPC

Tutti gli NPC sono sprite separati.

Stile:
- corpo tondeggiante;
- visore azzurro;
- outline scura;
- scala coerente;
- animazioni semplici;
- stessa famiglia grafica per tutti.

Tipologie:
- standard passenger;
- business traveler;
- budget/low-cost traveler;
- family traveler;
- VIP traveler;
- security officer;
- check-in staff;
- ground crew;
- baggage staff.

Stati minimi:
- idle;
- walk1;
- walk2;
- waiting;
- luggage.

## 7. Percorsi NPC

Percorsi principali:
1. Entrance → Check-in.
2. Check-in → Security.
3. Security queue → scanner.
4. Security → Waiting area.
5. Waiting area → Gate.
6. Gate → Boarding door.
7. Arrivals → Baggage claim.
8. Baggage claim → Exit.

Regola: gli NPC devono muoversi realisticamente sui percorsi, non vagare a caso.

## 8. Aerei e veicoli

Aerei e veicoli sono sprite separati.

Aerei:
- plane-blue;
- plane-pink;
- plane-teal;
- plane-orange.

Stati aereo:
- scheduled;
- at gate;
- boarding;
- pushback;
- taxi;
- takeoff;
- delayed;
- departed.

Veicoli:
- baggage train;
- fuel truck;
- pushback tug;
- bus;
- service van;
- catering truck.

## 9. Porte e gate dinamici

Le porte sono stati dello stesso asset.

Stati:
- closed;
- opening;
- open;
- closing.

Applicazioni:
- entrance door;
- gate door;
- interior passage;
- security lane.

Logica visiva:
- NPC vicino → entrance opens;
- boarding active → gate opens;
- idle gate → gate closed;
- delayed gate → warning state.

## 10. Upgrade visuali

Upgrade non cambiano la mappa intera. Cambiano moduli.

Check-in:
- lv1: pochi desk;
- lv2: più desk;
- lv3: self bag drop e boards.

Security:
- lv1: poche lane;
- lv2: lane extra;
- lv3: fast track.

Gates:
- lv1: pochi gate attivi;
- lv2: più gate;
- lv3: boarding rapido e monitor migliori.

Baggage:
- lv1: carousel base;
- lv2: carousel attivo;
- lv3: maggiore capacità.

Café/shop:
- lv1: café base;
- lv2: café ampliato;
- lv3: café + shop/duty free.

Tower/runway:
- lv1: torre base;
- lv2: luci e supporto;
- lv3: radar e taxiway più efficiente.

## 11. Eventi

Gli eventi sono overlay.

Storm:
- rain streaks;
- lightning flash;
- wet floor reflections;
- red storm alert;
- delays likely.

Fog:
- grey fog layer;
- low visibility badge;
- runway lights stronger;
- slowed operations.

Peak hour:
- più NPC;
- più bagagli;
- code più lunghe;
- più aerei/mezzi.

Bottleneck:
- glow sulla zona critica;
- NPC rallentati;
- alert panel;
- suggerimento upgrade.

## 12. UI mobile-first

Sempre visibile:
- cassa;
- reputazione;
- passeggeri;
- puntualità;
- tempo/giorno;
- missione compatta.

Espandibile:
- gate panel;
- bottleneck panel;
- upgrade panel;
- tasks;
- shop;
- news/events.

Layout:
- top bar compatta;
- scena grande;
- side buttons a sinistra;
- drawer a destra;
- mission chip/card;
- upgrade button accessibile.

## 13. Frase guida

Una piccola macchina aeroportuale viva, coerente e controllabile.

Non tante immagini belle. Un mondo stabile che evolve.
