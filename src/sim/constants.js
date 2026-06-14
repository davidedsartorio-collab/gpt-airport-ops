export const GAME = {
  baseMs: 650,
  startMinute: 360,
  startMoney: 60000,
  startReputation: 85,
  startLanes: 3,
  startGates: 3,
  startRunwayLevel: 1,
};

export const RATES = {
  securityPerLane: 4,
  boardingPerGate: 14,
  revenuePerPax: 12,
};

export const COSTS = {
  lane: 9000,
  gate: 14000,
  runwayBase: 22000,
  laneUpkeep: 14,
  gateUpkeep: 10,
  runwayUpkeep: 22,
};

export const LIMITS = {
  waitThreshold: 14,
  gateWaitLimit: 9,
  onTimeLimit: 26,
  maxLanes: 8,
  maxGates: 8,
  maxRunway: 4,
};

export const AIRLINES = ["AZ", "FR", "LH", "BA", "EK", "U2", "VY", "KL", "EW", "TP"];

export const PALETTE = {
  bg: "#081018",
  bg2: "#0d1822",
  panel: "#111f2b",
  panelHi: "#172838",
  card: "#102231",
  card2: "#132a3b",
  line: "#244054",
  line2: "#355d76",
  text: "#eaf4fb",
  dim: "#8ea6b7",
  dim2: "#62798a",
  amber: "#f6a623",
  amberHi: "#ffd166",
  teal: "#3bd5dd",
  blue: "#4da3ff",
  green: "#61d394",
  red: "#ff5d68",
  purple: "#b989ff",
  runway: "#e8c84a",
};

export const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
export const SANS = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
