// Headless balance harness for the Airport Ops sim.
//
// Runs the pure reducer with no UI, across multiple seeds and all airport
// templates, under two controllers (do-nothing baseline vs greedy auto-invest),
// and prints averaged KPIs. Also asserts determinism: same airport + same seed
// produces an identical run. This is how you tune the numbers in sim/constants.js
// and per-airport tuning in data/airportTemplates.js with evidence instead of feel.
//
//   npm run balance
//
import { initialState } from "../src/sim/initialState.js";
import { reducer } from "../src/sim/reducer.js";
import { COSTS, LIMITS } from "../src/sim/constants.js";

const TICKS = 600; // ~ a full session (1 tick = 1 game minute)
const SEEDS = [1, 2, 3, 4, 5];
const AIRPORTS = ["earth-regional", "low-cost-chaos", "island-storm", "mars-colony"];

// A simple controller: relieve whatever the engine flags as the bottleneck,
// throttled so it does not spam-buy before the previous investment takes effect.
function greedy(state, lastInvestTick, tickNo) {
  if (tickNo - lastInvestTick < 6) return null;
  const b = state.lastBottleneck;
  if (b === "security" && state.money >= COSTS.lane && state.lanes < LIMITS.maxLanes) {
    return { type: "BUY_LANE" };
  }
  if (b === "gate" && state.money >= COSTS.gate && state.gates < LIMITS.maxGates) {
    return { type: "BUY_GATE" };
  }
  if ((b === "runway" || b === "boarding") && state.money >= COSTS.runwayBase * state.runwayLevel && state.runwayLevel < LIMITS.maxRunway) {
    return { type: "UPGRADE_RUNWAY" };
  }
  return null;
}

function run(airportId, seed, policy) {
  let s = initialState(airportId, seed);
  let lastInvest = -999;
  let peakQueue = 0;
  for (let t = 0; t < TICKS; t += 1) {
    if (policy) {
      const action = policy(s, lastInvest, t);
      if (action) {
        s = reducer(s, action);
        lastInvest = t;
      }
    }
    s = reducer(s, { type: "TICK" });
    if (s.securityQueue > peakQueue) peakQueue = s.securityQueue;
    if (s.gameOver) break;
  }
  const onTime = s.departedFlights ? Math.round((s.onTimeFlights / s.departedFlights) * 100) : 100;
  return {
    survived: !s.gameOver,
    pax: s.departedPax,
    onTime,
    money: Math.round(s.money),
    rep: Math.round(s.reputation),
    peakQueue,
  };
}

const avg = (runs, key) => Math.round(runs.reduce((a, r) => a + r[key], 0) / runs.length);

function summarize(airportId, policy) {
  const runs = SEEDS.map((seed) => run(airportId, seed, policy));
  const survived = runs.filter((r) => r.survived).length;
  return {
    survived: `${survived}/${SEEDS.length}`,
    pax: avg(runs, "pax"),
    onTime: avg(runs, "onTime"),
    money: avg(runs, "money"),
    rep: avg(runs, "rep"),
    peakQueue: avg(runs, "peakQueue"),
  };
}

// --- determinism proof ---------------------------------------------------
function fingerprint(airportId, seed) {
  let s = initialState(airportId, seed);
  for (let t = 0; t < 300; t += 1) s = reducer(s, { type: "TICK" });
  return `${s.minute}|${s.money}|${s.reputation.toFixed(2)}|${s.departedPax}|${s.securityQueue}|${s.rngState}`;
}
const fpA = fingerprint("earth-regional", 12345);
const fpB = fingerprint("earth-regional", 12345);
console.log("Determinism:", fpA === fpB ? "OK — same seed => identical run" : "FAILED");
console.log("  fingerprint:", fpA);
console.log("");

// --- balance table -------------------------------------------------------
const pad = (v, n) => String(v).padEnd(n);
console.log(`${TICKS} tick · ${SEEDS.length} seed · valori medi\n`);
for (const policy of [null, greedy]) {
  console.log(policy ? "POLICY: greedy auto-invest sul bottleneck" : "POLICY: nessun investimento (baseline)");
  console.log(
    `  ${pad("airport", 16)} ${pad("survive", 8)} ${pad("pax", 7)} ${pad("on-time", 8)} ${pad("rep", 5)} ${pad("money", 9)} ${pad("peakQ", 6)}`,
  );
  for (const id of AIRPORTS) {
    const r = summarize(id, policy);
    console.log(
      `  ${pad(id, 16)} ${pad(r.survived, 8)} ${pad(r.pax, 7)} ${pad(`${r.onTime}%`, 8)} ${pad(r.rep, 5)} ${pad(r.money, 9)} ${pad(r.peakQueue, 6)}`,
    );
  }
  console.log("");
}
