import { useEffect, useRef } from "react";
import { PALETTE as C } from "../sim/constants";

function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(360, Math.floor(rect.width));
  const height = Math.max(360, Math.floor(rect.height));
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

function text(ctx, value, x, y, color = C.text, size = 11, align = "left", weight = 900, mono = false) {
  ctx.save();
  ctx.font = `${weight} ${size}px ${mono ? 'ui-monospace, "SF Mono", Menlo, monospace' : 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
  ctx.restore();
}

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const lerp = (a, b, t) => a + (b - a) * t;

function drawGrid(ctx, w, h, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.08;
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 38) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 38) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRoom(ctx, x, y, w, h, title, { stroke, fill, glow = false, radius = 20, accent }) {
  ctx.save();
  rr(ctx, x, y, w, h, radius);
  ctx.fillStyle = fill;
  ctx.shadowColor = "rgba(0,0,0,.28)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = glow ? 3 : 2;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  if (glow) {
    ctx.globalAlpha = 0.18;
    ctx.shadowColor = stroke;
    ctx.shadowBlur = 26;
    ctx.stroke();
  }
  ctx.restore();
  if (accent) {
    ctx.save();
    rr(ctx, x + 10, y + 10, w - 20, 16, 8);
    const g = ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, accent);
    g.addColorStop(1, "rgba(255,255,255,.02)");
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.12;
    ctx.fill();
    ctx.restore();
  }
  text(ctx, title, x + 14, y + 22, stroke, 10, "left", 900, true);
}

function drawArrowSign(ctx, x, y, textValue, color) {
  ctx.save();
  rr(ctx, x, y, 90, 24, 12);
  ctx.fillStyle = "rgba(4,10,16,.52)";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(ctx, textValue, x + 10, y + 16, color, 10, "left", 800);
  ctx.beginPath();
  ctx.moveTo(x + 72, y + 7);
  ctx.lineTo(x + 80, y + 12);
  ctx.lineTo(x + 72, y + 17);
  ctx.stroke();
  ctx.restore();
}

function drawDesk(ctx, x, y, w = 22, h = 12, color = "rgba(255,255,255,.18)") {
  ctx.save();
  rr(ctx, x, y, w, h, 4);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawCrew(ctx, x, y, color, scale = 1, mood = "normal", phase = 0) {
  const outline = "rgba(4,8,13,.82)";
  const visor = mood === "critical" ? "#ffd4d4" : mood === "waiting" ? "#ffe4a3" : mood === "good" ? "#d8ffe9" : "#bcefff";
  const bob = Math.sin(phase * Math.PI * 2) * 1.7 * scale;
  ctx.save();
  ctx.translate(x, y + bob);

  ctx.fillStyle = "rgba(0,0,0,.22)";
  ctx.beginPath();
  ctx.ellipse(1 * scale, 10 * scale, 8.2 * scale, 3 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2 * scale;
  rr(ctx, -9.5 * scale, -4.3 * scale, 6.3 * scale, 15.2 * scale, 4.1 * scale);
  ctx.fill();
  ctx.stroke();

  rr(ctx, -6 * scale, -13 * scale, 16.2 * scale, 25 * scale, 8.4 * scale);
  const body = ctx.createLinearGradient(-6, -13, 12, 10);
  body.addColorStop(0, color);
  body.addColorStop(1, "rgba(0,0,0,.18)");
  ctx.fillStyle = body;
  ctx.fill();
  ctx.stroke();

  rr(ctx, -5 * scale, 8 * scale, 6 * scale, 8 * scale, 3 * scale);
  ctx.fill();
  ctx.stroke();
  rr(ctx, 4.2 * scale, 8 * scale, 6 * scale, 8 * scale, 3 * scale);
  ctx.fill();
  ctx.stroke();

  rr(ctx, 0.2 * scale, -9 * scale, 11.2 * scale, 7.3 * scale, 4.2 * scale);
  const visorGrad = ctx.createLinearGradient(0, -9, 11, -2);
  visorGrad.addColorStop(0, visor);
  visorGrad.addColorStop(1, "rgba(120,220,255,.84)");
  ctx.fillStyle = visorGrad;
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.52)";
  ctx.beginPath();
  ctx.ellipse(3 * scale, -7 * scale, 2.1 * scale, 1 * scale, -0.35, 0, Math.PI * 2);
  ctx.fill();

  if (mood === "critical" || mood === "waiting") {
    ctx.beginPath();
    ctx.arc(9 * scale, -14 * scale, 3.5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = mood === "critical" ? C.red : C.amber;
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();
  }
  ctx.restore();
}

function drawBag(ctx, x, y, color = C.amber, scale = 1, phase = 0) {
  ctx.save();
  ctx.translate(x, y + Math.sin(phase * Math.PI * 2) * 0.7);
  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 7 * scale, 2.6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  rr(ctx, -6 * scale, -2 * scale, 12 * scale, 10 * scale, 3.5 * scale);
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(0,0,0,.45)";
  ctx.lineWidth = 1.6 * scale;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -2 * scale, 2.6 * scale, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawFlow(ctx, points, color, now, active = true, width = 5) {
  ctx.save();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.globalAlpha = active ? 0.28 : 0.1;
  ctx.setLineDash([12, 14]);
  ctx.lineDashOffset = -now * 0.034;
  ctx.beginPath();
  points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.restore();
}

function drawPlane(ctx, x, y, active, color = C.runway, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.12);
  ctx.scale(scale, scale);
  ctx.globalAlpha = active ? 1 : 0.5;
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(0,0,0,.48)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(27, 0);
  ctx.lineTo(-18, -9);
  ctx.lineTo(-12, -2);
  ctx.lineTo(-28, 6);
  ctx.lineTo(-11, 6);
  ctx.lineTo(-17, 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.74)";
  ctx.beginPath();
  ctx.ellipse(4, -2, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function paxColor(i, theme, pressure) {
  if (pressure > 0.85 && i % 3 === 0) return C.red;
  if (pressure > 0.55 && i % 2 === 0) return C.amber;
  const palette = [theme.primary || C.blue, C.green, C.purple, "#ff7a90", theme.secondary || C.amber, "#6ef3ff"];
  return palette[i % palette.length];
}

function paxMood(pressure, i) {
  if (pressure > 0.85 && i % 3 === 0) return "critical";
  if (pressure > 0.55 && i % 2 === 0) return "waiting";
  return "normal";
}

function layout(w, h, state) {
  const pad = Math.max(18, w * 0.024);
  const top = 50;
  const terminalH = Math.min(380, h * 0.62);
  const runwayY = top + terminalH + 24;
  const runwayH = Math.max(92, h - runwayY - pad);
  const innerW = w - pad * 2;

  const lobby = { x: pad + 12, y: top + 26, w: innerW * 0.17, h: terminalH * 0.48 };
  const bagDrop = { x: pad + 12, y: top + terminalH * 0.56, w: innerW * 0.17, h: terminalH * 0.29 };
  const security = { x: pad + innerW * 0.22, y: top + 38, w: innerW * 0.22, h: terminalH * 0.70 };
  const hold = { x: pad + innerW * 0.47, y: top + 48, w: innerW * 0.12, h: terminalH * 0.61 };
  const baggage = { x: pad + innerW * 0.47, y: top + terminalH * 0.73, w: innerW * 0.12, h: terminalH * 0.16 };
  const gateArea = { x: pad + innerW * 0.62, y: top + 26, w: innerW * 0.34, h: terminalH * 0.82 };
  const runway = { x: pad, y: runwayY, w: innerW, h: runwayH };
  const entrance = { x: lobby.x - 10, y: lobby.y + lobby.h * 0.55 };

  const gateRects = [];
  const cols = Math.min(3, state.gates);
  const rows = Math.ceil(state.gates / cols);
  const gap = 10;
  const gw = (gateArea.w - gap * (cols - 1)) / cols;
  const gh = Math.max(68, (gateArea.h - gap * (rows - 1)) / rows);
  for (let i = 0; i < state.gates; i += 1) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    gateRects.push({ x: gateArea.x + c * (gw + gap), y: gateArea.y + r * (gh + gap), w: gw, h: gh, cx: gateArea.x + c * (gw + gap) + gw / 2, cy: gateArea.y + r * (gh + gap) + gh / 2 });
  }

  return { pad, top, terminalH, lobby, bagDrop, security, hold, baggage, gateArea, gateRects, runway, entrance };
}

function eventBadgeColor(type, theme) {
  if (type === "weather") return C.red;
  if (type === "security") return C.amber;
  return theme.primary || C.teal;
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
      const L = layout(w, h, s);
      const tick = now / 1000;
      const secPressure = clamp(s.securityQueue / 520, 0, 1);
      const gatePressure = clamp(s.occCount / Math.max(1, s.gates), 0, 1);
      const bagPressure = clamp((s.securityQueue * 0.18 + s.clearedPool * 0.08) / 120, 0, 1);
      const runwayActive = Boolean(s.lastDeparted) || s.event?.type === "weather";
      const isMars = (s.airportName || "").toLowerCase().includes("mars");

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, theme.sky || "#07111a");
      bg.addColorStop(1, isMars ? "#1d0f14" : "#091a25");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      drawGrid(ctx, w, h, theme.wall || C.line);

      // Decorative sky bits
      if (!isMars) {
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = theme.primary || C.blue;
        [
          { x: 90 + Math.sin(tick) * 22, y: 40, r: 22 },
          { x: 118 + Math.sin(tick) * 22, y: 36, r: 30 },
          { x: 152 + Math.sin(tick) * 22, y: 40, r: 22 },
          { x: w - 160 + Math.cos(tick * 0.8) * 18, y: 66, r: 18 },
          { x: w - 138 + Math.cos(tick * 0.8) * 18, y: 58, r: 24 },
          { x: w - 110 + Math.cos(tick * 0.8) * 18, y: 62, r: 16 },
        ].forEach((c) => {
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      text(ctx, "VISTA OPERATIVA LIVE", L.pad, 28, C.text, 12, "left", 900, true);
      text(ctx, s.airportName || "Airport", w - L.pad, 28, theme.primary || C.teal, 11, "right", 900, true);

      // Big shell
      drawRoom(ctx, L.pad, L.top, w - L.pad * 2, L.terminalH, "TERMINAL", {
        stroke: "rgba(255,255,255,.14)", fill: "rgba(255,255,255,.03)", accent: theme.primary || C.teal, radius: 28,
      });

      drawRoom(ctx, L.lobby.x, L.lobby.y, L.lobby.w, L.lobby.h, "HALL ARRIVI", {
        stroke: theme.secondary || C.green,
        fill: "rgba(97,211,148,.06)",
        accent: theme.secondary || C.green,
      });
      drawRoom(ctx, L.bagDrop.x, L.bagDrop.y, L.bagDrop.w, L.bagDrop.h, "BAG DROP", {
        stroke: bagPressure > 0.7 ? C.red : C.amber,
        fill: "rgba(246,166,35,.06)",
        accent: C.amber,
        glow: bagPressure > 0.7,
      });
      drawRoom(ctx, L.security.x, L.security.y, L.security.w, L.security.h, "SECURITY", {
        stroke: secPressure > 0.74 ? C.red : secPressure > 0.45 ? C.amber : theme.primary || C.teal,
        fill: "rgba(77,163,255,.045)",
        accent: theme.primary || C.teal,
        glow: s.lastBottleneck === "security",
      });
      drawRoom(ctx, L.hold.x, L.hold.y, L.hold.w, L.hold.h, "AIRSIDE", {
        stroke: C.purple,
        fill: "rgba(185,137,255,.055)",
        accent: C.purple,
      });
      drawRoom(ctx, L.baggage.x, L.baggage.y, L.baggage.w, L.baggage.h, "BAGAGLI", {
        stroke: bagPressure > 0.7 ? C.red : C.runway,
        fill: "rgba(232,200,74,.05)",
        accent: C.runway,
      });
      drawRoom(ctx, L.gateArea.x, L.gateArea.y, L.gateArea.w, L.gateArea.h, "GATE", {
        stroke: gatePressure > 0.85 ? C.amber : theme.primary || C.blue,
        fill: "rgba(77,163,255,.04)",
        accent: theme.primary || C.blue,
        glow: s.lastBottleneck === "gate",
      });
      drawRoom(ctx, L.runway.x, L.runway.y, L.runway.w, L.runway.h, "PISTA", {
        stroke: s.event?.type === "weather" ? C.red : C.runway,
        fill: "rgba(232,200,74,.045)",
        accent: C.runway,
        glow: s.lastBottleneck === "runway",
        radius: 24,
      });

      // route signs
      drawArrowSign(ctx, L.lobby.x + 10, L.lobby.y + L.lobby.h - 34, "SECURITY", theme.secondary || C.green);
      drawArrowSign(ctx, L.bagDrop.x + 10, L.bagDrop.y + L.bagDrop.h - 34, "BAGAGLI", C.amber);
      drawArrowSign(ctx, L.hold.x + 6, L.hold.y + L.hold.h - 34, "GATE", C.purple);

      // hall details
      for (let i = 0; i < 4; i += 1) drawDesk(ctx, L.lobby.x + 18 + i * 20, L.lobby.y + 22, 14, 8, "rgba(255,255,255,.14)");
      drawDesk(ctx, L.lobby.x + 18, L.lobby.y + 52, 44, 10, "rgba(255,255,255,.12)");
      drawDesk(ctx, L.lobby.x + 76, L.lobby.y + 52, 44, 10, "rgba(255,255,255,.12)");
      // bag drop desks scale with gates
      const deskCount = Math.min(5, 2 + Math.floor(s.gates / 2));
      for (let i = 0; i < deskCount; i += 1) {
        drawDesk(ctx, L.bagDrop.x + 16 + i * 28, L.bagDrop.y + 24, 22, 12, i % 2 ? "rgba(255,255,255,.14)" : "rgba(246,166,35,.16)");
      }

      // security scanners scale with lanes
      const laneGap = L.security.h / (s.lanes + 1);
      for (let i = 0; i < s.lanes; i += 1) {
        const yy = L.security.y + laneGap * (i + 1);
        rr(ctx, L.security.x + L.security.w - 48, yy - 14, 32, 28, 10);
        ctx.fillStyle = secPressure > 0.72 ? "rgba(255,93,104,.16)" : "rgba(59,213,221,.14)";
        ctx.fill();
        ctx.strokeStyle = i % 2 ? C.amber : theme.primary || C.teal;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(L.security.x + L.security.w - 44, yy);
        ctx.lineTo(L.security.x + L.security.w - 20, yy);
        ctx.strokeStyle = "rgba(255,255,255,.42)";
        ctx.stroke();
      }

      // hold chairs and baggage sorter
      for (let i = 0; i < 2; i += 1) drawDesk(ctx, L.hold.x + 14, L.hold.y + 24 + i * 18, 28, 8, "rgba(185,137,255,.16)");
      rr(ctx, L.baggage.x + 10, L.baggage.y + 24, L.baggage.w - 20, 12, 6);
      ctx.fillStyle = "rgba(0,0,0,.28)";
      ctx.fill();
      rr(ctx, L.baggage.x + 10, L.baggage.y + 44, L.baggage.w - 20, 12, 6);
      ctx.fillStyle = "rgba(0,0,0,.22)";
      ctx.fill();

      // main passenger flow and baggage flow
      drawFlow(ctx, [
        { x: L.entrance.x + 16, y: L.entrance.y },
        { x: L.security.x - 24, y: L.entrance.y },
        { x: L.security.x + L.security.w + 12, y: L.entrance.y },
        { x: L.hold.x + 12, y: L.entrance.y },
        { x: L.gateArea.x + 18, y: L.entrance.y },
      ], theme.primary || C.teal, now, s.running, 5);
      drawFlow(ctx, [
        { x: L.bagDrop.x + L.bagDrop.w - 10, y: L.bagDrop.y + L.bagDrop.h / 2 },
        { x: L.baggage.x - 10, y: L.baggage.y + L.baggage.h / 2 },
        { x: L.gateArea.x, y: L.baggage.y + L.baggage.h / 2 },
      ], C.amber, now, s.running, 4);

      // spawn glow at entrance
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = theme.secondary || C.green;
      ctx.beginPath();
      ctx.arc(L.entrance.x, L.entrance.y, 22 + Math.sin(tick * 2.5) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // lobby passengers
      const hallCount = Math.min(16, Math.max(4, Math.ceil((s.securityQueue + s.clearedPool) / 62)));
      for (let i = 0; i < hallCount; i += 1) {
        const x = L.lobby.x + 24 + (i % 4) * 26 + Math.sin(tick * 1.6 + i) * 2;
        const y = L.lobby.y + 72 + Math.floor(i / 4) * 28 + Math.cos(tick * 1.2 + i) * 2;
        drawCrew(ctx, x, y, paxColor(i, theme, secPressure * 0.6), 0.8, paxMood(secPressure * 0.5, i), tick + i);
      }

      // flow walkers entrance -> security
      const movers = Math.min(22, Math.max(6, Math.ceil((s.securityQueue + s.clearedPool) / 44)));
      for (let i = 0; i < movers; i += 1) {
        const t = ((tick * (0.05 + s.speed * 0.028) + i / movers) % 1);
        const x = lerp(L.entrance.x + 10, L.security.x - 24, t);
        const y = L.entrance.y + Math.sin((t + i) * Math.PI * 2) * 12 + ((i % 3) - 1) * 6;
        drawCrew(ctx, x, y, paxColor(i, theme, secPressure), 0.72, paxMood(secPressure, i), tick + i);
      }

      // bag drop passengers and bags
      const bagPeople = Math.min(10, 3 + Math.floor(bagPressure * 10));
      for (let i = 0; i < bagPeople; i += 1) {
        const x = L.bagDrop.x + 22 + (i % 4) * 26;
        const y = L.bagDrop.y + 56 + Math.floor(i / 4) * 22;
        drawCrew(ctx, x, y, i % 2 ? theme.secondary || C.amber : theme.primary || C.blue, 0.6, i % 3 === 0 ? "waiting" : "normal", tick + i);
      }
      const bagCount = Math.min(16, 5 + Math.floor((s.securityQueue + s.clearedPool) / 80));
      for (let i = 0; i < bagCount; i += 1) {
        const progress = ((tick * 0.11 * Math.max(1, s.speed) + i / bagCount) % 1);
        const x = lerp(L.bagDrop.x + L.bagDrop.w - 12, L.gateArea.x - 6, progress);
        const y = progress < 0.5 ? lerp(L.bagDrop.y + L.bagDrop.h / 2, L.baggage.y + L.baggage.h / 2, progress * 2) : L.baggage.y + L.baggage.h / 2;
        drawBag(ctx, x, y, i % 4 === 0 ? C.red : i % 3 === 0 ? C.green : C.amber, 0.86, tick + i);
      }

      // security queue snake
      const qCount = Math.min(130, Math.ceil(s.securityQueue / 4));
      const qCols = Math.max(4, Math.floor((L.security.w - 26) / 20));
      for (let i = 0; i < qCount; i += 1) {
        const row = Math.floor(i / qCols);
        const col = i % qCols;
        const snakeCol = row % 2 ? qCols - 1 - col : col;
        const x = L.security.x + 22 + snakeCol * 20;
        const y = L.security.y + 42 + row * 22;
        if (y > L.security.y + L.security.h - 18) continue;
        drawCrew(ctx, x, y, paxColor(i, theme, secPressure), 0.58, paxMood(secPressure, i), tick + i);
      }
      text(ctx, `${Math.round(s.estWait)} MIN`, L.security.x + L.security.w - 12, L.security.y + 22, secPressure > 0.72 ? C.red : secPressure > 0.45 ? C.amber : theme.primary || C.teal, 10, "right", 900, true);

      // cleared pool in airside
      const clearedCount = Math.min(42, Math.ceil(s.clearedPool / 5));
      const cCols = Math.max(2, Math.floor((L.hold.w - 20) / 18));
      for (let i = 0; i < clearedCount; i += 1) {
        const x = L.hold.x + 16 + (i % cCols) * 18;
        const y = L.hold.y + 56 + Math.floor(i / cCols) * 24;
        if (y > L.hold.y + L.hold.h - 16) continue;
        drawCrew(ctx, x, y, i % 5 === 0 ? C.green : theme.primary || C.blue, 0.54, "good", tick + i);
      }

      // gate rooms + queues
      for (let i = 0; i < L.gateRects.length; i += 1) {
        const g = L.gateRects[i];
        const f = s.flights.find((flight) => flight.gate === i);
        const ready = f?.status === "ready";
        const delayed = f?.age > 24;
        const stroke = ready ? C.green : delayed ? C.red : f ? C.amber : "rgba(255,255,255,.22)";
        drawRoom(ctx, g.x, g.y, g.w, g.h, `G${i + 1}`, {
          stroke,
          fill: f ? "rgba(255,255,255,.058)" : "rgba(255,255,255,.026)",
          glow: ready || delayed,
          accent: stroke,
          radius: 18,
        });
        // lounges visually upgrade with more gates
        const seatRows = s.gates > 4 ? 3 : 2;
        for (let r = 0; r < seatRows; r += 1) {
          drawDesk(ctx, g.x + 12 + r * 18, g.y + 18, 14, 6, "rgba(255,255,255,.12)");
        }
        if (f) {
          text(ctx, f.code, g.x + g.w - 10, g.y + 18, stroke, 10, "right", 900, true);
          const fill = clamp(f.boarded / f.pax, 0, 1);
          rr(ctx, g.x + 12, g.y + g.h - 14, g.w - 24, 6, 4);
          ctx.fillStyle = "rgba(0,0,0,.36)";
          ctx.fill();
          rr(ctx, g.x + 12, g.y + g.h - 14, (g.w - 24) * fill, 6, 4);
          ctx.fillStyle = stroke;
          ctx.fill();
          const gatePax = Math.min(16, Math.ceil((f.pax - f.boarded) / 7));
          for (let p = 0; p < gatePax; p += 1) {
            const px = g.x + 18 + (p % 4) * 19;
            const py = g.y + 40 + Math.floor(p / 4) * 21;
            if (py > g.y + g.h - 22) continue;
            drawCrew(ctx, px, py, delayed ? C.red : ready ? C.green : theme.primary || C.blue, 0.52, delayed ? "critical" : ready ? "good" : "waiting", tick + p);
          }
        } else {
          text(ctx, "OPEN", g.x + g.w / 2, g.y + g.h / 2 + 4, C.dim2, 10, "center", 700, true);
        }
      }

      // active flow to current boarding gate
      const activeGateIndex = s.flights.find((f) => f.status === "board")?.gate;
      const activeGate = typeof activeGateIndex === "number" ? L.gateRects[activeGateIndex] : null;
      if (activeGate) {
        drawFlow(ctx, [{ x: L.hold.x + L.hold.w, y: L.hold.y + L.hold.h * 0.52 }, { x: activeGate.cx - 20, y: activeGate.cy }], theme.primary || C.blue, now, true, 4);
        for (let i = 0; i < 14; i += 1) {
          const t = ((tick * 0.08 * Math.max(1, s.speed) + i / 14) % 1);
          const x = lerp(L.hold.x + L.hold.w + 8, activeGate.cx, t);
          const y = lerp(L.hold.y + L.hold.h * 0.52, activeGate.cy, t) + Math.sin((t + i) * 10) * 5;
          drawCrew(ctx, x, y, i % 4 === 0 ? C.green : theme.primary || C.blue, 0.5, "good", tick + i);
        }
      }

      // runway improvements visible with upgrades
      const runwayCenterY = L.runway.y + L.runway.h * 0.58;
      const runwayRect = { x: L.runway.x + 22, y: L.runway.y + 18, w: L.runway.w - 44, h: L.runway.h - 34 };
      rr(ctx, runwayRect.x, runwayRect.y, runwayRect.w, runwayRect.h, 22);
      ctx.fillStyle = "rgba(10,12,18,.72)";
      ctx.fill();
      // main strip
      ctx.save();
      ctx.strokeStyle = s.event?.type === "weather" ? C.red : C.runway;
      ctx.globalAlpha = 0.58;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.setLineDash([34, 28]);
      ctx.lineDashOffset = -now * 0.04 * (s.running ? s.speed : 0);
      ctx.beginPath();
      ctx.moveTo(runwayRect.x + 18, runwayCenterY);
      ctx.lineTo(runwayRect.x + runwayRect.w - 18, runwayCenterY);
      ctx.stroke();
      ctx.restore();

      // taxi lane visible after upgrade 2
      if (s.runwayLevel >= 2) {
        ctx.save();
        ctx.strokeStyle = "rgba(59,213,221,.55)";
        ctx.lineWidth = 4;
        ctx.setLineDash([14, 10]);
        ctx.beginPath();
        ctx.moveTo(runwayRect.x + 18, runwayRect.y + 18);
        ctx.lineTo(runwayRect.x + runwayRect.w - 18, runwayRect.y + 18);
        ctx.stroke();
        ctx.restore();
        text(ctx, "TAXI", runwayRect.x + 12, runwayRect.y + 14, C.teal, 9, "left", 900, true);
      }
      // tower at higher level
      if (s.runwayLevel >= 3) {
        const tx = runwayRect.x + runwayRect.w - 52;
        const ty = runwayRect.y - 10;
        rr(ctx, tx, ty, 18, 44, 5);
        ctx.fillStyle = "rgba(255,255,255,.1)";
        ctx.fill();
        ctx.strokeStyle = C.teal;
        ctx.lineWidth = 2;
        ctx.stroke();
        rr(ctx, tx - 8, ty - 10, 34, 12, 5);
        ctx.fillStyle = "rgba(59,213,221,.14)";
        ctx.fill();
        ctx.stroke();
      }
      // extra lights at level 4
      if (s.runwayLevel >= 4) {
        for (let i = 0; i < 12; i += 1) {
          const lx = runwayRect.x + 18 + (runwayRect.w - 36) * (i / 11);
          ctx.fillStyle = i % 2 ? C.blue : C.runway;
          ctx.globalAlpha = 0.72;
          ctx.beginPath();
          ctx.arc(lx, runwayRect.y + runwayRect.h - 10, 2.3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // service carts / bags near runway
      const beltBags = 6 + Math.floor(s.runwayLevel * 1.5);
      for (let i = 0; i < beltBags; i += 1) {
        const progress = ((tick * 0.08 + i / beltBags) % 1);
        const bx = lerp(L.baggage.x + L.baggage.w, runwayRect.x + 64, progress);
        const by = lerp(L.baggage.y + L.baggage.h / 2, runwayRect.y + 16, progress);
        drawBag(ctx, bx, by, i % 3 === 0 ? C.green : C.amber, 0.72, tick + i);
      }

      const planeT = ((tick * 0.1 * Math.max(1, s.speed)) % 1);
      drawPlane(ctx, lerp(runwayRect.x + 42, runwayRect.x + runwayRect.w - 42, runwayActive ? planeT : 0.2), runwayCenterY - 4, runwayActive, s.event?.type === "weather" ? C.red : C.runway, s.runwayLevel >= 3 ? 1.08 : 1);
      text(ctx, `${s.runwayLevel} LVL`, runwayRect.x + runwayRect.w - 18, L.runway.y + 23, s.event?.type === "weather" ? C.red : C.runway, 10, "right", 900, true);
      text(ctx, s.lastDeparted ? `${s.lastDeparted} DECOLLATO` : "PISTA PRONTA", L.runway.x + 18, L.runway.y + 23, runwayActive ? C.runway : C.green, 10, "left", 800);

      // canvas mini overlays
      const badgeColor = s.event ? eventBadgeColor(s.event.type, theme) : theme.primary || C.teal;
      rr(ctx, w - 250, h - 58, 232, 38, 14);
      ctx.fillStyle = "rgba(6,11,16,.62)";
      ctx.fill();
      ctx.strokeStyle = badgeColor;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      text(ctx, s.event ? s.event.label.toUpperCase() : `COLLO PRINCIPALE · ${s.lastBottleneck.toUpperCase()}`, w - 238, h - 34, badgeColor, 10, "left", 900);
      text(ctx, `hall → bag drop → security → gate → pista`, L.pad + 6, h - 34, C.dim, 10, "left", 800, true);

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="terminal-canvas" aria-label="Live 2D airport operations map" />;
}
