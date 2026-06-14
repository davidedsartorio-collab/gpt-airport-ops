import { useEffect, useReducer, useState } from "react";
import { GAME } from "./sim/constants";
import { initialState } from "./sim/initialState";
import { reducer } from "./sim/reducer";
import { loadCampaign, saveAirportResult } from "./sim/campaign";
import { AirportSelectScreen } from "./screens/AirportSelectScreen";
import { LiveOpsScreen } from "./screens/LiveOpsScreen";

export default function App() {
  const [screen, setScreen] = useState("select");
  const [campaign, setCampaign] = useState(() => loadCampaign());
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState("earth-regional"));

  useEffect(() => {
    if (screen !== "live" || !state.running || state.gameOver || state.missionComplete) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), GAME.baseMs / state.speed);
    return () => clearInterval(id);
  }, [screen, state.running, state.speed, state.gameOver, state.missionComplete]);

  useEffect(() => {
    if (!state.missionComplete || state.missionSaved || !state.missionResult) return;
    const next = saveAirportResult(state.airportId, state.missionResult.stars);
    setCampaign(next);
    dispatch({ type: "MARK_MISSION_SAVED" });
  }, [state.missionComplete, state.missionSaved, state.missionResult, state.airportId]);

  const startAirport = (airportId) => {
    dispatch({ type: "START_AIRPORT", airportId });
    setScreen("live");
  };

  if (screen === "select") {
    return <AirportSelectScreen campaign={campaign} onStart={startAirport} />;
  }

  return <LiveOpsScreen state={state} dispatch={dispatch} onBack={() => { setCampaign(loadCampaign()); setScreen("select"); }} />;
}
