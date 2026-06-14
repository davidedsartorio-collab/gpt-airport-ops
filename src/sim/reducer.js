import { COSTS, LIMITS } from "./constants.js";
import { initialState } from "./initialState.js";
import { tick } from "./tick.js";

export function reducer(state, action) {
  switch (action.type) {
    case "TICK":
      return tick(state);
    case "START_AIRPORT":
      return initialState(action.airportId, action.seed);
    case "TOGGLE_PAUSE":
      return { ...state, running: !state.running };
    case "SET_SPEED":
      return { ...state, speed: action.speed, running: true };
    case "BUY_LANE":
      if (state.money < COSTS.lane || state.lanes >= LIMITS.maxLanes) return state;
      return {
        ...state,
        money: state.money - COSTS.lane,
        lanes: state.lanes + 1,
        upgradeNotice: { type: "security", label: "Nuova corsia security", ttl: 9 },
      };
    case "BUY_GATE":
      if (state.money < COSTS.gate || state.gates >= LIMITS.maxGates) return state;
      return {
        ...state,
        money: state.money - COSTS.gate,
        gates: state.gates + 1,
        upgradeNotice: { type: "gate", label: "Nuovo gate aperto", ttl: 9 },
      };
    case "UPGRADE_RUNWAY": {
      const cost = COSTS.runwayBase * state.runwayLevel;
      if (state.money < cost || state.runwayLevel >= LIMITS.maxRunway) return state;
      return {
        ...state,
        money: state.money - cost,
        runwayLevel: state.runwayLevel + 1,
        upgradeNotice: { type: "runway", label: "Pista potenziata", ttl: 9 },
      };
    }
    case "RESET":
      return initialState(state.airportId);
    default:
      return state;
  }
}
