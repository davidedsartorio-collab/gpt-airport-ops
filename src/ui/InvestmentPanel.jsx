import { Activity, Plus, ShieldCheck, Plane } from "lucide-react";
import { COSTS, LIMITS, PALETTE as C } from "../sim/constants";
import { eur } from "../sim/selectors";
import { Panel } from "./Panel";

function InvestButton({ icon, label, count, max, cost, upkeep, disabled, onClick, hint }) {
  const maxed = count >= max;
  const off = disabled || maxed;
  return (
    <button className="invest-btn" disabled={off} onClick={onClick} type="button">
      <div className="invest-btn__top">
        <span>{icon}{label}</span>
        <strong>×{count}</strong>
      </div>
      <div className="invest-btn__bottom">
        <span>{maxed ? "max" : eur(cost)}</span>
        <span>−{eur(upkeep)}/min</span>
      </div>
      {hint && <div className="invest-btn__hint">{hint}</div>}
    </button>
  );
}

function InvestmentContent({ state, dispatch }) {
  return (
    <div className="invest-grid">
      <InvestButton
        icon={<ShieldCheck size={15} color={C.amber} />}
        label="Corsia security"
        count={state.lanes}
        max={LIMITS.maxLanes}
        cost={COSTS.lane}
        upkeep={COSTS.laneUpkeep}
        disabled={state.money < COSTS.lane}
        onClick={() => dispatch({ type: "BUY_LANE" })}
        hint="Riduce code e attesa"
      />
      <InvestButton
        icon={<Plane size={15} color={C.teal} style={{ transform: "rotate(45deg)" }} />}
        label="Nuovo gate"
        count={state.gates}
        max={LIMITS.maxGates}
        cost={COSTS.gate}
        upkeep={COSTS.gateUpkeep}
        disabled={state.money < COSTS.gate}
        onClick={() => dispatch({ type: "BUY_GATE" })}
        hint="Più voli in boarding"
      />
      <InvestButton
        icon={<Activity size={15} color={C.runway} />}
        label="Potenzia pista"
        count={state.runwayLevel}
        max={LIMITS.maxRunway}
        cost={COSTS.runwayBase * state.runwayLevel}
        upkeep={COSTS.runwayUpkeep * state.runwayLevel}
        disabled={state.money < COSTS.runwayBase * state.runwayLevel}
        onClick={() => dispatch({ type: "UPGRADE_RUNWAY" })}
        hint="Taxi, torre e luci pista"
      />
    </div>
  );
}

export function InvestmentPanel({ state, score, dispatch, variant = "panel" }) {
  if (variant === "bar") {
    return (
      <section className="upgrade-bar">
        <div className="upgrade-bar__head">
          <div><Plus size={15} color={C.green} /> Investimenti</div>
          <span>score {score.toLocaleString("it-IT")}</span>
        </div>
        <InvestmentContent state={state} dispatch={dispatch} />
      </section>
    );
  }

  return (
    <Panel title="Investimenti" icon={<Plus size={14} color={C.green} />} right={`score ${score.toLocaleString("it-IT")}`}>
      <InvestmentContent state={state} dispatch={dispatch} />
      <p className="panel-note">Ogni upgrade deve sentirsi anche a schermo: più corsie, gate lounge più ricchi e runway più strutturata. Compra leggendo il flusso, non solo i numeri.</p>
    </Panel>
  );
}
