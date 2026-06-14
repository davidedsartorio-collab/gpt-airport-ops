import { AlertTriangle, Crosshair } from "lucide-react";
import { PALETTE as C } from "../sim/constants";
import { Panel } from "./Panel";

const COPY = {
  none: { title: "Flusso stabile", impact: "Nessun collo critico", action: "Continua a monitorare: la domanda crescerà." },
  security: { title: "Security satura", impact: "La coda security sta rallentando tutto il terminale", action: "Aggiungi una corsia o preparati a ritardi." },
  gate: { title: "Gate pieni", impact: "I voli aspettano gate liberi", action: "Compra un nuovo gate o aumenta la capacità di boarding." },
  runway: { title: "Pista sotto pressione", impact: "Troppi voli pronti, pochi slot pista", action: "Potenzia la pista; con maltempo la capacità cala." },
  boarding: { title: "Boarding lento", impact: "I passeggeri hanno superato la security, ma i gate non assorbono", action: "Espandi gate o migliora il flusso verso l'imbarco." },
};

export function BottleneckPanel({ state }) {
  const data = COPY[state.lastBottleneck] || COPY.none;
  const tone = state.lastBottleneck === "none" ? "ok" : "warning";
  return (
    <Panel title="Ops AI" icon={<Crosshair size={14} color={tone === "ok" ? C.green : C.amber} />} right="detector">
      <div className={`bottleneck bottleneck--${tone}`}>
        <div className="bottleneck__title">{tone !== "ok" && <AlertTriangle size={14} />} {data.title}</div>
        <div className="bottleneck__impact">{data.impact}</div>
        <div className="bottleneck__action">Azione consigliata: {data.action}</div>
      </div>
    </Panel>
  );
}
