import { MONO, PALETTE as C } from "../sim/constants";

export function Panel({ title, icon, right, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel__head">
        <div className="panel__title">{icon}{title}</div>
        {right && <div className="panel__right">{right}</div>}
      </div>
      {children}
    </section>
  );
}

export function Readout({ icon, label, value, sub, accent }) {
  return (
    <div className="readout">
      <div className="readout__label">{icon}{label}</div>
      <div className="readout__value" style={{ color: accent || C.text }}>{value}</div>
      {sub && <div className="readout__sub">{sub}</div>}
    </div>
  );
}

export function SpeedButton({ active, onClick, children }) {
  return (
    <button className={`speed-btn ${active ? "speed-btn--active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function TinyTag({ children, tone = "neutral" }) {
  return <span className={`tiny-tag tiny-tag--${tone}`} style={{ fontFamily: MONO }}>{children}</span>;
}
