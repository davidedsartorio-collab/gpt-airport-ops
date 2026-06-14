import { useState } from "react";
import { Activity, ArrowLeft, CheckCircle2, ClipboardList, Coins, HelpCircle, Pause, Plane, Play, Star, Timer, TrendingUp, Trophy, X } from "lucide-react";
import { PALETTE as C } from "../sim/constants";
import { clock, eur, getUiStats } from "../sim/selectors";
import { missionMinutesLeft } from "../sim/objectives";
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

function MissionTicker({ state, onOpen }) {
  const progress = state.missionProgress?.slice(0, 3) || [];
  const left = missionMinutesLeft(state);
  const hours = Math.floor(left / 60);
  const mins = left % 60;
  return (
    <button className="mission-trigger mission-trigger--v12" onClick={onOpen} title="Apri obiettivi missione">
      <span className="mission-trigger__icon"><ClipboardList size={16} /></span>
      <span className="mission-trigger__label">Missione</span>
      <span className="mission-trigger__ticks">
        <b>{hours}h {mins}m</b>
        {progress.map((objective) => <b className={objective.complete ? "mission-chip--done" : ""} key={objective.id}>{objective.complete ? "✓ " : ""}{shortObjective(objective.label)}</b>)}
      </span>
    </button>
  );
}

function MissionModal({ state, stats, onClose }) {
  const progress = state.missionProgress || [];
  return (
    <div className="mission-overlay" role="dialog" aria-modal="true">
      <div className="mission-dialog mission-dialog--v12">
        <button className="mission-dialog__close" onClick={onClose} title="Chiudi missione"><X size={16} /></button>
        <div className="mission-dialog__kicker">Turno operativo · obiettivi veri</div>
        <h2>{state.airportName}</h2>
        <p>La missione finisce a fine giornata. Gli obiettivi vengono valutati dal codice, non sono più solo testo.</p>
        <div className="mission-timebar">
          <span style={{ width: `${Math.min(100, Math.round(((state.minute - state.dayStartMinute) / state.dayLength) * 100))}%` }} />
        </div>
        <div className="mission-progress-list">
          {progress.map((item) => (
            <div className={`mission-progress ${item.complete ? "mission-progress--done" : ""}`} key={item.id}>
              <div className="mission-progress__top">
                <span>{item.complete ? "✓ " : ""}{item.label}</span>
                <strong>{item.value}{item.type === "pax" ? " pax" : item.type === "cash" ? " €" : item.type === "wait" ? " min" : item.type === "runway" ? " LV" : "%"}</strong>
              </div>
              <div className="mission-progress__bar"><span style={{ width: `${item.pct}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="mission-dialog__reward"><CheckCircle2 size={15} /> 2 stelle sbloccano l'aeroporto successivo</div>
      </div>
    </div>
  );
}

function MissionResultModal({ state, stats, dispatch, onBack }) {
  const result = state.missionResult || { stars: 0, completed: 0, total: 4, progress: [] };
  const stars = Array.from({ length: 3 }).map((_, i) => <Star key={i} size={30} className={i < result.stars ? "result-star result-star--on" : "result-star"} />);
  return (
    <div className="modal-backdrop">
      <div className="gameover-modal mission-result-modal">
        <div className="gameover-modal__kicker">Fine giornata operativa</div>
        <div className="mission-result-stars">{stars}</div>
        <div className="gameover-modal__title">{result.success ? "Missione completata" : "Missione non riuscita"}</div>
        <div className="gameover-modal__stats">
          Obiettivi <strong>{result.completed}/{result.total}</strong><br />
          {state.departedPax.toLocaleString("it-IT")} pax · {state.departedFlights} voli · {stats.onTimePct}% puntualità
        </div>
        <div className="mission-result-list">
          {result.progress?.map((o) => <span key={o.id} className={o.complete ? "done" : "miss"}>{o.complete ? "✓" : "×"} {o.label}</span>)}
        </div>
        <div className="mission-result-actions">
          <button className="reset-btn" onClick={() => dispatch({ type: "RESET" })}>Riprova missione</button>
          <button className="reset-btn reset-btn--secondary" onClick={onBack}>Mappa aeroporti</button>
        </div>
        {result.unlockNext && <p className="mission-unlock-note">Nuovo aeroporto sbloccato nella mappa campagna.</p>}
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
              <div className="subtitle">{state.airportName} · turno con win/fail</div>
            </div>
          </div>
          <MissionTicker state={state} onOpen={() => setMissionOpen(true)} />
          <div className="topbar__right">
            {state.upgradeNotice && <TinyTag tone="ok">UPGRADE: {state.upgradeNotice.label.toUpperCase()}</TinyTag>}
            <TinyTag tone={bottleneckTone}>COLLO: {state.lastBottleneck.toUpperCase()}</TinyTag>
            <div className="clock-box">DAY · {clock(state.minute)}</div>
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
              <div><Activity size={14} color={C.teal} /> Vista operativa Pixi</div>
              <div className="map-card__legend map-card__legend--chips">
                <span><b className="legend legend--blue" /> passeggeri</span>
                <span><b className="legend legend--orange" /> attesa</span>
                <span><b className="legend legend--red" /> critico</span>
                <span><b className="legend legend--bag" /> bagagli</span>
                <span><b className="legend legend--upgrade" /> missione</span>
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
      {state.missionComplete && <MissionResultModal state={state} stats={stats} dispatch={dispatch} onBack={onBack} />}

      {state.gameOver && (
        <div className="modal-backdrop">
          <div className="gameover-modal">
            <div className="gameover-modal__kicker">Missione fallita</div>
            <div className="gameover-modal__title">{state.failReason || "Turno finito"}</div>
            <div className="gameover-modal__stats">Score <strong>{stats.score.toLocaleString("it-IT")}</strong><br />{state.departedPax.toLocaleString("it-IT")} pax · {state.departedFlights} voli · {stats.onTimePct}% puntualità</div>
            <button className="reset-btn" onClick={() => dispatch({ type: "RESET" })}>Ricomincia il turno</button>
          </div>
        </div>
      )}
    </div>
  );
}
