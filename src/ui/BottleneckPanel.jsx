import { AlertTriangle, CheckCircle2, Crosshair } from "lucide-react";
import { PALETTE as C } from "../sim/constants";
import { Panel } from "./Panel";

const COPY = {
  none: { title: "Flusso stabile", impact: "Nessun collo critico", action: "Continua a monitorare: la domanda crescerà." },
  security: { title: "Security sotto pressione", impact: "La coda ai controlli sta bloccando il terminale", action: "Aggiungi una corsia security." },
  gate: { title: "Gate saturi", impact: "I voli aspettano gate liberi", action: "Apri un nuovo gate." },
  runway: { title: "Pista sotto pressione", impact: "Troppi voli pronti, pochi slot pista", action: "Potenzia la pista." },
  boarding: { title: "Imbarco lento", impact: "Passeggeri pronti ma boarding lento", action: "Aggiungi gate o migliora gate ops." },
};

export function BottleneckPanel({ state }) {
  const data = COPY[state.lastBottleneck] || COPY.none;
  const ok = state.lastBottleneck === "none";
  return (
    <Panel title="Banner collo di bottiglia" icon={<Crosshair size={14} color={ok ? C.green : C.amber} />} right="live">
      <div className={`bottleneck-banner ${ok ? "bottleneck-banner--ok" : "bottleneck-banner--warning"}`}>
        <div className="bottleneck-banner__icon">{ok ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}</div>
        <div className="bottleneck-banner__body">
          <div className="bottleneck-banner__title">{data.title}</div>
          <div className="bottleneck-banner__impact">{data.impact}</div>
        </div>
        <div className="bottleneck-banner__action">{data.action}</div>
      </div>
    </Panel>
  );
}
