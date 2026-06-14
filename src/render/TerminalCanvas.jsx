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

function drawLabel(ctx, text, x, y, color = C.dim, size = 11, align = "left") {
  ctx.save();
  ctx.font = `700 ${size}px ui-monospace, SF Mono, Menlo, monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawZone(ctx, x, y, w, h, label, stroke, fill = "rgba(255,255,255,0.025)", hot = false) {
  ctx.save();
  rr(ctx, x, y, w, h, 14);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = hot ? 2 : 1;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  if (hot) {
    ctx.shadowColor = stroke;
    ctx.shadowBlur = 20;
    ctx.stroke();
  }
  drawLabel(ctx, label, x + 12, y + 18, stroke, 10);
  ctx.restore();
}

function lerp(a, b, t) { return a + (b - a) * t; }

function drawPerson(ctx, x, y, color, scale = 1, pulse = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(1, 6 * scale, 4.5 * scale, 2.3 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  rr(ctx, -3.2 * scale, -1 * scale, 6.4 * scale, 9 * scale, 4 * scale);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -4.2 * scale, 3.2 * scale, 0, Math.PI * 2);
  ctx.fillStyle = pulse > 0.7 ? C.red : color;
  ctx.fill();
  ctx.restore();
}

function dotColor(i, pressure) {
  if (pressure > 0.85 && i % 3 === 0) return C.red;
  if (pressure > 0.55 && i % 2 === 0) return C.amber;
  return i % 7 === 0 ? C.purple : C.blue;
}

function drawFlowLine(ctx, points, color, t) {
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.25;
  ctx.setLineDash([8, 10]);
  ctx.lineDashOffset = -t * 0.02;
  ctx.beginPath();
  points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.restore();
}

function drawPlane(ctx, x, y, active, color = C.runway) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.25);
  ctx.fillStyle = color;
  ctx.globalAlpha = active ? 1 : 0.45;
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(-12, -6);
  ctx.lineTo(-8, -1);
  ctx.lineTo(-18, 3);
  ctx.lineTo(-8, 4);
  ctx.lineTo(-12, 9);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function computeLayout(w, h, gates) {
  const pad = Math.max(16, w * 0.025);
  const top = 44;
  const terminalY = top;
  const terminalH = Math.min(250, h * 0.48);
  const runwayY = terminalY + terminalH + 34;
  const runwayH = Math.max(58, h - runwayY - pad);

  const entrance = { x: pad + 48, y: terminalY + terminalH / 2 };
  const security = { x: pad + w * 0.20, y: terminalY + 38, w: w * 0.20, h: terminalH - 76 };
  const buffer = { x: pad + w * 0.44, y: terminalY + 42, w: w * 0.12, h: terminalH - 84 };
  const gateArea = { x: pad + w * 0.60, y: terminalY + 24, w: w - pad * 2 - (pad + w * 0.60), h: terminalH - 48 };
  const runway = { x: pad, y: runwayY, w: w - pad * 2, h: runwayH };

  const gateRects = [];
  const cols = Math.min(4, gates);
  const rows = Math.ceil(gates / cols);
  const gap = 9;
  const gw = (gateArea.w - gap * (cols - 1)) / cols;
  const gh = Math.max(46, (gateArea.h - gap * (rows - 1)) / rows);
  for (let i = 0; i < gates; i += 1) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    gateRects.push({ x: gateArea.x + c * (gw + gap), y: gateArea.y + r * (gh + gap), w: gw, h: gh, cx: gateArea.x + c * (gw + gap) + gw / 2, cy: gateArea.y + r * (gh + gap) + gh / 2 });
  }
  return { pad, terminalY, terminalH, entrance, security, buffer, gateArea, gateRects, runway };
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
      const { ctx, w, h } = fitCanvas(canvas);
      const L = computeLayout(w, h, s.gates);
      const pressure = Math.min(1, s.securityQueue / 500);
      const gatePressure = Math.min(1, s.occCount / Math.max(1, s.gates));
      const runwayActive = Boolean(s.lastDeparted) || s.event?.type === "weather";
      const tick = now / 1000;

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#07111a");
      bg.addColorStop(1, "#0c1e2b");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // subtle grid
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.restore();

      drawLabel(ctx, "LIVE OPS VIEW", L.pad, 26, C.text, 13);
      drawLabel(ctx, `Bottleneck: ${s.lastBottleneck.toUpperCase()}`, w - L.pad, 26, s.lastBottleneck === "none" ? C.green : C.amber, 11, "right");

      drawZone(ctx, L.pad, L.terminalY, w - L.pad * 2, L.terminalH, "TERMINAL", "rgba(59,213,221,0.30)", "rgba(59,213,221,0.025)");
      drawZone(ctx, L.security.x, L.security.y, L.security.w, L.security.h, "SECURITY", pressure > 0.7 ? C.red : pressure > 0.4 ? C.amber : C.teal, "rgba(246,166,35,0.04)", s.lastBottleneck === "security");
      drawZone(ctx, L.buffer.x, L.buffer.y, L.buffer.w, L.buffer.h, "BUFFER", C.purple, "rgba(185,137,255,0.035)");
      drawZone(ctx, L.gateArea.x, L.gateArea.y, L.gateArea.w, L.gateArea.h, "GATES", gatePressure > 0.9 ? C.amber : C.teal, "rgba(77,163,255,0.035)", s.lastBottleneck === "gate");
      drawZone(ctx, L.runway.x, L.runway.y, L.runway.w, L.runway.h, "RUNWAY", s.event?.type === "weather" ? C.red : C.runway, "rgba(232,200,74,0.035)", s.lastBottleneck === "runway");

      drawFlowLine(ctx, [L.entrance, { x: L.security.x + 14, y: L.entrance.y }, { x: L.security.x + L.security.w + 10, y: L.entrance.y }, { x: L.buffer.x + L.buffer.w / 2, y: L.entrance.y }, { x: L.gateArea.x + 10, y: L.entrance.y }], C.teal, now);

      // entrance pulse
      ctx.save();
      ctx.fillStyle = C.green;
      ctx.globalAlpha = 0.15 + Math.sin(tick * 4) * 0.05;
      ctx.beginPath();
      ctx.arc(L.entrance.x, L.entrance.y, 22, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, "ENTRANCE", L.entrance.x - 30, L.entrance.y - 30, C.green, 10);
      ctx.restore();

      // security lanes
      const laneGap = L.security.h / (s.lanes + 1);
      for (let i = 0; i < s.lanes; i += 1) {
        const y = L.security.y + laneGap * (i + 1);
        ctx.save();
        ctx.strokeStyle = i % 2 ? C.amber : C.teal;
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(L.security.x + 18, y);
        ctx.lineTo(L.security.x + L.security.w - 18, y);
        ctx.stroke();
        drawPerson(ctx, L.security.x + L.security.w - 30, y - 2, i % 2 ? C.amber : C.teal, 0.72, (tick + i) % 1);
        ctx.restore();
      }

      // visual security queue
      const qCount = Math.min(120, Math.ceil(s.securityQueue / 4));
      const qCols = Math.max(4, Math.floor((L.security.x - L.entrance.x - 34) / 13));
      for (let i = 0; i < qCount; i += 1) {
        const col = i % qCols;
        const row = Math.floor(i / qCols);
        const x = L.security.x - 18 - col * 12;
        const y = L.entrance.y - 44 + row * 12;
        if (y > L.terminalY + L.terminalH - 18) continue;
        drawPerson(ctx, x, y, dotColor(i, pressure), 0.68, pressure);
      }

      // moving arrivals stream
      const movers = Math.min(28, Math.max(6, Math.ceil((s.securityQueue + s.clearedPool) / 38)));
      for (let i = 0; i < movers; i += 1) {
        const t = ((tick * (0.07 + s.speed * 0.035) + i / movers) % 1);
        const x = lerp(L.entrance.x, L.security.x - 32, t);
        const y = L.entrance.y + Math.sin((t + i) * Math.PI * 2) * 16 + ((i % 3) - 1) * 6;
        drawPerson(ctx, x, y, dotColor(i, pressure), 0.75, pressure);
      }

      // cleared pool in buffer
      const bufferCount = Math.min(70, Math.ceil(s.clearedPool / 4));
      for (let i = 0; i < bufferCount; i += 1) {
        const cols = Math.max(2, Math.floor(L.buffer.w / 12));
        const x = L.buffer.x + 16 + (i % cols) * 12;
        const y = L.buffer.y + 36 + Math.floor(i / cols) * 12;
        if (y > L.buffer.y + L.buffer.h - 10) continue;
        drawPerson(ctx, x, y, i % 5 === 0 ? C.green : C.blue, 0.66);
      }

      // gates and gate pax
      for (let i = 0; i < L.gateRects.length; i += 1) {
        const g = L.gateRects[i];
        const f = s.flights.find((flight) => flight.gate === i);
        const ready = f?.status === "ready";
        const delayed = f?.age > 24;
        const stroke = ready ? C.green : delayed ? C.red : f ? C.amber : C.line2;
        drawZone(ctx, g.x, g.y, g.w, g.h, `G${i + 1}`, stroke, f ? "rgba(77,163,255,0.045)" : "rgba(255,255,255,0.015)", ready || delayed);
        if (f) {
          drawLabel(ctx, f.code, g.x + g.w - 8, g.y + 18, stroke, 10, "right");
          const fill = Math.min(1, f.boarded / f.pax);
          ctx.save();
          rr(ctx, g.x + 10, g.y + g.h - 14, g.w - 20, 5, 4);
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fill();
          rr(ctx, g.x + 10, g.y + g.h - 14, (g.w - 20) * fill, 5, 4);
          ctx.fillStyle = stroke;
          ctx.fill();
          ctx.restore();

          const gatePax = Math.min(22, Math.ceil((f.pax - f.boarded) / 5));
          for (let p = 0; p < gatePax; p += 1) {
            const px = g.x + 18 + (p % 7) * 10;
            const py = g.y + 34 + Math.floor(p / 7) * 11;
            if (py > g.y + g.h - 20) continue;
            drawPerson(ctx, px, py, delayed ? C.red : ready ? C.green : C.blue, 0.56, delayed ? 1 : 0);
          }
        }
      }

      // moving people from buffer to gates
      const activeGate = L.gateRects.find((_, i) => s.flights.find((f) => f.gate === i && f.status === "board"));
      if (activeGate) {
        for (let i = 0; i < 18; i += 1) {
          const t = ((tick * 0.10 * s.speed + i / 18) % 1);
          const x = lerp(L.buffer.x + L.buffer.w, activeGate.cx, t);
          const y = lerp(L.buffer.y + L.buffer.h / 2, activeGate.cy, t) + Math.sin((t + i) * 10) * 7;
          drawPerson(ctx, x, y, i % 4 === 0 ? C.green : C.blue, 0.62);
        }
      }

      // runway animation
      ctx.save();
      const ry = L.runway.y + L.runway.h / 2;
      ctx.strokeStyle = s.event?.type === "weather" ? C.red : C.runway;
      ctx.globalAlpha = 0.50;
      ctx.lineWidth = 4;
      ctx.setLineDash([28, 24]);
      ctx.lineDashOffset = -now * 0.04 * (s.running ? s.speed : 0);
      ctx.beginPath();
      ctx.moveTo(L.runway.x + 24, ry);
      ctx.lineTo(L.runway.x + L.runway.w - 24, ry);
      ctx.stroke();
      ctx.restore();

      const planeT = ((tick * 0.12 * Math.max(1, s.speed)) % 1);
      drawPlane(ctx, lerp(L.runway.x + 40, L.runway.x + L.runway.w - 40, runwayActive ? planeT : 0.18), ry - 2, runwayActive, s.event?.type === "weather" ? C.red : C.runway);
      drawLabel(ctx, `${s.runwayLevel} slot/min`, L.runway.x + L.runway.w - 20, L.runway.y + 22, s.event?.type === "weather" ? C.red : C.runway, 10, "right");

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="terminal-canvas" aria-label="Live airport operations map" />;
}
