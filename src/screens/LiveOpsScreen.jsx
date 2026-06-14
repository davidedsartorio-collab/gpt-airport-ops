import { Activity, ArrowLeft, Coins, Pause, Plane, Play, Star, Timer, TrendingUp } from "lucide-react";
import { PALETTE as C } from "../sim/constants";
import { clock, eur, getUiStats } from "../sim/selectors";
import { TerminalCanvas } from "../render/TerminalCanvas";
import { EventBanner } from "../ui/EventBanner";
import { GatePanel } from "../ui/GatePanel";
import { InvestmentPanel } from "../ui/InvestmentPanel";
import { BottleneckPanel } from "../ui/BottleneckPanel";
import { SpeedButton, TinyTag } from "../ui/Panel";

function HudPill({ icon, label, value, tone = "neutral" }) {
  return (
    <div className={`hud-pill hud-pill--${tone}`}>
      <div className="hud-pill__label">{icon}{label}</div>
      <div className="hud-pill__value">{value}</div>
    </div>
  );
}

export function LiveOpsScreen({ state, dispatch, onBack }) {
  const stats = getUiStats(state);
  const bottleneckTone = state.lastBottleneck === "none" ? "ok" : "warning";

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
              <div className="subtitle">{state.airportName} · live 2D terminal · less dashboard, more playable airport</div>
            </div>
          </div>
          <div className="topbar__right">
            <TinyTag tone={bottleneckTone}>BOTTLENECK: {state.lastBottleneck.toUpperCase()}</TinyTag>
            <div className="clock-box">{clock(state.minute)}</div>
            <div className="speed-group">
              <SpeedButton active={!state.running} onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}><Pause size={15} /></SpeedButton>
              {[1, 2, 3].map((v) => <SpeedButton key={v} active={state.running && state.speed === v} onClick={() => dispatch({ type: "SET_SPEED", speed: v })}>{v === 1 ? <Play size={15} /> : `${v}×`}</SpeedButton>)}
            </div>
          </div>
        </header>

        <EventBanner event={state.event} />

        <section className="hud-strip">
          <HudPill icon={<Coins size={13} />} label="Cassa" value={eur(state.money)} tone={state.money < 8000 ? "danger" : "neutral"} />
          <HudPill icon={<Star size={13} />} label="Rep" value={`${Math.round(state.reputation)}%`} tone={state.reputation > 60 ? "ok" : state.reputation > 30 ? "warning" : "danger"} />
          <HudPill icon={<TrendingUp size={13} />} label="Throughput" value={`${state.throughput.toLocaleString("it-IT")} pax/h`} tone="info" />
          <HudPill icon={<Timer size={13} />} label="Wait" value={`${Math.round(state.estWait)} min`} tone={state.estWait > 14 ? "danger" : state.estWait > 8 ? "warning" : "ok"} />
          <HudPill icon={<Plane size={13} style={{ transform: "rotate(45deg)" }} />} label="On time" value={`${stats.onTimePct}%`} tone={stats.onTimePct >= 75 ? "ok" : "warning"} />
          <HudPill icon={<Activity size={13} />} label="Ops" value={`G${state.occCount}/${state.gates} · R${state.runwayLevel}`} tone="neutral" />
        </section>

        <section className="play-stage">
          <div className="map-card map-card--gameplay">
            <div className="map-card__head">
              <div><Activity size={15} color={C.teal} /> playable airport view</div>
              <div className="map-card__legend">
                <span><b className="legend legend--blue" /> pax</span>
                <span><b className="legend legend--orange" /> waiting</span>
                <span><b className="legend legend--red" /> critical</span>
                <span><b className="legend legend--bag" /> baggage</span>
              </div>
            </div>
            <TerminalCanvas state={state} />
          </div>
        </section>

        <section className="command-grid">
          <BottleneckPanel state={state} />
          <InvestmentPanel state={state} score={stats.score} dispatch={dispatch} />
          <GatePanel state={state} waitingFlights={stats.waitingFlights} />
        </section>

        <section className="mission-row">
          <div className="brief-card mission-card mission-card--wide">
            <div className="brief-card__title">Mission objectives</div>
            <p>
              La vista deve spingere di più sul gioco: osserva il passaggio hall → bag drop → security → gate → runway e usa gli upgrade per far cambiare anche il look dell'aeroporto.
            </p>
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
