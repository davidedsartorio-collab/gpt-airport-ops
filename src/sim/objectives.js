import { GAME } from "./constants.js";

export const DEFAULT_DAY_LENGTH = 720;

export function objectiveLabel(objective) {
  if (objective.label) return objective.label;
  const op = objective.op || ">=";
  const target = objective.target;
  const suffix = objective.type === "pax" ? " passeggeri" : objective.type === "wait" ? " min" : "%";
  const names = {
    pax: "Servi",
    onTime: "Puntualità",
    reputation: "Reputazione",
    wait: "Attesa media",
    cash: "Cassa",
    runway: "Pista",
  };
  return `${names[objective.type] || objective.type} ${op} ${target}${suffix}`;
}

export function getObjectiveValue(s, objective) {
  switch (objective.type) {
    case "pax":
      return s.departedPax;
    case "onTime":
      return s.departedFlights ? Math.round((s.onTimeFlights / s.departedFlights) * 100) : 100;
    case "reputation":
      return Math.round(s.reputation);
    case "wait":
      return Math.round(s.estWait || 0);
    case "cash":
      return Math.round(s.money);
    case "runway":
      return s.runwayLevel;
    default:
      return 0;
  }
}

export function isObjectiveComplete(value, objective) {
  if (objective.op === "<=") return value <= objective.target;
  return value >= objective.target;
}

export function evaluateObjectives(s) {
  const objectives = s.missionObjectives || [];
  return objectives.map((objective) => {
    const value = getObjectiveValue(s, objective);
    const complete = isObjectiveComplete(value, objective);
    let pct;
    if (objective.op === "<=") {
      pct = complete ? 100 : Math.max(0, Math.round((objective.target / Math.max(1, value)) * 100));
    } else {
      pct = Math.max(0, Math.min(100, Math.round((value / Math.max(1, objective.target)) * 100)));
    }
    return { ...objective, label: objectiveLabel(objective), value, complete, pct };
  });
}

export function starsFromCompleted(completedCount, total = 4) {
  if (completedCount <= 0) return 0;
  if (completedCount >= total) return 3;
  if (completedCount >= Math.ceil(total / 2)) return 2;
  return 1;
}

export function missionElapsedMinutes(s) {
  return Math.max(0, s.minute - (s.dayStartMinute ?? GAME.startMinute));
}

export function missionMinutesLeft(s) {
  return Math.max(0, (s.dayLength ?? DEFAULT_DAY_LENGTH) - missionElapsedMinutes(s));
}

export function finalizeMission(s) {
  const progress = evaluateObjectives(s);
  const completedCount = progress.filter((o) => o.complete).length;
  const stars = starsFromCompleted(completedCount, progress.length || 4);
  return {
    completed: completedCount,
    total: progress.length,
    stars,
    success: stars > 0,
    unlockNext: stars >= 2,
    progress,
  };
}
