import { AlertTriangle, Crosshair } from "lucide-react";
import { PALETTE as C } from "../sim/constants";
import { Panel } from "./Panel";

const COPY = {
  none: { title: "Flow stabile", impact: "Nessun collo critico", action: "Continua a monitorare: la domanda crescerà." },
  security: { title: "Security overload", impact: "La coda terminale sta mangiando throughput", action: "Compra una corsia o riduci nuovi voli." },
  gate: { title: "Gate saturation", impact: "I voli aspettano gate liberi", action: "Aggiungi gate o aumenta velocità boarding." },
  runway: { title: "Runway bottleneck", impact: "Troppi voli ready ma pochi slot pista", action: "Potenzia pista; in meteo la capacità cala." },
  boarding: { title: "Boarding flow", impact: "Pax filtrati ma boarding lento", action: "Aggiungi gate o migliora gate ops." },
};

export function BottleneckPanel({ state }) {
  const data = COPY[state.lastBottleneck] || COPY.none;
  const tone = state.lastBottleneck === "none" ? "ok" : "warning";
  return (
    <Panel title="Ops AI" icon={<Crosshair size={14} color={tone === "ok" ? C.green : C.amber} />} right="bottleneck detector">
      <div className={`bottleneck bottleneck--${tone}`}>
        <div className="bottleneck__title">{tone !== "ok" && <AlertTriangle size={14} />} {data.title}</div>
        <div className="bottleneck__impact">{data.impact}</div>
        <div className="bottleneck__action">Suggested action: {data.action}</div>
      </div>
    </Panel>
  );
}
