import { useEffect, useReducer, useState } from "react";
import { GAME } from "./sim/constants";
import { initialState } from "./sim/initialState";
import { reducer } from "./sim/reducer";
import { AirportSelectScreen } from "./screens/AirportSelectScreen";
import { LiveOpsScreen } from "./screens/LiveOpsScreen";

export default function App() {
  const [screen, setScreen] = useState("select");
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState("earth-regional"));

  useEffect(() => {
    if (screen !== "live" || !state.running || state.gameOver) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), GAME.baseMs / state.speed);
    return () => clearInterval(id);
  }, [screen, state.running, state.speed, state.gameOver]);

  const startAirport = (airportId) => {
    dispatch({ type: "START_AIRPORT", airportId });
    setScreen("live");
  };

  if (screen === "select") {
    return <AirportSelectScreen onStart={startAirport} />;
  }

  return <LiveOpsScreen state={state} dispatch={dispatch} onBack={() => setScreen("select")} />;
}
