import { AIRLINES, COSTS, LIMITS, RATES } from "./constants.js";
import { makeRng } from "./rng.js";

function pickEvent(tuning, rng) {
  const weights = tuning?.events || { rush: 0.42, weather: 0.36, security: 0.22 };
  const r = rng();
  if (r < weights.rush) return { type: "rush", label: "Ora di punta — ondata di voli in arrivo", ticksLeft: 12 };
  if (r < weights.rush + weights.weather) return { type: "weather", label: "Maltempo — capacità pista ridotta", ticksLeft: 15 };
  return { type: "security", label: "Security alert — processi più lenti", ticksLeft: 10 };
}

function nextCooldown(tuning, rng) {
  const min = tuning?.eventCooldownMin ?? 40;
  const max = tuning?.eventCooldownMax ?? 70;
  return min + Math.floor(rng() * Math.max(1, max - min));
}

function detectBottleneck({ securityQueue, lanes, clearedPool, flights, gates, runwayLevel, event }) {
  const securityRate = lanes * RATES.securityPerLane * (event?.type === "security" ? 0.65 : 1);
  const waitingGate = flights.filter((f) => f.status === "wait" && f.gate == null).length;
  const readyFlights = flights.filter((f) => f.status === "ready").length;
  const runwaySlots = event?.type === "weather" ? Math.ceil(runwayLevel / 2) : runwayLevel;
  const secPressure = securityQueue / Math.max(1, securityRate * 9);
  const gatePressure = waitingGate / Math.max(1, gates);
  const runwayPressure = readyFlights / Math.max(1, runwaySlots);
  const boardingPressure = clearedPool > 160 && flights.some((f) => f.status === "board") ? 1.1 : 0;

  const scores = [
    ["security", secPressure],
    ["gate", gatePressure],
    ["runway", runwayPressure],
    ["boarding", boardingPressure],
  ].sort((a, b) => b[1] - a[1]);

  if (scores[0][1] < 0.75) return "none";
  return scores[0][0];
}

export function tick(s) {
  if (s.gameOver) return s;

  // Seeded RNG, restored from state so the run is deterministic and replayable.
  const rng = makeRng(s.rngState);

  let {
    minute,
    money,
    reputation,
    lanes,
    gates,
    runwayLevel,
    securityQueue,
    clearedPool,
    flights,
    nextSpawnIn,
    flightSeq,
    departedPax,
    departedFlights,
    onTimeFlights,
    history,
    thruWindow,
    event,
    eventCooldown,
  } = s;

  minute += 1;

  if (event) {
    event = { ...event, ticksLeft: event.ticksLeft - 1 };
    if (event.ticksLeft <= 0) {
      event = null;
      eventCooldown = nextCooldown(s.tuning, rng);
    }
  } else {
    eventCooldown -= 1;
    if (eventCooldown <= 0) event = pickEvent(s.tuning, rng);
  }

  const hours = Math.max(0, Math.floor((minute - 360) / 60));
  let baseInterval = Math.max(5, 11 - hours);
  if (event?.type === "rush") baseInterval = Math.max(3, Math.ceil(baseInterval / 2));

  const demandMultiplier = s.tuning?.demandMultiplier ?? 1;
  const paxMin = Math.max(20, Math.round((50 + hours * 6 + (s.tuning?.paxMinBonus ?? 0)) * demandMultiplier));
  const paxMax = Math.max(paxMin + 10, Math.round((120 + hours * 10 + (s.tuning?.paxMaxBonus ?? 0)) * demandMultiplier));

  flights = flights.map((f) => ({ ...f }));
  nextSpawnIn -= 1;

  if (nextSpawnIn <= 0) {
    const pax = paxMin + Math.floor(rng() * (paxMax - paxMin + 1));
    const code = AIRLINES[Math.floor(rng() * AIRLINES.length)] + (100 + Math.floor(rng() * 899));
    flights.push({ id: flightSeq, code, pax, boarded: 0, status: "wait", gate: null, age: 0 });
    flightSeq += 1;
    securityQueue += pax;
    nextSpawnIn = baseInterval + Math.floor(rng() * 3);
  }

  const occupied = new Set(flights.filter((f) => f.gate != null).map((f) => f.gate));
  for (let g = 0; g < gates; g += 1) {
    if (occupied.has(g)) continue;
    const waiting = flights.find((f) => f.status === "wait" && f.gate == null);
    if (!waiting) break;
    waiting.status = "board";
    waiting.gate = g;
    occupied.add(g);
  }

  const securitySlowdown = event?.type === "security" ? 0.65 : 1;
  const secThroughput = Math.max(1, Math.floor(lanes * RATES.securityPerLane * securitySlowdown));
  const moved = Math.min(securityQueue, secThroughput);
  securityQueue -= moved;
  clearedPool += moved;

  for (const f of flights) {
    if (f.status === "board" && clearedPool > 0) {
      const take = Math.min(f.pax - f.boarded, RATES.boardingPerGate, clearedPool);
      f.boarded += take;
      clearedPool -= take;
      if (f.boarded >= f.pax) f.status = "ready";
    }
  }

  let slots = event?.type === "weather" ? Math.ceil(runwayLevel / 2) : runwayLevel;
  let lastDeparted = s.lastDeparted;
  for (const f of flights) {
    if (slots <= 0) break;
    if (f.status === "ready") {
      f.status = "gone";
      slots -= 1;
      departedPax += f.pax;
      departedFlights += 1;
      money += f.pax * RATES.revenuePerPax;
      if (f.age <= LIMITS.onTimeLimit) {
        onTimeFlights += 1;
        reputation = Math.min(100, reputation + 0.3);
      }
      thruWindow = thruWindow.concat([{ minute, pax: f.pax }]);
      lastDeparted = f.code;
    }
  }
  flights = flights.filter((f) => f.status !== "gone");

  const estWait = securityQueue / Math.max(1, secThroughput);
  if (estWait > LIMITS.waitThreshold) reputation -= 0.45;
  for (const f of flights) if (f.status === "wait" && f.age > LIMITS.gateWaitLimit) reputation -= 0.15;
  reputation = Math.max(0, Math.min(100, reputation));

  for (const f of flights) f.age += 1;

  money -= lanes * COSTS.laneUpkeep + gates * COSTS.gateUpkeep + runwayLevel * COSTS.runwayUpkeep;

  thruWindow = thruWindow.filter((e) => e.minute > minute - 60);
  const throughput = thruWindow.reduce((a, e) => a + e.pax, 0);
  const occCount = flights.filter((f) => f.gate != null).length;
  history = history.concat([{ t: minute, thru: throughput, queue: securityQueue }]);
  if (history.length > 90) history = history.slice(history.length - 90);

  let gameOver = false;
  let running = s.running;
  if (reputation <= 0 || money < 0) {
    gameOver = true;
    running = false;
  }

  const lastBottleneck = detectBottleneck({ securityQueue, lanes, clearedPool, flights, gates, runwayLevel, event });

  return {
    ...s,
    minute,
    money,
    reputation,
    lanes,
    gates,
    runwayLevel,
    securityQueue,
    clearedPool,
    flights,
    nextSpawnIn,
    flightSeq,
    departedPax,
    departedFlights,
    onTimeFlights,
    history,
    thruWindow,
    event,
    eventCooldown,
    gameOver,
    running,
    lastDeparted,
    estWait,
    throughput,
    occCount,
    lastBottleneck,
    rngState: rng.state(),
  };
}
