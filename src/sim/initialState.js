import { GAME } from "./constants";
import { getAirportById } from "../data/airportTemplates";

export function initialState(airportId = "earth-regional") {
  const airport = getAirportById(airportId);
  return {
    running: true,
    speed: 1,
    gameOver: false,
    minute: GAME.startMinute,
    money: airport.starting.money,
    reputation: airport.starting.reputation,
    lanes: airport.starting.lanes,
    gates: airport.starting.gates,
    runwayLevel: airport.starting.runwayLevel,
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
    eventCooldown: 18,
    lastDeparted: null,
    estWait: 0,
    throughput: 0,
    occCount: 0,
    lastBottleneck: "none",
    airportId: airport.id,
    airportName: airport.name,
    airportTheme: airport.theme,
    objectives: airport.objectives,
    tuning: airport.tuning,
    stars: 0,
  };
}
