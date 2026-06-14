import { Activity, Clock, Coins, Gauge, Star, TrendingUp } from "lucide-react";
import { LIMITS, PALETTE as C } from "../sim/constants";
import { eur } from "../sim/selectors";
import { Readout } from "./Panel";

export function KpiPanel({ state, stats }) {
  const repColor = state.reputation > 60 ? C.green : state.reputation > 30 ? C.amber : C.red;
  const waitColor = state.estWait > LIMITS.waitThreshold ? C.red : state.estWait > LIMITS.waitThreshold * 0.6 ? C.amber : C.green;
  return (
    <div className="kpi-grid">
      <Readout icon={<Coins size={12} />} label="Cassa" value={eur(state.money)} sub={`−${eur(stats.upkeepTotal)}/min upkeep`} accent={state.money < 8000 ? C.red : C.text} />
      <Readout icon={<Star size={12} />} label="Reputazione" value={`${Math.round(state.reputation)}%`} accent={repColor} sub="qualità operativa" />
      <Readout icon={<TrendingUp size={12} />} label="Throughput" value={state.throughput.toLocaleString("it-IT")} sub="pax / ora" accent={C.teal} />
      <Readout icon={<Clock size={12} />} label="Attesa media" value={`${Math.round(state.estWait)} min`} sub="security queue" accent={waitColor} />
      <Readout icon={<Gauge size={12} />} label="On-time" value={`${stats.onTimePct}%`} sub={`${state.departedFlights} voli partiti`} accent={stats.onTimePct > 75 ? C.green : C.amber} />
      <Readout icon={<Activity size={12} />} label="Gate util." value={`${stats.gateUtil}%`} sub={`${state.occCount}/${state.gates} occupati`} accent={C.amberHi} />
    </div>
  );
}
