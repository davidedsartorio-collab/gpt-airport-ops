import { Activity, ArrowUpRight, Plus, ShieldCheck, Plane } from "lucide-react";
import { COSTS, LIMITS, PALETTE as C } from "../sim/constants";
import { eur } from "../sim/selectors";
import { Panel } from "./Panel";

function UpgradeProgress({ value, max, color }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return <div className="upgrade-progress"><span style={{ width: `${pct}%`, background: color }} /></div>;
}

function InvestButton({ icon, label, count, max, cost, upkeep, disabled, onClick, tone, benefit }) {
  const maxed = count >= max;
  const off = disabled || maxed;
  return (
    <button className={`upgrade-card upgrade-card--${tone}`} disabled={off} onClick={onClick} title={`${label}: costo ${eur(cost)}, manutenzione ${eur(upkeep)}/min`}>
      <div className="upgrade-card__art">
        <div className="upgrade-card__icon">{icon}</div>
        <span className="upgrade-card__badge">LV {count}</span>
      </div>
      <div className="upgrade-card__content">
        <div className="upgrade-card__top">
          <span>{label}</span>
          <ArrowUpRight size={14} />
        </div>
        <div className="upgrade-card__benefit">{benefit}</div>
        <UpgradeProgress value={count} max={max} color={tone === "security" ? C.amber : tone === "gate" ? C.teal : C.runway} />
        <div className="upgrade-card__meta">
          <strong>{maxed ? "MAX" : eur(cost)}</strong>
          <span>−{eur(upkeep)}/min</span>
        </div>
      </div>
    </button>
  );
}

export function InvestmentPanel({ state, score, dispatch, compact = false }) {
  return (
    <Panel title="Upgrade aeroporto" icon={<Plus size={14} color={C.green} />} right={`score ${score.toLocaleString("it-IT")}`} className={compact ? "panel--invest-dock" : ""}>
      <div className="upgrade-grid">
        <InvestButton
          tone="security"
          icon={<ShieldCheck size={22} color={C.amber} />}
          label="Security"
          benefit="più corsie, meno coda"
          count={state.lanes}
          max={LIMITS.maxLanes}
          cost={COSTS.lane}
          upkeep={COSTS.laneUpkeep}
          disabled={state.money < COSTS.lane}
          onClick={() => dispatch({ type: "BUY_LANE" })}
        />
        <InvestButton
          tone="gate"
          icon={<Plane size={22} color={C.teal} style={{ transform: "rotate(45deg)" }} />}
          label="Gate"
          benefit="nuove sale boarding"
          count={state.gates}
          max={LIMITS.maxGates}
          cost={COSTS.gate}
          upkeep={COSTS.gateUpkeep}
          disabled={state.money < COSTS.gate}
          onClick={() => dispatch({ type: "BUY_GATE" })}
        />
        <InvestButton
          tone="runway"
          icon={<Activity size={22} color={C.runway} />}
          label="Pista"
          benefit="taxi, torre, luci"
          count={state.runwayLevel}
          max={LIMITS.maxRunway}
          cost={COSTS.runwayBase * state.runwayLevel}
          upkeep={COSTS.runwayUpkeep * state.runwayLevel}
          disabled={state.money < COSTS.runwayBase * state.runwayLevel}
          onClick={() => dispatch({ type: "UPGRADE_RUNWAY" })}
        />
      </div>
    </Panel>
  );
}
