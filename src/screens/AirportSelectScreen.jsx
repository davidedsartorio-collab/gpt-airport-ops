import { Lock, Plane, Play, Star, Trophy } from "lucide-react";
import { AIRPORTS } from "../data/airportTemplates";

function Difficulty({ level }) {
  return (
    <div className="difficulty" aria-label={`difficulty ${level}`}>
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className={i < level ? "difficulty__pip difficulty__pip--on" : "difficulty__pip"} />
      ))}
    </div>
  );
}

export function AirportSelectScreen({ onStart }) {
  return (
    <div className="select-shell">
      <div className="select-bg select-bg--blue" />
      <div className="select-bg select-bg--orange" />
      <main className="airport-select">
        <header className="select-hero">
          <div>
            <div className="select-kicker">Airport Ops · Campaign v0.3</div>
            <h1>Choose your first airport world</h1>
            <p>
              The game is moving toward a double view: a world progression map, then a live 2D terminal where the little passengers make bottlenecks visible.
            </p>
          </div>
          <div className="select-emblem">
            <Plane size={36} style={{ transform: "rotate(45deg)" }} />
            <span>OPS</span>
          </div>
        </header>

        <section className="world-map-card">
          <div className="world-map-card__head">
            <span>World route</span>
            <span>Earth → Ocean → Mars → Orbital</span>
          </div>
          <div className="world-path">
            {AIRPORTS.map((airport, index) => (
              <div key={airport.id} className={`world-node world-node--${airport.status}`} style={{ "--node-color": airport.theme.primary }}>
                <div className="world-node__orb">
                  {airport.status === "locked" ? <Lock size={18} /> : <Plane size={18} style={{ transform: "rotate(45deg)" }} />}
                </div>
                {index < AIRPORTS.length - 1 && <div className="world-node__line" />}
                <span>{airport.shortName}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="airport-grid">
          {AIRPORTS.map((airport) => {
            const locked = airport.status === "locked";
            return (
              <article key={airport.id} className={`airport-card ${locked ? "airport-card--locked" : ""}`} style={{ "--airport-primary": airport.theme.primary, "--airport-secondary": airport.theme.secondary, "--airport-floor": airport.theme.floor }}>
                <div className="airport-card__art">
                  <div className="mini-terminal">
                    <span className="mini-terminal__room" />
                    <span className="mini-terminal__room mini-terminal__room--wide" />
                    <span className="mini-terminal__gate" />
                    <span className="mini-terminal__pax mini-terminal__pax--a" />
                    <span className="mini-terminal__pax mini-terminal__pax--b" />
                    <span className="mini-terminal__pax mini-terminal__pax--c" />
                  </div>
                  <div className="airport-card__planet" />
                </div>

                <div className="airport-card__body">
                  <div className="airport-card__world">{airport.world}</div>
                  <div className="airport-card__topline">
                    <h2>{airport.name}</h2>
                    {locked ? <Lock size={16} /> : <Trophy size={16} />}
                  </div>
                  <p className="airport-card__tagline">{airport.tagline}</p>
                  <p className="airport-card__desc">{airport.description}</p>

                  <div className="airport-card__meta">
                    <span><Star size={13} /> difficulty</span>
                    <Difficulty level={airport.difficulty} />
                  </div>

                  <div className="objectives">
                    {airport.objectives.slice(0, 3).map((objective) => <span key={objective}>{objective}</span>)}
                  </div>

                  <button className="start-airport-btn" disabled={locked} onClick={() => onStart(airport.id)}>
                    {locked ? airport.unlocks : <><Play size={15} /> Start live ops</>}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
