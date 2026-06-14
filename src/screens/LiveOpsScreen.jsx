import { useState } from "react";
import { Activity, ArrowLeft, CheckCircle2, ClipboardList, Coins, HelpCircle, Pause, Plane, Play, Star, Timer, TrendingUp, X } from "lucide-react";
import { PALETTE as C } from "../sim/constants";
import { clock, eur, getUiStats } from "../sim/selectors";
import { TerminalCanvas } from "../render/TerminalCanvas";
import { EventBanner } from "../ui/EventBanner";
import { GatePanel } from "../ui/GatePanel";
import { InvestmentPanel } from "../ui/InvestmentPanel";
import { BottleneckPanel } from "../ui/BottleneckPanel";
import { SpeedButton, TinyTag } from "../ui/Panel";

const KPI_HELP = {
  cash: "Denaro disponibile. Se scende sotto zero il turno finisce.",
  rep: "Misura la qualità percepita dai passeggeri. Code e ritardi la fanno calare.",
  pax: "Passeggeri processati e partiti nell'ultima ora di gioco.",
  wait: "Tempo medio stimato in coda ai controlli security.",
  punctuality: "Percentuale di voli partiti entro il limite di puntualità.",
  ops: "Sintesi rapida di gate occupati e livello pista.",
};

function HudPill({ icon, label, value, tone = "neutral", help }) {
  return (
    <div className={`hud-pill hud-pill--${tone}`} title={help}>
      <div className="hud-pill__label">{icon}{label}<HelpCircle size={11} /></div>
      <div className="hud-pill__value">{value}</div>
    </div>
  );
}

function shortObjective(objective = "") {
  return objective
    .replace("Servi ", "")
    .replace("Puntualità sopra il ", "Punt. > ")
    .replace("Puntualità sopra ", "Punt. > ")
    .replace("Non andare in rosso", "No rosso")
    .replace("Chiudi con reputazione ", "Rep. ");
}

function MissionTicker({ objectives, onOpen }) {
  const compact = objectives?.slice(0, 3) || [];
  return (
    <button className="mission-trigger" onClick={onOpen} title="Apri obiettivi missione">
      <span className="mission-trigger__icon"><ClipboardList size={16} /></span>
      <span className="mission-trigger__label">Missione</span>
      <span className="mission-trigger__ticks">
        {compact.map((objective) => <b key={objective}>{shortObjective(objective)}</b>)}
      </span>
    </button>
  );
}

function MissionModal({ state, stats, onClose }) {
  const objectives = state.objectives || [];
  const progress = [
    { label: objectives[0] || "Servi passeggeri", value: `${state.departedPax.toLocaleString("it-IT")} pax`, pct: Math.min(100, Math.round((state.departedPax / 2000) * 100)) },
    { label: objectives[1] || "Mantieni puntualità", value: `${stats.onTimePct}%`, pct: Math.min(100, stats.onTimePct) },
    { label: objectives[2] || "Non andare in rosso", value: eur(state.money), pct: state.money > 0 ? 100 : 0 },
    { label: objectives[3] || "Proteggi reputazione", value: `${Math.round(state.reputation)}%`, pct: Math.min(100, Math.round(state.reputation)) },
  ];

  return (
    <div className="mission-overlay" role="dialog" aria-modal="true">
      <div className="mission-dialog">
        <button className="mission-dialog__close" onClick={onClose} title="Chiudi missione"><X size={16} /></button>
        <div className="mission-dialog__kicker">Obiettivi aeroporto</div>
        <h2>{state.airportName}</h2>
        <p>Completa gli obiettivi per ottenere stelle e sbloccare il prossimo aeroporto.</p>
        <div className="mission-progress-list">
          {progress.map((item) => (
            <div className="mission-progress" key={item.label}>
              <div className="mission-progress__top"><span>{item.label}</span><strong>{item.value}</strong></div>
              <div className="mission-progress__bar"><span style={{ width: `${item.pct}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="mission-dialog__reward"><CheckCircle2 size={15} /> Ricompensa: nuova rotta e aeroporto successivo</div>
      </div>
    </div>
  );
}

export function LiveOpsScreen({ state, dispatch, onBack }) {
  const [missionOpen, setMissionOpen] = useState(false);
  const stats = getUiStats(state);
  const bottleneckTone = state.lastBottleneck === "none" ? "ok" : "warning";

  return (
    <div className="app-shell" style={{ "--airport-primary": state.airportTheme?.primary, "--airport-secondary": state.airportTheme?.secondary }}>
      <div className="app-bg app-bg--one" />
      <div className="app-bg app-bg--two" />
      <main className="app app--compact">
        <header className="topbar topbar--compact">
          <div className="topbar__brand-group">
            <button className="back-btn" onClick={onBack} title="Torna alla mappa aeroporti"><ArrowLeft size={16} /></button>
            <div>
              <div className="brand"><Plane size={22} style={{ transform: "rotate(45deg)" }} /> Airport <span>Ops</span></div>
              <div className="subtitle">{state.airportName} · vista operativa live</div>
            </div>
          </div>
          <MissionTicker objectives={state.objectives} onOpen={() => setMissionOpen(true)} />
          <div className="topbar__right">
            {state.upgradeNotice && <TinyTag tone="ok">UPGRADE: {state.upgradeNotice.label.toUpperCase()}</TinyTag>}
            <TinyTag tone={bottleneckTone}>COLLO: {state.lastBottleneck.toUpperCase()}</TinyTag>
            <div className="clock-box">{clock(state.minute)}</div>
            <div className="speed-group">
              <SpeedButton active={!state.running} onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}><Pause size={15} /></SpeedButton>
              {[1, 2, 3].map((v) => <SpeedButton key={v} active={state.running && state.speed === v} onClick={() => dispatch({ type: "SET_SPEED", speed: v })}>{v === 1 ? <Play size={15} /> : `${v}×`}</SpeedButton>)}
            </div>
          </div>
        </header>

        <EventBanner event={state.event} />

        <section className="hud-strip hud-strip--compact">
          <HudPill icon={<Coins size={13} />} label="Cassa" value={eur(state.money)} tone={state.money < 8000 ? "danger" : "neutral"} help={KPI_HELP.cash} />
          <HudPill icon={<Star size={13} />} label="Reputazione" value={`${Math.round(state.reputation)}%`} tone={state.reputation > 60 ? "ok" : state.reputation > 30 ? "warning" : "danger"} help={KPI_HELP.rep} />
          <HudPill icon={<TrendingUp size={13} />} label="Passeggeri/ora" value={state.throughput.toLocaleString("it-IT")} tone="info" help={KPI_HELP.pax} />
          <HudPill icon={<Timer size={13} />} label="Attesa media" value={`${Math.round(state.estWait)} min`} tone={state.estWait > 14 ? "danger" : state.estWait > 8 ? "warning" : "ok"} help={KPI_HELP.wait} />
          <HudPill icon={<Plane size={13} style={{ transform: "rotate(45deg)" }} />} label="Puntualità" value={`${stats.onTimePct}%`} tone={stats.onTimePct >= 75 ? "ok" : "warning"} help={KPI_HELP.punctuality} />
          <HudPill icon={<Activity size={13} />} label="Operatività" value={`G${state.occCount}/${state.gates} · P${state.runwayLevel}`} tone="neutral" help={KPI_HELP.ops} />
        </section>

        <InvestmentPanel state={state} score={stats.score} dispatch={dispatch} compact />

        <section className="play-grid">
          <div className="map-card map-card--gameplay">
            <div className="map-card__head map-card__head--compact">
              <div><Activity size={14} color={C.teal} /> Vista operativa</div>
              <div className="map-card__legend map-card__legend--chips">
                <span><b className="legend legend--blue" /> passeggeri</span>
                <span><b className="legend legend--orange" /> attesa</span>
                <span><b className="legend legend--red" /> critico</span>
                <span><b className="legend legend--bag" /> bagagli</span>
                <span><b className="legend legend--upgrade" /> upgrade</span>
              </div>
            </div>
            <TerminalCanvas state={state} />
          </div>

          <aside className="ops-side">
            <BottleneckPanel state={state} />
            <GatePanel state={state} waitingFlights={stats.waitingFlights} />
          </aside>
        </section>
      </main>

      {missionOpen && <MissionModal state={state} stats={stats} onClose={() => setMissionOpen(false)} />}

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
