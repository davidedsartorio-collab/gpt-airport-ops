import { AlertTriangle, Plane } from "lucide-react";
import { PALETTE as C } from "../sim/constants";
import { Panel } from "./Panel";

function GateCell({ flight, index }) {
  if (!flight) {
    return (
      <div className="gate-cell gate-cell--free">
        <div className="gate-cell__code">G{index + 1}</div>
        <div className="gate-cell__empty">LIBERO</div>
      </div>
    );
  }
  const ready = flight.status === "ready";
  const pct = Math.round((flight.boarded / flight.pax) * 100);
  const delayed = flight.age > 24;
  return (
    <div className={`gate-cell ${ready ? "gate-cell--ready" : ""} ${delayed ? "gate-cell--delayed" : ""}`}>
      <div className="gate-cell__top">
        <span className="gate-cell__code">{flight.code}</span>
        <Plane size={13} color={ready ? C.green : delayed ? C.red : C.amber} style={{ transform: "rotate(45deg)" }} />
      </div>
      <div className="progress"><div className="progress__bar" style={{ width: `${pct}%`, background: ready ? C.green : delayed ? C.red : C.amber }} /></div>
      <div className="gate-cell__meta">{ready ? "READY" : `${flight.boarded}/${flight.pax} pax`} · {flight.age}m</div>
    </div>
  );
}

export function GatePanel({ state, waitingFlights, compact = false }) {
  return (
    <Panel className={compact ? "panel--compact-gates" : ""} title="Gate Ops" icon={<Plane size={14} color={C.teal} style={{ transform: "rotate(45deg)" }} />} right={waitingFlights.length ? `${waitingFlights.length} in holding` : "flow stabile"}>
      <div className="gates-grid">
        {Array.from({ length: state.gates }).map((_, g) => <GateCell key={g} index={g} flight={state.flights.find((f) => f.gate === g)} />)}
      </div>
      {waitingFlights.length > 0 && (
        <div className="holding-line"><AlertTriangle size={13} /> holding: {waitingFlights.slice(0, 6).map((f) => f.code).join("  ")}</div>
      )}
    </Panel>
  );
}
