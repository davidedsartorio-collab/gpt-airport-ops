import React, { useReducer, useEffect } from "react";
import {
  Plane, Users, ShieldCheck, Clock, Gauge, TrendingUp,
  AlertTriangle, Pause, Play, Coins, Star, Plus, CloudRain, Zap, Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

/* ------------------------------------------------------------------ */
/*  AIRPORT OPS — core operations loop prototype                       */
/*  La logica di simulazione è pura e tick-based (1 tick = 1 minuto).  */
/*  Tutti i numeri qui sotto sono tarabili: è la "balance sheet" del   */
/*  gioco. Separa questo motore dal rendering quando lo porti fuori.   */
/* ------------------------------------------------------------------ */

const SECURITY_RATE = 4;     // pax processati per corsia, per tick
const BOARD_RATE     = 14;   // pax imbarcati per volo, per tick
const REVENUE_PAX    = 12;   // € incassati per passeggero partito

const COST_LANE = 9000,  UPKEEP_LANE = 14;
const COST_GATE = 14000, UPKEEP_GATE = 10;
const COST_RUNWAY = 22000, UPKEEP_RUNWAY = 22; // costo = base * livello attuale

const WAIT_THRESHOLD = 14;   // minuti di attesa security oltre cui la reputazione cala
const GATE_WAIT_LIMIT = 9;   // tick che un volo aspetta un gate prima del malus
const ON_TIME_LIMIT  = 26;   // tick totali per essere "in orario"

const MAX_LANES = 8, MAX_GATES = 8, MAX_RUNWAY = 4;
const BASE_MS = 650;         // durata reale di un tick a velocità ×1

const AIRLINES = ["AZ", "FR", "LH", "BA", "EK", "U2", "VY", "KL", "EW", "TP"];

const C = {
  bg: "#0e1318", bg2: "#131a21", panel: "#19222b", panelHi: "#1f2a34",
  line: "#28333d", line2: "#374350",
  text: "#e9eef3", dim: "#8a98a5", dim2: "#5d6b76",
  amber: "#f6a623", amberHi: "#ffc463", teal: "#3fc0c8",
  green: "#5ec26a", red: "#e25c5c", runway: "#e8c84a",
};
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

function initialState() {
  return {
    running: true, speed: 1, gameOver: false,
    minute: 360, money: 60000, reputation: 85,
    lanes: 3, gates: 3, runwayLevel: 1,
    securityQueue: 0, clearedPool: 0,
    flights: [], nextSpawnIn: 4, flightSeq: 1,
    departedPax: 0, departedFlights: 0, onTimeFlights: 0,
    history: [], thruWindow: [],
    event: null, eventCooldown: 45,
    lastDeparted: null, estWait: 0, throughput: 0, occCount: 0,
  };
}

function tick(s) {
  if (s.gameOver) return s;
  let {
    minute, money, reputation, lanes, gates, runwayLevel,
    securityQueue, clearedPool, flights, nextSpawnIn, flightSeq,
    departedPax, departedFlights, onTimeFlights, history, thruWindow,
    event, eventCooldown,
  } = s;

  minute += 1;

  // --- eventi dinamici -------------------------------------------------
  if (event) {
    event = { ...event, ticksLeft: event.ticksLeft - 1 };
    if (event.ticksLeft <= 0) { event = null; eventCooldown = 40 + Math.floor(Math.random() * 30); }
  } else {
    eventCooldown -= 1;
    if (eventCooldown <= 0) {
      event = Math.random() < 0.5
        ? { type: "rush",    label: "Ora di punta — ondata di voli in arrivo", ticksLeft: 12 }
        : { type: "weather", label: "Maltempo — capacità pista ridotta",        ticksLeft: 15 };
    }
  }

  // --- domanda (cresce nel tempo) -------------------------------------
  const hours = Math.max(0, Math.floor((minute - 360) / 60));
  let baseInterval = Math.max(5, 11 - hours);
  if (event?.type === "rush") baseInterval = Math.max(3, Math.ceil(baseInterval / 2));
  const paxMin = 50 + hours * 6;
  const paxMax = 120 + hours * 10;

  // --- spawn voli ------------------------------------------------------
  flights = flights.map(f => ({ ...f }));
  nextSpawnIn -= 1;
  if (nextSpawnIn <= 0) {
    const pax = paxMin + Math.floor(Math.random() * (paxMax - paxMin + 1));
    const code = AIRLINES[Math.floor(Math.random() * AIRLINES.length)] + (100 + Math.floor(Math.random() * 899));
    flights.push({ id: flightSeq, code, pax, boarded: 0, status: "wait", gate: null, age: 0 });
    flightSeq += 1;
    securityQueue += pax;                      // i passeggeri arrivano in terminal
    nextSpawnIn = baseInterval + Math.floor(Math.random() * 3);
  }

  // --- assegnazione gate ----------------------------------------------
  const occupied = new Set(flights.filter(f => f.gate != null).map(f => f.gate));
  for (let g = 0; g < gates; g++) {
    if (occupied.has(g)) continue;
    const waiting = flights.find(f => f.status === "wait" && f.gate == null);
    if (!waiting) break;
    waiting.status = "board"; waiting.gate = g; occupied.add(g);
  }

  // --- security (il collo di bottiglia principale) --------------------
  const secThroughput = lanes * SECURITY_RATE;
  const moved = Math.min(securityQueue, secThroughput);
  securityQueue -= moved; clearedPool += moved;

  // --- imbarco (pool condiviso distribuito sui voli a gate) -----------
  for (const f of flights) {
    if (f.status === "board" && clearedPool > 0) {
      const take = Math.min(f.pax - f.boarded, BOARD_RATE, clearedPool);
      f.boarded += take; clearedPool -= take;
      if (f.boarded >= f.pax) f.status = "ready";
    }
  }

  // --- partenze (limitate dagli slot pista) ---------------------------
  let slots = event?.type === "weather" ? Math.ceil(runwayLevel / 2) : runwayLevel;
  let lastDeparted = s.lastDeparted;
  for (const f of flights) {
    if (slots <= 0) break;
    if (f.status === "ready") {
      f.status = "gone"; slots -= 1;
      departedPax += f.pax; departedFlights += 1;
      money += f.pax * REVENUE_PAX;
      if (f.age <= ON_TIME_LIMIT) { onTimeFlights += 1; reputation = Math.min(100, reputation + 0.3); }
      thruWindow = thruWindow.concat([{ minute, pax: f.pax }]);
      lastDeparted = f.code;
    }
  }
  flights = flights.filter(f => f.status !== "gone");

  // --- reputazione -----------------------------------------------------
  const estWait = securityQueue / Math.max(1, secThroughput);
  if (estWait > WAIT_THRESHOLD) reputation -= 0.45;
  for (const f of flights) if (f.status === "wait" && f.age > GATE_WAIT_LIMIT) reputation -= 0.15;
  reputation = Math.max(0, Math.min(100, reputation));

  for (const f of flights) f.age += 1;

  // --- economia --------------------------------------------------------
  money -= lanes * UPKEEP_LANE + gates * UPKEEP_GATE + runwayLevel * UPKEEP_RUNWAY;

  // --- KPI rolling -----------------------------------------------------
  thruWindow = thruWindow.filter(e => e.minute > minute - 60);
  const throughput = thruWindow.reduce((a, e) => a + e.pax, 0);  // pax/ora
  const occCount = flights.filter(f => f.gate != null).length;

  history = history.concat([{ t: minute, thru: throughput, queue: securityQueue }]);
  if (history.length > 90) history = history.slice(history.length - 90);

  let gameOver = false, running = s.running;
  if (reputation <= 0 || money < 0) { gameOver = true; running = false; }

  return {
    ...s, minute, money, reputation, lanes, gates, runwayLevel,
    securityQueue, clearedPool, flights, nextSpawnIn, flightSeq,
    departedPax, departedFlights, onTimeFlights, history, thruWindow,
    event, eventCooldown, gameOver, running,
    lastDeparted, estWait, throughput, occCount,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "TICK": return tick(state);
    case "TOGGLE_PAUSE": return { ...state, running: !state.running };
    case "SET_SPEED": return { ...state, speed: action.speed, running: true };
    case "BUY_LANE":
      if (state.money < COST_LANE || state.lanes >= MAX_LANES) return state;
      return { ...state, money: state.money - COST_LANE, lanes: state.lanes + 1 };
    case "BUY_GATE":
      if (state.money < COST_GATE || state.gates >= MAX_GATES) return state;
      return { ...state, money: state.money - COST_GATE, gates: state.gates + 1 };
    case "UPGRADE_RUNWAY": {
      const cost = COST_RUNWAY * state.runwayLevel;
      if (state.money < cost || state.runwayLevel >= MAX_RUNWAY) return state;
      return { ...state, money: state.money - cost, runwayLevel: state.runwayLevel + 1 };
    }
    case "RESET": return initialState();
    default: return state;
  }
}

/* ------------------------------- UI -------------------------------- */

const clock = (m) => {
  const t = ((m % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};
const eur = (n) => "€" + Math.round(n).toLocaleString("it-IT");

function Readout({ icon, label, value, sub, accent }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.dim, fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: SANS }}>
        {icon}{label}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600, color: accent || C.text, lineHeight: 1.15, marginTop: 3 }}>{value}</div>
      {sub && <div style={{ fontFamily: MONO, fontSize: 11, color: C.dim2, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function InvestButton({ icon, label, count, max, cost, upkeep, disabled, onClick }) {
  const maxed = count >= max;
  const off = disabled || maxed;
  return (
    <button onClick={onClick} disabled={off}
      style={{
        textAlign: "left", background: off ? C.bg2 : C.panelHi, border: `1px solid ${off ? C.line : C.line2}`,
        borderRadius: 10, padding: "10px 12px", cursor: off ? "not-allowed" : "pointer",
        opacity: off ? 0.55 : 1, transition: "all .12s", color: C.text, fontFamily: SANS, width: "100%",
      }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600 }}>{icon}{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: C.amber }}>×{count}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontFamily: MONO, fontSize: 11, color: C.dim }}>
        <span>{maxed ? "max" : eur(cost)}</span>
        <span style={{ color: C.dim2 }}>−{eur(upkeep)}/min</span>
      </div>
    </button>
  );
}

function GateCell({ flight }) {
  if (!flight) {
    return (
      <div style={{ border: `1px dashed ${C.line2}`, borderRadius: 8, padding: "8px 10px", background: C.bg2, minHeight: 58, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.dim2, letterSpacing: 1 }}>LIBERO</span>
      </div>
    );
  }
  const ready = flight.status === "ready";
  const pct = Math.round((flight.boarded / flight.pax) * 100);
  return (
    <div style={{ border: `1px solid ${ready ? C.green : C.line2}`, borderRadius: 8, padding: "8px 10px", background: C.panelHi, minHeight: 58 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.text }}>{flight.code}</span>
        <Plane size={13} color={ready ? C.green : C.amber} style={{ transform: "rotate(45deg)" }} />
      </div>
      <div style={{ marginTop: 6, height: 5, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: ready ? C.green : C.amber, transition: "width .2s" }} />
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: C.dim, marginTop: 3 }}>
        {ready ? "IN PARTENZA" : `imbarco ${flight.boarded}/${flight.pax}`}
      </div>
    </div>
  );
}

export default function AirportOps() {
  const [s, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    if (!s.running || s.gameOver) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), BASE_MS / s.speed);
    return () => clearInterval(id);
  }, [s.running, s.speed, s.gameOver]);

  const onTimePct = s.departedFlights ? Math.round((s.onTimeFlights / s.departedFlights) * 100) : 100;
  const gateUtil = s.gates ? Math.round((s.occCount / s.gates) * 100) : 0;
  const waiting = s.flights.filter(f => f.status === "wait" && f.gate == null);
  const repColor = s.reputation > 60 ? C.green : s.reputation > 30 ? C.amber : C.red;
  const waitColor = s.estWait > WAIT_THRESHOLD ? C.red : s.estWait > WAIT_THRESHOLD * 0.6 ? C.amber : C.green;
  const queueSeverity = Math.min(1, s.securityQueue / 500);
  const queueColor = queueSeverity > 0.66 ? C.red : queueSeverity > 0.33 ? C.amber : C.teal;
  const upkeepTotal = s.lanes * UPKEEP_LANE + s.gates * UPKEEP_GATE + s.runwayLevel * UPKEEP_RUNWAY;
  const score = s.departedPax + s.onTimeFlights * 50;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: SANS, padding: 14 }}>
      <style>{`
        @keyframes dash { to { background-position-x: -44px; } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.55} }
        @keyframes flash { 0%{opacity:1} 100%{opacity:0} }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>
              Airport <span style={{ color: C.amber }}>Ops</span>
            </div>
            <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1 }}>TORRE DI CONTROLLO · ottimizza il flusso, non la dimensione</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: C.amberHi, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: "4px 12px", letterSpacing: 2 }}>
              {clock(s.minute)}
            </div>
            <div style={{ display: "flex", gap: 4, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: 4 }}>
              <SpeedBtn active={!s.running} onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}><Pause size={15} /></SpeedBtn>
              {[1, 2, 3].map(v => (
                <SpeedBtn key={v} active={s.running && s.speed === v} onClick={() => dispatch({ type: "SET_SPEED", speed: v })}>
                  {v === 1 ? <Play size={15} /> : `${v}×`}
                </SpeedBtn>
              ))}
            </div>
          </div>
        </div>

        {/* event banner */}
        {s.event && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "9px 13px", borderRadius: 9,
            background: s.event.type === "weather" ? "rgba(226,92,92,.12)" : "rgba(246,166,35,.12)",
            border: `1px solid ${s.event.type === "weather" ? C.red : C.amber}`,
            color: s.event.type === "weather" ? C.red : C.amberHi, fontSize: 13, fontWeight: 600, animation: "pulse 1.6s infinite",
          }}>
            {s.event.type === "weather" ? <CloudRain size={16} /> : <Zap size={16} />}{s.event.label}
          </div>
        )}

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 14 }}>
          <Readout icon={<Coins size={12} />} label="Cassa" value={eur(s.money)} sub={`−${eur(upkeepTotal)}/min upkeep`} accent={s.money < 8000 ? C.red : C.text} />
          <Readout icon={<Star size={12} />} label="Reputazione" value={`${Math.round(s.reputation)}%`} accent={repColor}
            sub={<span style={{ display: "inline-block", width: "100%" }}>
              <span style={{ display: "block", height: 4, background: C.bg, borderRadius: 2, marginTop: 4 }}>
                <span style={{ display: "block", width: s.reputation + "%", height: "100%", background: repColor, borderRadius: 2 }} />
              </span>
            </span>} />
          <Readout icon={<TrendingUp size={12} />} label="Throughput" value={s.throughput.toLocaleString("it-IT")} sub="pax / ora" accent={C.teal} />
          <Readout icon={<Clock size={12} />} label="Attesa media" value={`${Math.round(s.estWait)} min`} sub="coda security" accent={waitColor} />
          <Readout icon={<Gauge size={12} />} label="On-time" value={`${onTimePct}%`} sub={`${s.departedFlights} voli partiti`} accent={onTimePct > 75 ? C.green : C.amber} />
          <Readout icon={<Activity size={12} />} label="Utilizzo gate" value={`${gateUtil}%`} sub={`${s.occCount}/${s.gates} occupati`} accent={C.amberHi} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          {/* MAIN */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            {/* security */}
            <Panel title="Security" icon={<ShieldCheck size={14} color={C.amber} />}
              right={`${s.lanes} corsie · ${s.lanes * SECURITY_RATE} pax/min`}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontFamily: MONO, fontSize: 30, fontWeight: 700, color: queueColor }}>
                  {s.securityQueue}<span style={{ fontSize: 12, color: C.dim, fontWeight: 400 }}> in coda</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {Array.from({ length: s.lanes }).map((_, i) => (
                    <div key={i} style={{ width: 8, height: 26, borderRadius: 2, background: C.amber, opacity: 0.5 + 0.5 * ((i + (s.minute % 2)) % 2) }} />
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 10, height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${queueSeverity * 100}%`, height: "100%", background: queueColor, transition: "width .25s" }} />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: C.dim, marginTop: 5 }}>
                {s.clearedPool} pax filtrati in attesa di imbarco
              </div>
            </Panel>

            {/* gates */}
            <Panel title="Gate" icon={<Plane size={14} color={C.teal} style={{ transform: "rotate(45deg)" }} />}
              right={waiting.length ? `${waiting.length} in attesa di gate` : "nessuna attesa"}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))", gap: 8 }}>
                {Array.from({ length: s.gates }).map((_, g) => (
                  <GateCell key={g} flight={s.flights.find(f => f.gate === g)} />
                ))}
              </div>
              {waiting.length > 0 && (
                <div style={{ marginTop: 9, fontFamily: MONO, fontSize: 11, color: C.amber, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <AlertTriangle size={13} />holding: {waiting.slice(0, 6).map(f => f.code).join("  ")}
                </div>
              )}
            </Panel>

            {/* runway */}
            <Panel title="Pista" icon={<Activity size={14} color={C.runway} />}
              right={`liv. ${s.runwayLevel} · ${s.event?.type === "weather" ? Math.ceil(s.runwayLevel / 2) : s.runwayLevel} partenze/min`}>
              <div style={{ position: "relative", height: 40, borderRadius: 6, background: "#11161b", border: `1px solid ${C.line}`, overflow: "hidden", display: "flex", alignItems: "center", paddingLeft: 12 }}>
                <div style={{ position: "absolute", left: 0, top: "50%", height: 3, width: "100%", transform: "translateY(-50%)",
                  backgroundImage: `repeating-linear-gradient(90deg, ${C.runway} 0 22px, transparent 22px 44px)`,
                  opacity: 0.45, animation: s.running ? "dash .5s linear infinite" : "none" }} />
                {s.lastDeparted && (
                  <span key={s.lastDeparted + s.departedFlights} style={{ position: "relative", fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.runway, animation: "flash 1.4s ease-out" }}>
                    ✈ {s.lastDeparted} DECOLLATO
                  </span>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: MONO, fontSize: 12, color: C.dim }}>
                <span>{s.departedFlights} voli · {s.departedPax.toLocaleString("it-IT")} pax</span>
                <span style={{ color: C.green }}>+{eur(REVENUE_PAX)}/pax</span>
              </div>
            </Panel>

            {/* chart */}
            <Panel title="Andamento" icon={<TrendingUp size={14} color={C.dim} />} right="throughput vs coda">
              <div style={{ height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={s.history} margin={{ top: 6, right: 6, bottom: 0, left: -28 }}>
                    <XAxis dataKey="t" hide />
                    <YAxis tick={{ fill: C.dim2, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 8, fontFamily: MONO, fontSize: 11 }}
                      labelStyle={{ color: C.dim }} formatter={(v, n) => [v, n === "thru" ? "pax/h" : "coda"]} labelFormatter={(l) => clock(l)} />
                    <Line type="monotone" dataKey="thru" stroke={C.teal} dot={false} strokeWidth={2} isAnimationActive={false} />
                    <Line type="monotone" dataKey="queue" stroke={C.amber} dot={false} strokeWidth={1.5} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          {/* CONTROLS */}
          <Panel title="Investimenti" icon={<Plus size={14} color={C.green} />} right={`punteggio ${score.toLocaleString("it-IT")}`}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 8 }}>
              <InvestButton icon={<ShieldCheck size={15} color={C.amber} />} label="Corsia security" count={s.lanes} max={MAX_LANES}
                cost={COST_LANE} upkeep={UPKEEP_LANE} disabled={s.money < COST_LANE} onClick={() => dispatch({ type: "BUY_LANE" })} />
              <InvestButton icon={<Plane size={15} color={C.teal} style={{ transform: "rotate(45deg)" }} />} label="Nuovo gate" count={s.gates} max={MAX_GATES}
                cost={COST_GATE} upkeep={UPKEEP_GATE} disabled={s.money < COST_GATE} onClick={() => dispatch({ type: "BUY_GATE" })} />
              <InvestButton icon={<Activity size={15} color={C.runway} />} label="Potenzia pista" count={s.runwayLevel} max={MAX_RUNWAY}
                cost={COST_RUNWAY * s.runwayLevel} upkeep={UPKEEP_RUNWAY * s.runwayLevel} disabled={s.money < COST_RUNWAY * s.runwayLevel} onClick={() => dispatch({ type: "UPGRADE_RUNWAY" })} />
            </div>
            <div style={{ marginTop: 10, fontSize: 11.5, color: C.dim2, lineHeight: 1.5 }}>
              Trova il collo di bottiglia che frena tutto e colpisci quello. Aggiungere capacità costa upkeep: se sovradimensioni vai in rosso, se sottodimensioni crolla la reputazione.
            </div>
          </Panel>
        </div>
      </div>

      {/* game over */}
      {s.gameOver && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8,11,14,.86)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50 }}>
          <div style={{ background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 14, padding: 28, maxWidth: 380, textAlign: "center" }}>
            <div style={{ fontSize: 13, letterSpacing: 2, color: s.reputation <= 0 ? C.red : C.amber, textTransform: "uppercase", fontWeight: 700 }}>
              {s.reputation <= 0 ? "Reputazione a zero" : "Bancarotta"}
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>Turno finito</div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: C.dim, marginTop: 14, lineHeight: 1.9 }}>
              Punteggio <span style={{ color: C.amberHi, fontSize: 17 }}>{score.toLocaleString("it-IT")}</span><br />
              {s.departedPax.toLocaleString("it-IT")} pax · {s.departedFlights} voli · {onTimePct}% on-time
            </div>
            <button onClick={() => dispatch({ type: "RESET" })}
              style={{ marginTop: 20, background: C.amber, color: "#0e1318", border: "none", borderRadius: 9, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: SANS }}>
              Ricomincia il turno
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SpeedBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? C.amber : "transparent", color: active ? "#0e1318" : C.dim,
      border: "none", borderRadius: 6, width: 32, height: 28, cursor: "pointer",
      fontFamily: MONO, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
    }}>{children}</button>
  );
}

function Panel({ title, icon, right, children }) {
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.text }}>
          {icon}{title}
        </div>
        {right && <div style={{ fontFamily: MONO, fontSize: 11, color: C.dim }}>{right}</div>}
      </div>
      {children}
    </div>
  );
}
