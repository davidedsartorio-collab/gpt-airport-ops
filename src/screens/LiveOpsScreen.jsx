import { Activity, ArrowLeft, Pause, Play, Plane } from "lucide-react";
import { PALETTE as C } from "../sim/constants";
import { clock, getUiStats } from "../sim/selectors";
import { TerminalCanvas } from "../render/TerminalCanvas";
import { EventBanner } from "../ui/EventBanner";
import { GatePanel } from "../ui/GatePanel";
import { InvestmentPanel } from "../ui/InvestmentPanel";
import { KpiPanel } from "../ui/KpiPanel";
import { ChartPanel } from "../ui/ChartPanel";
import { BottleneckPanel } from "../ui/BottleneckPanel";
import { SpeedButton, TinyTag } from "../ui/Panel";

export function LiveOpsScreen({ state, dispatch, onBack }) {
  const stats = getUiStats(state);

  return (
    <div className="app-shell" style={{ "--airport-primary": state.airportTheme?.primary, "--airport-secondary": state.airportTheme?.secondary }}>
      <div className="app-bg app-bg--one" />
      <div className="app-bg app-bg--two" />
      <main className="app">
        <header className="topbar">
          <div className="topbar__brand-group">
            <button className="back-btn" onClick={onBack} title="Back to airport map"><ArrowLeft size={16} /></button>
            <div>
              <div className="brand"><Plane size={22} style={{ transform: "rotate(45deg)" }} /> Airport <span>Ops</span></div>
              <div className="subtitle">{state.airportName} · 2D live terminal · optimization-first gameplay</div>
            </div>
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
              <div><Activity size={15} color={C.teal} /> Live airport view</div>
              <div className="map-card__legend">
                <span><b className="legend legend--blue" /> normal</span>
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
          <div className="brief-card mission-card">
            <div className="brief-card__title">Mission objectives</div>
            <p>Questa campagna parte semplice: devi imparare a vedere il problema, non solo leggere il numero.</p>
            <div className="brief-card__list">
              {state.objectives?.map((objective) => <span key={objective}>◆ {objective}</span>)}
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
