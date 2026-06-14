import { COSTS } from "./constants";

export const clock = (m) => {
  const t = ((m % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

export const eur = (n) => "€" + Math.round(n).toLocaleString("it-IT");

export function getUiStats(s) {
  const onTimePct = s.departedFlights ? Math.round((s.onTimeFlights / s.departedFlights) * 100) : 100;
  const gateUtil = s.gates ? Math.round((s.occCount / s.gates) * 100) : 0;
  const upkeepTotal = s.lanes * COSTS.laneUpkeep + s.gates * COSTS.gateUpkeep + s.runwayLevel * COSTS.runwayUpkeep;
  const score = s.departedPax + s.onTimeFlights * 50;
  const waitingFlights = s.flights.filter((f) => f.status === "wait" && f.gate == null);
  return { onTimePct, gateUtil, upkeepTotal, score, waitingFlights };
}
