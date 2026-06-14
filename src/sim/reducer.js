import { COSTS, LIMITS } from "./constants";
import { initialState } from "./initialState";
import { tick } from "./tick";

export function reducer(state, action) {
  switch (action.type) {
    case "TICK":
      return tick(state);
    case "TOGGLE_PAUSE":
      return { ...state, running: !state.running };
    case "SET_SPEED":
      return { ...state, speed: action.speed, running: true };
    case "BUY_LANE":
      if (state.money < COSTS.lane || state.lanes >= LIMITS.maxLanes) return state;
      return { ...state, money: state.money - COSTS.lane, lanes: state.lanes + 1 };
    case "BUY_GATE":
      if (state.money < COSTS.gate || state.gates >= LIMITS.maxGates) return state;
      return { ...state, money: state.money - COSTS.gate, gates: state.gates + 1 };
    case "UPGRADE_RUNWAY": {
      const cost = COSTS.runwayBase * state.runwayLevel;
      if (state.money < cost || state.runwayLevel >= LIMITS.maxRunway) return state;
      return { ...state, money: state.money - cost, runwayLevel: state.runwayLevel + 1 };
    }
    case "RESET":
      return initialState();
    default:
      return state;
  }
}
