import { GAME } from "./constants";

export function initialState() {
  return {
    running: true,
    speed: 1,
    gameOver: false,
    minute: GAME.startMinute,
    money: GAME.startMoney,
    reputation: GAME.startReputation,
    lanes: GAME.startLanes,
    gates: GAME.startGates,
    runwayLevel: GAME.startRunwayLevel,
    securityQueue: 0,
    clearedPool: 0,
    flights: [],
    nextSpawnIn: 4,
    flightSeq: 1,
    departedPax: 0,
    departedFlights: 0,
    onTimeFlights: 0,
    history: [],
    thruWindow: [],
    event: null,
    eventCooldown: 45,
    lastDeparted: null,
    estWait: 0,
    throughput: 0,
    occCount: 0,
    lastBottleneck: "none",
    airportId: "regional-starter",
  };
}
