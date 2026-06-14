import { useEffect, useReducer } from "react";
import { Activity, Pause, Play, Plane } from "lucide-react";
import { GAME, PALETTE as C } from "./sim/constants";
import { initialState } from "./sim/initialState";
import { reducer } from "./sim/reducer";
import { clock, getUiStats } from "./sim/selectors";
import { TerminalCanvas } from "./render/TerminalCanvas";
import { EventBanner } from "./ui/EventBanner";
import { GatePanel } from "./ui/GatePanel";
import { InvestmentPanel } from "./ui/InvestmentPanel";
import { KpiPanel } from "./ui/KpiPanel";
import { ChartPanel } from "./ui/ChartPanel";
import { BottleneckPanel } from "./ui/BottleneckPanel";
import { SpeedButton, TinyTag } from "./ui/Panel";

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stats = getUiStats(state);

  useEffect(() => {
    if (!state.running || state.gameOver) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), GAME.baseMs / state.speed);
    return () => clearInterval(id);
  }, [state.running, state.speed, state.gameOver]);

  return (
    <div className="app-shell">
      <div className="app-bg app-bg--one" />
      <div className="app-bg app-bg--two" />
      <main className="app">
        <header className="topbar">
          <div>
            <div className="brand"><Plane size={22} style={{ transform: "rotate(45deg)" }} /> Airport <span>Ops</span></div>
            <div className="subtitle">2D ops optimizer · teoria delle code gamificata · visual flow first</div>
          </div>
          <div className="topbar__right">
            <TinyTag tone={state.lastBottleneck === "none" ? "ok" : "warning"}>BOTTLENECK: {state.lastBottleneck.toUpperCase()}</TinyTag>
            <div className="clock-box">{clock(state.minute)}</div>
            <div className="speed-group">
              <SpeedButton active={!state.running} onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}><Pause size={15} /></SpeedButton>
              {[1, 2, 3].map((v) => <SpeedButton key={v} active={state.running && state.speed === v} onClick={() => dispatch({ type: "SET_SPEED", speed: v })}>{v === 1 ? <Play size={15} /> : `${v}×`}</SpeedButton>)}
            </div>
          </div>
        </header>

        <EventBanner event={state.event} />
        <KpiPanel state={state} stats={stats} />

        <section className="main-grid">
          <div className="map-card">
            <div className="map-card__head">
              <div><Activity size={15} color={C.teal} /> Live terminal simulation</div>
              <div className="map-card__legend">
                <span><b className="legend legend--blue" /> pax</span>
                <span><b className="legend legend--orange" /> waiting</span>
                <span><b className="legend legend--red" /> critical</span>
              </div>
            </div>
            <TerminalCanvas state={state} />
          </div>

          <aside className="side-stack">
            <BottleneckPanel state={state} />
            <GatePanel state={state} waitingFlights={stats.waitingFlights} />
            <InvestmentPanel state={state} score={stats.score} dispatch={dispatch} />
          </aside>
        </section>

        <section className="bottom-grid">
          <ChartPanel history={state.history} />
          <div className="brief-card">
            <div className="brief-card__title">Next vision</div>
            <p>Questa v2 sposta il progetto da dashboard statica a prototipo visuale: gli omini, le code e gli stati dei gate sono ora parte della lettura operativa.</p>
            <div className="brief-card__list">
              <span>✓ 2D canvas</span>
              <span>✓ passenger flow</span>
              <span>✓ bottleneck highlights</span>
              <span>next: airports unlock</span>
            </div>
          </div>
        </section>
      </main>

      {state.gameOver && (
        <div className="modal-backdrop">
          <div className="gameover-modal">
            <div className="gameover-modal__kicker">{state.reputation <= 0 ? "Reputazione a zero" : "Bancarotta"}</div>
            <div className="gameover-modal__title">Turno finito</div>
            <div className="gameover-modal__stats">Score <strong>{stats.score.toLocaleString("it-IT")}</strong><br />{state.departedPax.toLocaleString("it-IT")} pax · {state.departedFlights} voli · {stats.onTimePct}% on-time</div>
            <button className="reset-btn" onClick={() => dispatch({ type: "RESET" })}>Ricomincia il turno</button>
          </div>
        </div>
      )}
    </div>
  );
}
