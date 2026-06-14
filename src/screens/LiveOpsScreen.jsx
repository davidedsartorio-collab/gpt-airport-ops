import { Activity, ArrowLeft, ClipboardList, Coins, HelpCircle, Pause, Plane, Play, ShieldAlert, Star, Timer, TrendingUp, X } from "lucide-react";
import { PALETTE as C } from "../sim/constants";
import { clock, eur, getUiStats } from "../sim/selectors";
import { TerminalCanvas } from "../render/TerminalCanvas";
import { EventBanner } from "../ui/EventBanner";
import { GatePanel } from "../ui/GatePanel";
import { InvestmentPanel } from "../ui/InvestmentPanel";
import { BottleneckPanel } from "../ui/BottleneckPanel";
import { SpeedButton, TinyTag } from "../ui/Panel";
import { useState } from "react";

const KPI_HELP = {
  cash: {
    title: "Cassa",
    body: "Soldi disponibili. Aumentano con i passeggeri partiti e scendono con investimenti e costi operativi al minuto.",
  },
  reputation: {
    title: "Reputazione",
    body: "Misura quanto l'aeroporto sta performando. Code troppo lunghe e ritardi la fanno scendere; voli puntuali la migliorano.",
  },
  throughput: {
    title: "Passeggeri/ora",
    body: "Quanti passeggeri sono stati serviti e fatti partire nell'ultima ora di gioco. È il KPI chiave dell'efficienza.",
  },
  wait: {
    title: "Attesa media",
    body: "Stima del tempo in coda alla security. Se sale troppo, la reputazione crolla e i voli rischiano ritardi.",
  },
  punctuality: {
    title: "Puntualità",
    body: "Percentuale di voli partiti entro il limite di tempo previsto. È il cuore della qualità operativa.",
  },
  ops: {
    title: "Operatività",
    body: "Riassume gate occupati e livello pista. Ti dice quanto è saturo il sistema operativo dell'aeroporto.",
  },
};

function HudPill({ icon, label, value, tone = "neutral", helpKey, active, onClick }) {
  return (
    <button className={`hud-pill hud-pill--${tone} ${active ? "hud-pill--active" : ""}`} onClick={() => onClick(helpKey)} type="button">
      <div className="hud-pill__label">{icon}{label}<HelpCircle size={11} /></div>
      <div className="hud-pill__value">{value}</div>
    </button>
  );
}

function MissionButton({ onClick, state }) {
  return (
    <button className="mission-btn" onClick={onClick} type="button">
      <ClipboardList size={16} />
      <span>Missione</span>
      <strong>{state.objectives?.length || 0}</strong>
    </button>
  );
}

function MissionOverlay({ state, stats, onClose }) {
  return (
    <div className="mission-overlay" onClick={onClose}>
      <div className="mission-popover" onClick={(e) => e.stopPropagation()}>
        <button className="mission-popover__close" onClick={onClose} type="button"><X size={16} /></button>
        <div className="mission-popover__kicker">Obiettivo aeroporto</div>
        <h2>{state.airportName}</h2>
        <p>Completa la missione mantenendo il sistema stabile: cassa positiva, reputazione alta, flussi veloci e voli puntuali.</p>
        <div className="mission-progress-grid">
          <span><strong>{state.departedPax.toLocaleString("it-IT")}</strong> pax serviti</span>
          <span><strong>{stats.onTimePct}%</strong> puntualità</span>
          <span><strong>{Math.round(state.reputation)}%</strong> reputazione</span>
        </div>
        <div className="mission-list">
          {state.objectives?.map((objective) => <div key={objective}>◆ {objective}</div>)}
        </div>
      </div>
    </div>
  );
}

function KpiHelp({ helpKey }) {
  if (!helpKey) return null;
  const help = KPI_HELP[helpKey];
  if (!help) return null;
  return (
    <div className="kpi-help">
      <strong>{help.title}</strong>
      <span>{help.body}</span>
    </div>
  );
}

export function LiveOpsScreen({ state, dispatch, onBack }) {
  const stats = getUiStats(state);
  const [activeHelp, setActiveHelp] = useState(null);
  const [missionOpen, setMissionOpen] = useState(false);
  const bottleneckTone = state.lastBottleneck === "none" ? "ok" : "warning";

  const toggleHelp = (key) => setActiveHelp((current) => (current === key ? null : key));

  return (
    <div className="app-shell" style={{ "--airport-primary": state.airportTheme?.primary, "--airport-secondary": state.airportTheme?.secondary }}>
      <div className="app-bg app-bg--one" />
      <div className="app-bg app-bg--two" />
      <main className="app app--single-screen">
        <header className="topbar topbar--v6">
          <div className="topbar__brand-group">
            <button className="back-btn" onClick={onBack} title="Torna alla mappa aeroporti"><ArrowLeft size={16} /></button>
            <div>
              <div className="brand"><Plane size={22} style={{ transform: "rotate(45deg)" }} /> Airport <span>Ops</span></div>
              <div className="subtitle">{state.airportName} · vista operativa live</div>
            </div>
            <MissionButton state={state} onClick={() => setMissionOpen(true)} />
          </div>
          <div className="topbar__right">
            <TinyTag tone={bottleneckTone}>COLLO: {state.lastBottleneck.toUpperCase()}</TinyTag>
            <div className="clock-box">{clock(state.minute)}</div>
            <div className="speed-group">
              <SpeedButton active={!state.running} onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}><Pause size={15} /></SpeedButton>
              {[1, 2, 3].map((v) => <SpeedButton key={v} active={state.running && state.speed === v} onClick={() => dispatch({ type: "SET_SPEED", speed: v })}>{v === 1 ? <Play size={15} /> : `${v}×`}</SpeedButton>)}
            </div>
          </div>
        </header>

        <EventBanner event={state.event} />

        <section className="hud-strip hud-strip--v6">
          <HudPill helpKey="cash" active={activeHelp === "cash"} onClick={toggleHelp} icon={<Coins size={13} />} label="Cassa" value={eur(state.money)} tone={state.money < 8000 ? "danger" : "neutral"} />
          <HudPill helpKey="reputation" active={activeHelp === "reputation"} onClick={toggleHelp} icon={<Star size={13} />} label="Reputazione" value={`${Math.round(state.reputation)}%`} tone={state.reputation > 60 ? "ok" : state.reputation > 30 ? "warning" : "danger"} />
          <HudPill helpKey="throughput" active={activeHelp === "throughput"} onClick={toggleHelp} icon={<TrendingUp size={13} />} label="Passeggeri/ora" value={state.throughput.toLocaleString("it-IT")} tone="info" />
          <HudPill helpKey="wait" active={activeHelp === "wait"} onClick={toggleHelp} icon={<Timer size={13} />} label="Attesa media" value={`${Math.round(state.estWait)} min`} tone={state.estWait > 14 ? "danger" : state.estWait > 8 ? "warning" : "ok"} />
          <HudPill helpKey="punctuality" active={activeHelp === "punctuality"} onClick={toggleHelp} icon={<Plane size={13} style={{ transform: "rotate(45deg)" }} />} label="Puntualità" value={`${stats.onTimePct}%`} tone={stats.onTimePct >= 75 ? "ok" : "warning"} />
          <HudPill helpKey="ops" active={activeHelp === "ops"} onClick={toggleHelp} icon={<ShieldAlert size={13} />} label="Operatività" value={`G${state.occCount}/${state.gates} · P${state.runwayLevel}`} tone="neutral" />
        </section>
        <KpiHelp helpKey={activeHelp} />

        <InvestmentPanel state={state} score={stats.score} dispatch={dispatch} variant="bar" />

        <section className="ops-layout">
          <div className="map-card map-card--gameplay map-card--v6">
            <div className="map-card__head">
              <div><Activity size={15} color={C.teal} /> Vista operativa</div>
              <div className="map-card__legend">
                <span><b className="legend legend--blue" /> pax</span>
                <span><b className="legend legend--orange" /> attesa</span>
                <span><b className="legend legend--red" /> critico</span>
                <span><b className="legend legend--bag" /> bagagli</span>
              </div>
            </div>
            <TerminalCanvas state={state} />
          </div>

          <aside className="ops-side">
            <BottleneckPanel state={state} />
            <GatePanel state={state} waitingFlights={stats.waitingFlights} compact />
          </aside>
        </section>
      </main>

      {missionOpen && <MissionOverlay state={state} stats={stats} onClose={() => setMissionOpen(false)} />}

      {state.gameOver && (
        <div className="modal-backdrop">
          <div className="gameover-modal">
            <div className="gameover-modal__kicker">{state.reputation <= 0 ? "Reputazione a zero" : "Bancarotta"}</div>
            <div className="gameover-modal__title">Turno finito</div>
            <div className="gameover-modal__stats">Score <strong>{stats.score.toLocaleString("it-IT")}</strong><br />{state.departedPax.toLocaleString("it-IT")} pax · {state.departedFlights} voli · {stats.onTimePct}% puntualità</div>
            <button className="reset-btn" onClick={() => dispatch({ type: "RESET" })}>Ricomincia il turno</button>
          </div>
        </div>
      )}
    </div>
  );
}
