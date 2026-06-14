import { AlertTriangle, CloudRain, ShieldAlert, Zap } from "lucide-react";

export function EventBanner({ event }) {
  if (!event) return null;
  const icon = event.type === "weather" ? <CloudRain size={16} /> : event.type === "security" ? <ShieldAlert size={16} /> : <Zap size={16} />;
  return (
    <div className={`event-banner event-banner--${event.type}`}>
      {icon}
      <span>{event.label}</span>
      <span className="event-banner__timer">{event.ticksLeft}m</span>
    </div>
  );
}
