import { useEffect, useRef } from "react";
import { PALETTE as C } from "../sim/constants";

function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(320, Math.floor(rect.width));
  const height = Math.max(300, Math.floor(rect.height));
  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: width, h: height };
}

function rr(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function label(ctx, text, x, y, color = C.dim, size = 11, align = "left") {
  ctx.save();
  ctx.font = `900 ${size}px ui-monospace, SF Mono, Menlo, monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function drawRoom(ctx, x, y, w, h, title, theme, options = {}) {
  const stroke = options.stroke || theme.wall || C.line2;
  const fill = options.fill || theme.floor || C.card;
  ctx.save();
  rr(ctx, x, y, w, h, 20);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = options.hot ? 4 : 2;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  if (options.hot) {
    ctx.globalAlpha = 0.28;
    ctx.shadowColor = stroke;
    ctx.shadowBlur = 24;
    ctx.stroke();
  }
  label(ctx, title, x + 14, y + 21, stroke, 11);
  ctx.restore();
}

function drawDoor(ctx, x, y, w, h, color) {
  ctx.save();
  rr(ctx, x, y, w, h, 8);
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawCrew(ctx, x, y, color, scale = 1, mood = "normal", bob = 0) {
  const danger = mood === "critical";
  const waiting = mood === "waiting";
  const outline = "rgba(3,7,12,.72)";
  const visor = danger ? "#ffd4d4" : waiting ? "#ffe4a3" : "#bcefff";
  const bobY = Math.sin(bob * Math.PI * 2) * 1.8 * scale;

  ctx.save();
  ctx.translate(x, y + bobY);

  // shadow
  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.beginPath();
  ctx.ellipse(1 * scale, 10 * scale, 8.5 * scale, 3.2 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // backpack
  ctx.fillStyle = color;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2 * scale;
  rr(ctx, -9.5 * scale, -4 * scale, 6 * scale, 15 * scale, 4 * scale);
  ctx.fill();
  ctx.stroke();

  // body capsule
  rr(ctx, -6 * scale, -13 * scale, 16 * scale, 25 * scale, 8 * scale);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();

  // feet
  rr(ctx, -5 * scale, 8 * scale, 6 * scale, 8 * scale, 3 * scale);
  ctx.fill();
  ctx.stroke();
  rr(ctx, 4 * scale, 8 * scale, 6 * scale, 8 * scale, 3 * scale);
  ctx.fill();
  ctx.stroke();

  // visor
  rr(ctx, 0 * scale, -9 * scale, 11 * scale, 7 * scale, 4 * scale);
  ctx.fillStyle = visor;
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.45)";
  ctx.beginPath();
  ctx.ellipse(3 * scale, -7 * scale, 2.2 * scale, 1.3 * scale, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // status bubble
  if (danger || waiting) {
    ctx.beginPath();
    ctx.arc(9 * scale, -14 * scale, 3.4 * scale, 0, Math.PI * 2);
    ctx.fillStyle = danger ? C.red : C.amber;
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();
  }

  ctx.restore();
}

function paxColor(i, theme, pressure) {
  if (pressure > 0.85 && i % 3 === 0) return C.red;
  if (pressure > 0.55 && i % 2 === 0) return C.amber;
  const palette = [theme.primary || C.blue, C.blue, C.green, C.purple, "#ff7a90", "#6ef3ff"];
  return palette[i % palette.length];
}

function paxMood(pressure, i) {
  if (pressure > 0.85 && i % 3 === 0) return "critical";
  if (pressure > 0.55 && i % 2 === 0) return "waiting";
  return "normal";
}

function drawFlow(ctx, points, color, now, active = true) {
  ctx.save();
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.globalAlpha = active ? 0.28 : 0.12;
  ctx.setLineDash([10, 14]);
  ctx.lineDashOffset = -now * 0.035;
  ctx.beginPath();
  points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.restore();
}

function drawPlane(ctx, x, y, active, color = C.runway) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.16);
  ctx.globalAlpha = active ? 1 : 0.42;
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(0,0,0,.48)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(24, 0);
  ctx.lineTo(-16, -8);
  ctx.lineTo(-11, -1);
  ctx.lineTo(-25, 6);
  ctx.lineTo(-10, 6);
  ctx.lineTo(-15, 13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.7)";
  ctx.beginPath();
  ctx.ellipse(3, -2, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function computeLayout(w, h, gates) {
  const pad = Math.max(18, w * 0.026);
  const top = 48;
  const terminalY = top;
  const terminalH = Math.min(300, h * 0.52);
  const runwayY = terminalY + terminalH + 28;
  const runwayH = Math.max(68, h - runwayY - pad);

  const entrance = { x: pad + 42, y: terminalY + terminalH / 2 };
  const lobby = { x: pad + 12, y: terminalY + 44, w: w * 0.16, h: terminalH - 88 };
  const security = { x: pad + w * 0.22, y: terminalY + 36, w: w * 0.20, h: terminalH - 72 };
  const buffer = { x: pad + w * 0.46, y: terminalY + 52, w: w * 0.12, h: terminalH - 104 };
  const gateArea = { x: pad + w * 0.62, y: terminalY + 26, w: w - pad * 2 - (pad + w * 0.62), h: terminalH - 52 };
  const runway = { x: pad, y: runwayY, w: w - pad * 2, h: runwayH };

  const gateRects = [];
  const cols = Math.min(4, gates);
  const rows = Math.ceil(gates / cols);
  const gap = 10;
  const gw = (gateArea.w - gap * (cols - 1)) / cols;
  const gh = Math.max(54, (gateArea.h - gap * (rows - 1)) / rows);
  for (let i = 0; i < gates; i += 1) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    gateRects.push({
      x: gateArea.x + c * (gw + gap),
      y: gateArea.y + r * (gh + gap),
      w: gw,
      h: gh,
      cx: gateArea.x + c * (gw + gap) + gw / 2,
      cy: gateArea.y + r * (gh + gap) + gh / 2,
    });
  }
  return { pad, terminalY, terminalH, entrance, lobby, security, buffer, gateArea, gateRects, runway };
}

export function TerminalCanvas({ state }) {
  const ref = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const canvas = ref.current;
    let raf = 0;

    function draw(now) {
      const s = stateRef.current;
      const theme = s.airportTheme || {};
      const { ctx, w, h } = fitCanvas(canvas);
      const L = computeLayout(w, h, s.gates);
      const pressure = clamp(s.securityQueue / 520, 0, 1);
      const gatePressure = clamp(s.occCount / Math.max(1, s.gates), 0, 1);
      const runwayActive = Boolean(s.lastDeparted) || s.event?.type === "weather";
      const tick = now / 1000;

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, theme.sky || "#07111a");
      bg.addColorStop(1, "#0b1f2b");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // soft star/dust grid
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.strokeStyle = theme.wall || C.line;
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 34) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 34) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.restore();

      label(ctx, "LIVE 2D TERMINAL", L.pad, 28, C.text, 13);
      label(ctx, s.airportName || "Airport", w - L.pad, 28, theme.primary || C.teal, 11, "right");

      drawRoom(ctx, L.pad, L.terminalY, w - L.pad * 2, L.terminalH, "TERMINAL", theme, { stroke: "rgba(255,255,255,.18)", fill: "rgba(255,255,255,.035)" });
      drawRoom(ctx, L.lobby.x, L.lobby.y, L.lobby.w, L.lobby.h, "LOBBY", theme, { stroke: theme.secondary || C.green, fill: "rgba(97,211,148,.055)" });
      drawRoom(ctx, L.security.x, L.security.y, L.security.w, L.security.h, "SECURITY", theme, { stroke: pressure > 0.72 ? C.red : pressure > 0.45 ? C.amber : theme.primary || C.teal, fill: "rgba(246,166,35,.06)", hot: s.lastBottleneck === "security" });
      drawRoom(ctx, L.buffer.x, L.buffer.y, L.buffer.w, L.buffer.h, "HOLD", theme, { stroke: C.purple, fill: "rgba(185,137,255,.055)" });
      drawRoom(ctx, L.gateArea.x, L.gateArea.y, L.gateArea.w, L.gateArea.h, "GATES", theme, { stroke: gatePressure > 0.9 ? C.amber : theme.primary || C.blue, fill: "rgba(77,163,255,.045)", hot: s.lastBottleneck === "gate" });
      drawRoom(ctx, L.runway.x, L.runway.y, L.runway.w, L.runway.h, "RUNWAY", theme, { stroke: s.event?.type === "weather" ? C.red : C.runway, fill: "rgba(232,200,74,.05)", hot: s.lastBottleneck === "runway" });

      // doors and flow
      drawDoor(ctx, L.lobby.x - 8, L.entrance.y - 22, 16, 44, theme.secondary || C.green);
      drawDoor(ctx, L.security.x - 8, L.entrance.y - 24, 16, 48, theme.primary || C.teal);
      drawDoor(ctx, L.security.x + L.security.w - 8, L.entrance.y - 24, 16, 48, C.purple);
      drawDoor(ctx, L.gateArea.x - 8, L.entrance.y - 24, 16, 48, theme.primary || C.blue);
      drawFlow(ctx, [L.entrance, { x: L.security.x - 18, y: L.entrance.y }, { x: L.security.x + L.security.w + 14, y: L.entrance.y }, { x: L.buffer.x + L.buffer.w / 2, y: L.entrance.y }, { x: L.gateArea.x + 18, y: L.entrance.y }], theme.primary || C.teal, now, s.running);

      // lobby loose passengers
      const lobbyCount = Math.min(18, Math.max(4, Math.ceil((s.securityQueue + s.clearedPool) / 55)));
      for (let i = 0; i < lobbyCount; i += 1) {
        const x = L.lobby.x + 26 + (i % 4) * 24 + Math.sin(tick * 1.7 + i) * 3;
        const y = L.lobby.y + 40 + Math.floor(i / 4) * 28 + Math.cos(tick * 1.4 + i) * 2;
        drawCrew(ctx, x, y, paxColor(i, theme, pressure), 0.72, paxMood(pressure * 0.6, i), tick + i);
      }

      // moving arrivals stream
      const movers = Math.min(26, Math.max(6, Math.ceil((s.securityQueue + s.clearedPool) / 42)));
      for (let i = 0; i < movers; i += 1) {
        const t = ((tick * (0.055 + s.speed * 0.028) + i / movers) % 1);
        const x = lerp(L.entrance.x + 10, L.security.x - 24, t);
        const y = L.entrance.y + Math.sin((t + i) * Math.PI * 2) * 13 + ((i % 3) - 1) * 6;
        drawCrew(ctx, x, y, paxColor(i, theme, pressure), 0.68, paxMood(pressure, i), tick + i);
      }

      // visual security queue in snaking rows
      const qCount = Math.min(110, Math.ceil(s.securityQueue / 4));
      const qCols = Math.max(4, Math.floor((L.security.w - 26) / 20));
      for (let i = 0; i < qCount; i += 1) {
        const row = Math.floor(i / qCols);
        const col = i % qCols;
        const snakeCol = row % 2 ? qCols - 1 - col : col;
        const x = L.security.x + 22 + snakeCol * 20;
        const y = L.security.y + 42 + row * 22;
        if (y > L.security.y + L.security.h - 18) continue;
        drawCrew(ctx, x, y, paxColor(i, theme, pressure), 0.58, paxMood(pressure, i), tick + i);
      }

      // lane scanners
      const laneGap = L.security.h / (s.lanes + 1);
      for (let i = 0; i < s.lanes; i += 1) {
        const y = L.security.y + laneGap * (i + 1);
        ctx.save();
        rr(ctx, L.security.x + L.security.w - 46, y - 14, 30, 28, 10);
        ctx.fillStyle = pressure > 0.75 ? "rgba(255,93,104,.18)" : "rgba(59,213,221,.14)";
        ctx.fill();
        ctx.strokeStyle = i % 2 ? C.amber : theme.primary || C.teal;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // cleared pool in buffer
      const bufferCount = Math.min(60, Math.ceil(s.clearedPool / 5));
      const bCols = Math.max(2, Math.floor((L.buffer.w - 22) / 17));
      for (let i = 0; i < bufferCount; i += 1) {
        const x = L.buffer.x + 18 + (i % bCols) * 17;
        const y = L.buffer.y + 38 + Math.floor(i / bCols) * 23;
        if (y > L.buffer.y + L.buffer.h - 18) continue;
        drawCrew(ctx, x, y, i % 5 === 0 ? C.green : theme.primary || C.blue, 0.54, "normal", tick + i);
      }

      // gates
      for (let i = 0; i < L.gateRects.length; i += 1) {
        const g = L.gateRects[i];
        const f = s.flights.find((flight) => flight.gate === i);
        const ready = f?.status === "ready";
        const delayed = f?.age > 24;
        const stroke = ready ? C.green : delayed ? C.red : f ? C.amber : "rgba(255,255,255,.22)";
        drawRoom(ctx, g.x, g.y, g.w, g.h, `G${i + 1}`, theme, { stroke, fill: f ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.025)", hot: ready || delayed });
        if (f) {
          label(ctx, f.code, g.x + g.w - 10, g.y + 20, stroke, 10, "right");
          const fill = clamp(f.boarded / f.pax, 0, 1);
          ctx.save();
          rr(ctx, g.x + 12, g.y + g.h - 15, g.w - 24, 6, 4);
          ctx.fillStyle = "rgba(0,0,0,.36)";
          ctx.fill();
          rr(ctx, g.x + 12, g.y + g.h - 15, (g.w - 24) * fill, 6, 4);
          ctx.fillStyle = stroke;
          ctx.fill();
          ctx.restore();

          const gatePax = Math.min(18, Math.ceil((f.pax - f.boarded) / 6));
          for (let p = 0; p < gatePax; p += 1) {
            const px = g.x + 22 + (p % 5) * 19;
            const py = g.y + 42 + Math.floor(p / 5) * 21;
            if (py > g.y + g.h - 20) continue;
            drawCrew(ctx, px, py, delayed ? C.red : ready ? C.green : theme.primary || C.blue, 0.50, delayed ? "critical" : ready ? "normal" : "waiting", tick + p);
          }
        }
      }

      // people flowing to active gate
      const activeGate = L.gateRects.find((_, i) => s.flights.find((f) => f.gate === i && f.status === "board"));
      if (activeGate) {
        for (let i = 0; i < 16; i += 1) {
          const t = ((tick * 0.085 * Math.max(1, s.speed) + i / 16) % 1);
          const x = lerp(L.buffer.x + L.buffer.w, activeGate.cx, t);
          const y = lerp(L.buffer.y + L.buffer.h / 2, activeGate.cy, t) + Math.sin((t + i) * 10) * 5;
          drawCrew(ctx, x, y, i % 4 === 0 ? C.green : theme.primary || C.blue, 0.52, "normal", tick + i);
        }
      }

      // runway strip
      ctx.save();
      const ry = L.runway.y + L.runway.h / 2;
      ctx.strokeStyle = s.event?.type === "weather" ? C.red : C.runway;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.setLineDash([34, 28]);
      ctx.lineDashOffset = -now * 0.04 * (s.running ? s.speed : 0);
      ctx.beginPath();
      ctx.moveTo(L.runway.x + 30, ry);
      ctx.lineTo(L.runway.x + L.runway.w - 30, ry);
      ctx.stroke();
      ctx.restore();

      const planeT = ((tick * 0.10 * Math.max(1, s.speed)) % 1);
      drawPlane(ctx, lerp(L.runway.x + 48, L.runway.x + L.runway.w - 48, runwayActive ? planeT : 0.18), ry - 3, runwayActive, s.event?.type === "weather" ? C.red : C.runway);
      label(ctx, `${s.runwayLevel} slot/min`, L.runway.x + L.runway.w - 20, L.runway.y + 23, s.event?.type === "weather" ? C.red : C.runway, 10, "right");

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="terminal-canvas" aria-label="Live 2D airport operations map" />;
}
