import { PALETTE as C } from "../sim/constants";

export function Sprite({ className = "", style, children, title }) {
  return <div className={`scene-sprite ${className}`} style={style} title={title}>{children}</div>;
}

export function LabelSign({ label, icon = "", className = "", style }) {
  return (
    <Sprite className={`asset-sign ${className}`} style={style}>
      <span>{label}</span>
      {icon && <b>{icon}</b>}
    </Sprite>
  );
}

export function WallFrame({ children, className = "", style }) {
  return <div className={`terminal-frame ${className}`} style={style}>{children}</div>;
}

export function Zone({ className = "", label, children, style }) {
  return (
    <section className={`scene-zone ${className}`} style={style}>
      {label && <LabelSign label={label} className="zone-sign" />}
      {children}
    </section>
  );
}

export function Plant({ style, size = "md" }) {
  return (
    <Sprite className={`asset-plant asset-plant--${size}`} style={style}>
      <i /><i /><i /><i /><em />
    </Sprite>
  );
}

export function Bench({ style, seats = 4, className = "" }) {
  return (
    <Sprite className={`asset-bench ${className}`} style={style}>
      {Array.from({ length: seats }).map((_, i) => <i key={i} />)}
    </Sprite>
  );
}

export function FlightBoard({ style, label = "AZ 214", sub = "ON TIME" }) {
  return (
    <Sprite className="asset-flight-board" style={style}>
      <b>{label}</b>
      <small>{sub}</small>
    </Sprite>
  );
}

export function AutoDoors({ style }) {
  return (
    <Sprite className="asset-auto-doors" style={style}>
      <i /><i /><span />
    </Sprite>
  );
}

export function InfoDesk({ style }) {
  return (
    <Sprite className="asset-info-desk" style={style}>
      <b>i</b>
      <span />
    </Sprite>
  );
}

export function CheckInCounter({ style, index = 1, active = true, color = "#4da3ff" }) {
  return (
    <Sprite className={`asset-checkin ${active ? "asset-checkin--active" : ""}`} style={{ ...style, "--counter-color": color }}>
      <div className="asset-checkin__screen">D{index}</div>
      <div className="asset-checkin__agent" />
      <div className="asset-checkin__desk" />
      <div className="asset-checkin__monitor" />
    </Sprite>
  );
}

export function RopeMaze({ style, rows = 3, cols = 4, danger = false }) {
  const posts = [];
  for (let y = 0; y < rows; y += 1) for (let x = 0; x < cols; x += 1) posts.push(`${x}-${y}`);
  return (
    <Sprite className={`asset-rope-maze ${danger ? "asset-rope-maze--danger" : ""}`} style={{ ...style, "--maze-rows": rows, "--maze-cols": cols }}>
      {posts.map((id) => <i key={id} />)}
    </Sprite>
  );
}

export function BaggageBelt({ style, bags = 5, className = "" }) {
  return (
    <Sprite className={`asset-baggage-belt ${className}`} style={style}>
      <div className="asset-baggage-belt__track">
        {Array.from({ length: bags }).map((_, i) => (
          <Suitcase
            key={i}
            className={`belt-bag belt-bag--${i % 5}`}
            style={{ left: `${8 + (i / Math.max(1, bags - 1)) * 76}%`, top: `${42 + (i % 2) * 14}%`, animationDelay: `${i * -0.55}s` }}
          />
        ))}
      </div>
    </Sprite>
  );
}

export function Suitcase({ style, className = "", color }) {
  return (
    <Sprite className={`asset-suitcase ${className}`} style={{ ...style, "--bag-color": color }}>
      <i />
    </Sprite>
  );
}

export function SecurityLane({ style, active = true, danger = false, index = 0 }) {
  return (
    <Sprite className={`asset-security-lane ${active ? "asset-security-lane--active" : ""} ${danger ? "asset-security-lane--danger" : ""}`} style={{ ...style, "--lane-i": index }}>
      <div className="asset-security-lane__light" />
      <div className="asset-security-lane__arch" />
      <div className="asset-security-lane__belt" />
      <div className="asset-security-lane__bins"><i /><i /><i /></div>
    </Sprite>
  );
}

export function GatePod({ style, code = "A1", state = "free", progress = 0, className = "" }) {
  return (
    <Sprite className={`asset-gate-pod asset-gate-pod--${state} ${className}`} style={{ ...style, "--gate-progress": `${Math.max(0, Math.min(100, progress))}%` }}>
      <div className="asset-gate-pod__screen">{code}</div>
      <div className="asset-gate-pod__light" />
      <div className="asset-gate-pod__desk" />
      <div className="asset-gate-pod__progress"><span /></div>
      <div className="asset-gate-pod__bridge" />
    </Sprite>
  );
}

export function SeatIsland({ style, rows = 2, cols = 4 }) {
  return (
    <Sprite className="asset-seat-island" style={{ ...style, "--seat-cols": cols }}>
      {Array.from({ length: rows * cols }).map((_, i) => <i key={i} />)}
    </Sprite>
  );
}

export function Cafe({ style }) {
  return (
    <Sprite className="asset-cafe" style={style}>
      <LabelSign label="CAFÈ" icon="☕" />
      <div className="asset-cafe__counter"><i /><i /><i /></div>
      <div className="asset-cafe__table" />
      <div className="asset-cafe__chair asset-cafe__chair--a" />
      <div className="asset-cafe__chair asset-cafe__chair--b" />
    </Sprite>
  );
}

export function Passenger({ style, color = C.blue, mood = "ok", className = "", delay = 0, size = "md" }) {
  return (
    <Sprite
      className={`asset-passenger asset-passenger--${mood} asset-passenger--${size} ${className}`}
      style={{ ...style, "--npc-color": color, "--npc-delay": `${delay}s` }}
    >
      <i className="asset-passenger__backpack" />
      <i className="asset-passenger__body" />
      <i className="asset-passenger__visor" />
      <i className="asset-passenger__foot asset-passenger__foot--a" />
      <i className="asset-passenger__foot asset-passenger__foot--b" />
      {mood !== "ok" && <b />}
    </Sprite>
  );
}

export function ServiceWorker({ style }) {
  return <Passenger style={style} color="#f6a623" mood="ok" className="asset-passenger--worker" size="sm" />;
}

export function Bus({ style }) {
  return (
    <Sprite className="asset-bus" style={style}>
      <div className="asset-bus__stripe" />
      <i /><i /><i /><i />
      <b className="wheel wheel--a" /><b className="wheel wheel--b" />
    </Sprite>
  );
}

export function ServiceCart({ style }) {
  return (
    <Sprite className="asset-service-cart" style={style}>
      <i /><i /><b />
    </Sprite>
  );
}

export function Plane({ style, active = true }) {
  return (
    <Sprite className={`asset-plane ${active ? "asset-plane--active" : ""}`} style={style}>
      <div className="asset-plane__shadow" />
      <div className="asset-plane__wing asset-plane__wing--top" />
      <div className="asset-plane__wing asset-plane__wing--bottom" />
      <div className="asset-plane__tail asset-plane__tail--top" />
      <div className="asset-plane__tail asset-plane__tail--bottom" />
      <div className="asset-plane__body">
        <i /><i /><i /><i /><i />
      </div>
    </Sprite>
  );
}

export function FloorArrow({ style, direction = "right", label = "" }) {
  return (
    <Sprite className={`floor-arrow floor-arrow--${direction}`} style={style}>
      <span>{label}</span>
    </Sprite>
  );
}

export function ApronMarkings({ style, upgraded = false }) {
  return (
    <Sprite className={`asset-apron-markings ${upgraded ? "asset-apron-markings--upgraded" : ""}`} style={style}>
      <i className="taxi-line" />
      <i className="stand-line" />
      <i className="cone cone--a" />
      <i className="cone cone--b" />
      <i className="crate crate--a" />
      <i className="crate crate--b" />
    </Sprite>
  );
}

export function MiniBadge({ style, tone = "ok", children }) {
  return <Sprite className={`scene-mini-badge scene-mini-badge--${tone}`} style={style}>{children}</Sprite>;
}
