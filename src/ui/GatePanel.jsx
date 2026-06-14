import { AlertTriangle, CheckCircle2, Clock3, Plane } from "lucide-react";
import { PALETTE as C } from "../sim/constants";
import { Panel } from "./Panel";

function StatusBadge({ ready, delayed, empty }) {
  const label = empty ? "LIBERO" : delayed ? "RITARDO" : ready ? "PRONTO" : "BOARDING";
  return <span className={`gate-status ${empty ? "gate-status--free" : delayed ? "gate-status--delay" : ready ? "gate-status--ready" : "gate-status--board"}`}>{label}</span>;
}

function GateCell({ flight, index }) {
  if (!flight) {
    return (
      <div className="gate-card gate-card--free">
        <div className="gate-card__top">
          <span className="gate-card__code">G{index + 1}</span>
          <StatusBadge empty />
        </div>
        <div className="gate-card__empty">nessun volo</div>
      </div>
    );
  }
  const ready = flight.status === "ready";
  const pct = Math.round((flight.boarded / flight.pax) * 100);
  const delayed = flight.age > 24;
  const color = ready ? C.green : delayed ? C.red : C.amber;
  return (
    <div className={`gate-card ${ready ? "gate-card--ready" : ""} ${delayed ? "gate-card--delayed" : ""}`}>
      <div className="gate-card__top">
        <span className="gate-card__code">{flight.code}</span>
        <StatusBadge ready={ready} delayed={delayed} />
      </div>
      <div className="gate-card__plane-row">
        <Plane size={16} color={color} style={{ transform: "rotate(45deg)" }} />
        <span>{flight.boarded}/{flight.pax} pax</span>
      </div>
      <div className="gate-card__progress"><span style={{ width: `${pct}%`, background: color }} /></div>
      <div className="gate-card__meta"><Clock3 size={11} /> {flight.age} min · Gate {index + 1}</div>
    </div>
  );
}

export function GatePanel({ state, waitingFlights }) {
  return (
    <Panel title="Gate cells" icon={<Plane size={14} color={C.teal} style={{ transform: "rotate(45deg)" }} />} right={waitingFlights.length ? `${waitingFlights.length} in attesa` : "stabile"}>
      <div className="gate-card-grid">
        {Array.from({ length: state.gates }).map((_, g) => <GateCell key={g} index={g} flight={state.flights.find((f) => f.gate === g)} />)}
      </div>
      {waitingFlights.length > 0 ? (
        <div className="holding-line"><AlertTriangle size={13} /> holding: {waitingFlights.slice(0, 6).map((f) => f.code).join("  ")}</div>
      ) : (
        <div className="holding-line holding-line--ok"><CheckCircle2 size={13} /> gate flow stabile</div>
      )}
    </Panel>
  );
}
