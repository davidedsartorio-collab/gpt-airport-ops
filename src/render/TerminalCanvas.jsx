import { useEffect, useRef } from "react";
import { PALETTE as C } from "../sim/constants";
import {
  ART,
  drawBaggageBelt,
  drawBench,
  drawBus,
  drawCheckInCounter,
  drawFlightBoard,
  drawGatePod,
  drawGlassDoors,
  drawInfoDesk,
  drawJetBridge,
  drawOfficer,
  drawOverheadSign,
  drawPassenger,
  drawPlaneTop,
  drawPlant,
  drawPremiumGatePod,
  drawQueueMaze,
  drawRopeQueue,
  drawSecurityLane,
  drawServiceCart,
  drawSeatIsland,
  drawSuitcase,
  drawWallWindows,
  drawZone,
  rr,
  text,
} from "../art/airportArt";

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

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const lerp = (a, b, t) => a + (b - a) * t;

function tierFor(s) {
  return clamp(1 + Math.floor(Math.max(0, (s.lanes - 3) + (s.gates - 3) + (s.runwayLevel - 1) * 1.2) / 2), 1, 5);
}

function drawSceneBackground(ctx, w, h, theme) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, theme.sky || "#081018");
  g.addColorStop(0.55, "#101a2b");
  g.addColorStop(1, "#071018");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.strokeStyle = theme.primary || C.teal;
  for (let x = 0; x < w; x += 38) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 38) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.restore();
}

function layout(W, H, s) {
  const tier = tierFor(s);
  const pad = 24 + tier * 4;
  const top = 52;
  const terminalH = H * 0.64;
  const terminal = { x: pad + 14, y: top, w: W - pad * 2 - 28, h: terminalH };
  const bottom = terminal.y + terminal.h;

  const arrivals = { x: terminal.x + 18, y: terminal.y + 38, w: terminal.w * 0.255, h: terminal.h * 0.39 };
  const bagDrop = { x: terminal.x + 18, y: terminal.y + terminal.h * 0.52, w: terminal.w * 0.255, h: terminal.h * 0.34 };
  const security = { x: terminal.x + terminal.w * 0.315, y: terminal.y + 38, w: terminal.w * 0.245, h: terminal.h * 0.51 };
  const airside = { x: terminal.x + terminal.w * 0.315, y: terminal.y + terminal.h * 0.615, w: terminal.w * 0.245, h: terminal.h * 0.245 };
  const gates = { x: terminal.x + terminal.w * 0.60, y: terminal.y + 38, w: terminal.w * 0.37, h: terminal.h * 0.53 };
  const baggage = { x: terminal.x + terminal.w * 0.60, y: terminal.y + terminal.h * 0.65, w: terminal.w * 0.20, h: terminal.h * 0.21 };
  const cafe = { x: terminal.x + terminal.w * 0.82, y: terminal.y + terminal.h * 0.65, w: terminal.w * 0.15, h: terminal.h * 0.21 };
  const apron = { x: terminal.x + terminal.w * 0.61, y: bottom + 16, w: terminal.w * 0.36, h: Math.max(82, H - bottom - 42) };
  const curb = { x: terminal.x + 18, y: bottom + 16, w: terminal.w * 0.40, h: Math.max(82, H - bottom - 42) };
  const entry = { x: arrivals.x + 12, y: arrivals.y + arrivals.h + 26 };

  const gateRects = [];
  const cols = Math.min(4, s.gates);
  const rows = Math.ceil(s.gates / cols);
  const gap = 8;
  const gw = (gates.w - 20 - gap * (cols - 1)) / cols;
  const gh = Math.max(56, (gates.h - 44 - gap * (rows - 1)) / rows);
  for (let i = 0; i < s.gates; i += 1) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    gateRects.push({
      x: gates.x + 10 + c * (gw + gap),
      y: gates.y + 43 + r * (gh + gap),
      w: gw,
      h: gh,
      cx: gates.x + 10 + c * (gw + gap) + gw / 2,
      cy: gates.y + 43 + r * (gh + gap) + gh / 2,
    });
  }

  return { tier, pad, terminal, arrivals, bagDrop, security, airside, gates, gateRects, baggage, cafe, apron, curb, entry };
}

function drawTerminalShell(ctx, L, theme) {
  ctx.save();
  rr(ctx, L.terminal.x, L.terminal.y, L.terminal.w, L.terminal.h, 28);
  ctx.fillStyle = "rgba(92,70,150,.18)";
  ctx.fill();
  ctx.strokeStyle = "rgba(150,120,220,.58)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
  text(ctx, "TERMINAL", L.terminal.x + 24, L.terminal.y + 28, C.amberHi, 13, "left", 950, true);
  drawWallWindows(ctx, L.terminal, theme.primary || C.teal);
}

function drawFlow(ctx, points, color, now, active = true, width = 4) {
  ctx.save();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.globalAlpha = active ? 0.32 : 0.1;
  ctx.setLineDash([13, 14]);
  ctx.lineDashOffset = -now * 0.04;
  ctx.beginPath();
  points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.restore();
}

function paxColor(i, theme, pressure) {
  if (pressure > 0.85 && i % 3 === 0) return C.red;
  if (pressure > 0.55 && i % 2 === 0) return C.amber;
  const palette = [theme.primary || C.blue, C.green, C.purple, "#ff7a90", theme.secondary || C.amber, "#6ef3ff", "#ff9f1c"];
  return palette[i % palette.length];
}

function paxMood(pressure, i) {
  if (pressure > 0.85 && i % 3 === 0) return "critical";
  if (pressure > 0.55 && i % 2 === 0) return "waiting";
  return "normal";
}

function drawArrivals(ctx, L, s, theme, tick, secPressure) {
  drawZone(ctx, L.arrivals, "ARRIVI", {
    stroke: theme.secondary || C.green,
    fill: "rgba(94,78,171,.46)",
    label: "#0c2641",
    labelColor: C.amberHi,
    tileColor: "rgba(99,78,178,.52)",
  });
  drawGlassDoors(ctx, L.arrivals.x + 10, L.arrivals.y + L.arrivals.h + 3, 86, 22, tick, theme.secondary || C.green);
  drawInfoDesk(ctx, L.arrivals.x + 20, L.arrivals.y + 60, 88, 25, "INFO");
  drawFlightBoard(ctx, L.arrivals.x + L.arrivals.w - 95, L.arrivals.y + 48, 76, 50, theme.secondary || C.green, ["ARR 12  ON", "FR 882  G2", "LH 091  08"]);
  drawBench(ctx, L.arrivals.x + 26, L.arrivals.y + L.arrivals.h - 74, 5, "#174778");
  drawBench(ctx, L.arrivals.x + 26, L.arrivals.y + L.arrivals.h - 47, 4, "#174778");
  drawPlant(ctx, L.arrivals.x + L.arrivals.w - 22, L.arrivals.y + 50, 0.78);
  drawPlant(ctx, L.arrivals.x + 20, L.arrivals.y + L.arrivals.h - 24, 0.74);
  text(ctx, "→ BAG DROP", L.arrivals.x + L.arrivals.w - 84, L.arrivals.y + L.arrivals.h - 19, C.amberHi, 9, "left", 900, true);
  text(ctx, "→ CONTROLLI", L.arrivals.x + L.arrivals.w - 94, L.arrivals.y + 30, C.teal, 9, "left", 900, true);

  const totalLoad = s.securityQueue + s.clearedPool + s.flights.reduce((a, f) => a + Math.max(0, f.pax - f.boarded), 0);
  const visibleArrivals = clamp(Math.round(4 + Math.sqrt(totalLoad) * 0.45), 5, 18);
  for (let i = 0; i < visibleArrivals; i += 1) {
    const p = ((tick * (0.02 + s.speed * 0.011) + i / visibleArrivals) % 1);
    const x = lerp(L.entry.x + 6, L.arrivals.x + L.arrivals.w - 40, p);
    const y = lerp(L.entry.y, L.arrivals.y + L.arrivals.h * 0.62, p) + Math.sin((p + i) * 8) * 6;
    drawPassenger(ctx, x, y, paxColor(i, theme, secPressure * 0.7), 0.76, paxMood(secPressure * 0.55, i), tick + i);
    if (i % 3 === 0) drawSuitcase(ctx, x - 10, y + 8, i % 2 ? C.amber : C.green, 0.55, tick + i);
  }
}

function drawBagDrop(ctx, L, s, theme, tick, bagPressure) {
  drawZone(ctx, L.bagDrop, "BAG DROP", {
    stroke: bagPressure > 0.72 ? C.red : C.amber,
    fill: "rgba(135,78,132,.44)",
    label: "#37213c",
    labelColor: C.amberHi,
    tileColor: "rgba(144,78,130,.50)",
    glow: bagPressure > 0.72,
  });
  const desks = Math.min(6, 2 + Math.floor(s.gates / 2));
  for (let i = 0; i < desks; i += 1) {
    const x = L.bagDrop.x + 18 + i * 38;
    drawCheckInCounter(ctx, x, L.bagDrop.y + 47, 32, 20, `D${i + 1}`, i < desks);
  }
  drawRopeQueue(ctx, L.bagDrop.x + 20, L.bagDrop.y + 86, L.bagDrop.w - 44, 2, C.amber);
  drawBaggageBelt(ctx, L.bagDrop.x + 18, L.bagDrop.y + L.bagDrop.h - 38, L.bagDrop.w - 36, 18, tick, C.amber);
  text(ctx, "valigie → sorting", L.bagDrop.x + 24, L.bagDrop.y + L.bagDrop.h - 47, C.amberHi, 8, "left", 900, true);

  const bagPeople = clamp(Math.round(3 + Math.sqrt(s.securityQueue + s.clearedPool) * 0.25), 3, 14);
  for (let i = 0; i < bagPeople; i += 1) {
    const cols = 5;
    const x = L.bagDrop.x + 31 + (i % cols) * 32 + Math.sin(tick + i) * 2;
    const y = L.bagDrop.y + 105 + Math.floor(i / cols) * 23;
    if (y < L.bagDrop.y + L.bagDrop.h - 22) {
      drawPassenger(ctx, x, y, paxColor(i + 5, theme, bagPressure), 0.58, paxMood(bagPressure, i), tick + i);
      if (i % 2 === 0) drawSuitcase(ctx, x + 12, y + 7, i % 4 ? C.amber : C.green, 0.52, tick + i);
    }
  }
  const bags = clamp(5 + Math.floor((s.securityQueue + s.clearedPool) / 90), 5, 16);
  for (let i = 0; i < bags; i += 1) {
    const p = ((tick * 0.13 * Math.max(1, s.speed) + i / bags) % 1);
    drawSuitcase(ctx, L.bagDrop.x + 30 + p * (L.bagDrop.w - 60), L.bagDrop.y + L.bagDrop.h - 29, i % 3 === 0 ? C.green : i % 4 === 0 ? C.red : C.amber, 0.68, tick + i);
  }
}

function drawSecurity(ctx, L, s, theme, tick, secPressure) {
  const warning = secPressure > 0.7 || s.lastBottleneck === "security";
  const primary = warning ? C.red : secPressure > 0.45 ? C.amber : theme.primary || C.teal;
  drawZone(ctx, L.security, "CONTROLLI", {
    stroke: primary,
    fill: "rgba(56,104,186,.48)",
    label: "#113157",
    labelColor: C.amberHi,
    tileColor: "rgba(56,104,186,.56)",
    glow: s.lastBottleneck === "security" || s.upgradeNotice?.type === "security",
  });

  drawOverheadSign(ctx, L.security.x + 18, L.security.y + 43, Math.min(180, L.security.w - 36), "SECURITY", `${Math.round(s.estWait)} min · ${s.lanes} corsie`, primary);

  // more airport-like queue maze on the left side
  const queueW = Math.max(92, L.security.w * 0.46);
  drawQueueMaze(ctx, L.security.x + 24, L.security.y + 96, queueW, Math.min(5, Math.max(2, Math.ceil(s.lanes / 2) + 1)), warning ? C.red : C.teal);

  // visual lane bank: each upgrade adds real machinery
  const laneCount = s.lanes;
  const laneGap = Math.min(42, (L.security.h - 92) / Math.max(1, laneCount));
  const laneH = Math.max(28, Math.min(38, laneGap - 6));
  const laneX = L.security.x + L.security.w * 0.49;
  const laneW = L.security.w * 0.46;
  for (let i = 0; i < laneCount; i += 1) {
    const yy = L.security.y + 88 + i * laneGap;
    if (yy + laneH < L.security.y + L.security.h - 12) {
      drawSecurityLane(ctx, laneX, yy, laneW, laneH, `S${i + 1}`, warning, true, tick + i * 0.21);
      if (i % 2 === 0) drawOfficer(ctx, laneX - 10, yy + laneH / 2 + 5, tick + i, warning ? C.red : "#2f7fd1");
    }
  }

  // trays / tiny bags waiting before X-ray
  const trayCount = Math.min(10, Math.ceil(s.securityQueue / 28));
  for (let i = 0; i < trayCount; i += 1) {
    const x = L.security.x + 28 + (i % 5) * 19;
    const y = L.security.y + L.security.h - 31 + Math.floor(i / 5) * 12;
    rr(ctx, x, y, 13, 8, 2);
    ctx.fillStyle = i % 4 === 0 ? "#ffd166" : "#d9e4f2";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const qCount = clamp(Math.ceil(s.securityQueue / 9), 6, 44);
  const qCols = Math.max(5, Math.floor((queueW - 12) / 18));
  for (let i = 0; i < qCount; i += 1) {
    const row = Math.floor(i / qCols);
    const col = row % 2 ? qCols - 1 - (i % qCols) : i % qCols;
    const x = L.security.x + 31 + col * 18;
    const y = L.security.y + 112 + row * 21;
    if (y < L.security.y + L.security.h - 42) drawPassenger(ctx, x, y, paxColor(i + 9, theme, secPressure), 0.53, paxMood(secPressure, i), tick + i);
  }

  // small pulse when bottleneck appears
  if (warning) {
    ctx.save();
    ctx.globalAlpha = 0.16 + Math.sin(tick * 5) * 0.06;
    rr(ctx, L.security.x + 8, L.security.y + 8, L.security.w - 16, L.security.h - 16, 20);
    ctx.strokeStyle = C.red;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();
  }
}

function drawAirside(ctx, L, s, theme, tick) {
  drawZone(ctx, L.airside, "LOUNGE", {
    stroke: C.purple,
    fill: "rgba(80,70,154,.46)",
    label: "#241d48",
    labelColor: C.amberHi,
    tileColor: "rgba(80,70,154,.54)",
  });
  drawOverheadSign(ctx, L.airside.x + 18, L.airside.y + 44, Math.min(160, L.airside.w - 34), "AIRSIDE", "negozi · gate →", C.purple);
  drawSeatIsland(ctx, L.airside.x + 22, L.airside.y + 90, 4, 2, "#174778");
  drawSeatIsland(ctx, L.airside.x + 112, L.airside.y + 90, 3, 2, "#205288");
  drawPlant(ctx, L.airside.x + L.airside.w - 24, L.airside.y + L.airside.h - 28, 0.8);
  drawFlightBoard(ctx, L.airside.x + L.airside.w - 90, L.airside.y + 46, 72, 40, C.purple, ["G1 BOARD", "G2 WAIT", "G3 OPEN"]);
  drawInfoDesk(ctx, L.airside.x + 20, L.airside.y + L.airside.h - 38, 70, 22, "SHOP");
  text(ctx, "GATE →", L.airside.x + L.airside.w - 72, L.airside.y + L.airside.h - 20, C.purple, 10, "left", 950, true);

  const loungePax = clamp(Math.ceil(s.clearedPool / 11), 4, 18);
  const cols = Math.max(4, Math.floor((L.airside.w - 44) / 22));
  for (let i = 0; i < loungePax; i += 1) {
    const x = L.airside.x + 28 + (i % cols) * 22;
    const y = L.airside.y + 78 + Math.floor(i / cols) * 23;
    if (y < L.airside.y + L.airside.h - 18) drawPassenger(ctx, x, y, paxColor(i + 13, theme, 0.2), 0.52, "good", tick + i);
  }
}

function drawGates(ctx, L, s, theme, tick, gatePressure) {
  const pressureColor = gatePressure > 0.88 ? C.red : gatePressure > 0.65 ? C.amber : theme.primary || C.blue;
  drawZone(ctx, L.gates, "IMBARCHI", {
    stroke: pressureColor,
    fill: "rgba(87,67,148,.48)",
    label: "#102a4d",
    labelColor: C.amberHi,
    tileColor: "rgba(87,67,148,.56)",
    glow: s.lastBottleneck === "gate" || s.upgradeNotice?.type === "gate",
  });
  drawOverheadSign(ctx, L.gates.x + 18, L.gates.y + 42, Math.min(210, L.gates.w - 36), "GATE AREA", `${s.occCount}/${s.gates} occupati`, pressureColor);

  // central concourse carpet makes the gate area less like floating boxes
  ctx.save();
  rr(ctx, L.gates.x + 14, L.gates.y + L.gates.h - 32, L.gates.w - 28, 16, 8);
  ctx.fillStyle = "rgba(246,166,35,.12)";
  ctx.fill();
  ctx.strokeStyle = "rgba(246,166,35,.24)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  L.gateRects.forEach((g, i) => {
    const f = s.flights.find((flight) => flight.gate === i);
    const ready = f?.status === "ready";
    const delayed = f?.age > 24;
    const status = delayed ? "RITARDO" : ready ? "PRONTO" : f ? "BOARD" : "LIBERO";
    const stroke = ready ? C.green : delayed ? C.red : f ? C.amber : "rgba(255,255,255,.34)";
    drawPremiumGatePod(ctx, g, f?.code || `G${i + 1}`, status, stroke, tick + i);

    // jet bridge/door detail on the right side of each gate pod
    drawJetBridge(ctx, g.x + g.w - 12, g.y + g.h * 0.52, L.gates.x + L.gates.w - 6, g.y + g.h * 0.52 + (i % 2 ? 8 : -8), stroke);

    if (f) {
      const pct = clamp(f.boarded / f.pax, 0, 1);
      rr(ctx, g.x + 10, g.y + g.h - 13, g.w - 20, 6, 4);
      ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fill();
      rr(ctx, g.x + 10, g.y + g.h - 13, (g.w - 20) * pct, 6, 4);
      ctx.fillStyle = stroke; ctx.fill();

      const gatePax = Math.min(10, Math.ceil((f.pax - f.boarded) / 10));
      for (let p = 0; p < gatePax; p += 1) {
        const px = g.x + 18 + (p % 5) * 15;
        const py = g.y + 70 + Math.floor(p / 5) * 17;
        if (py < g.y + g.h - 18) drawPassenger(ctx, px, py, delayed ? C.red : ready ? C.green : theme.primary || C.blue, 0.43, delayed ? "critical" : ready ? "good" : "waiting", tick + p);
      }
      // boarding light pulse at gate door
      ctx.save();
      ctx.globalAlpha = 0.25 + Math.sin(tick * 4 + i) * 0.10;
      ctx.fillStyle = stroke;
      ctx.beginPath(); ctx.arc(g.x + g.w - 13, g.y + 45, 9, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  });
}

function drawBaggageAndCafe(ctx, L, s, tick, bagPressure) {
  drawZone(ctx, L.baggage, "BAGAGLI", {
    stroke: bagPressure > 0.72 ? C.red : C.runway,
    fill: "rgba(89,74,118,.42)",
    label: "#332918",
    labelColor: C.amberHi,
    tileColor: "rgba(89,74,118,.50)",
  });
  drawBaggageBelt(ctx, L.baggage.x + 22, L.baggage.y + 56, L.baggage.w - 44, 24, tick, C.runway);
  for (let i = 0; i < 12; i += 1) {
    const p = ((tick * 0.13 * Math.max(1, s.speed) + i / 12) % 1);
    drawSuitcase(ctx, L.baggage.x + 34 + p * (L.baggage.w - 68), L.baggage.y + 68 + Math.sin(p * Math.PI * 2) * 2, i % 3 === 0 ? C.green : i % 4 === 0 ? C.red : C.amber, 0.82, tick + i);
  }

  drawZone(ctx, L.cafe, "CAFFÈ", {
    stroke: "#ffb86b",
    fill: "rgba(126,79,55,.42)",
    label: "#4a2e1c",
    labelColor: "#ffd9a3",
    tileColor: "rgba(126,79,55,.50)",
  });
  drawInfoDesk(ctx, L.cafe.x + 18, L.cafe.y + 58, L.cafe.w - 36, 22, "☕");
  drawPlant(ctx, L.cafe.x + L.cafe.w - 18, L.cafe.y + L.cafe.h - 26, 0.64);
}

function drawApron(ctx, L, s, tick, now) {
  drawZone(ctx, L.apron, "APRON + PISTA", {
    stroke: s.event?.type === "weather" ? C.red : C.runway,
    fill: "rgba(40,44,54,.62)",
    label: "#2c2914",
    labelColor: C.amberHi,
    tileColor: "rgba(40,44,54,.54)",
    glow: s.lastBottleneck === "runway" || s.upgradeNotice?.type === "runway",
  });

  const runwayY = L.apron.y + L.apron.h * 0.67;
  rr(ctx, L.apron.x + 18, runwayY - 25, L.apron.w - 36, 50, 16);
  ctx.fillStyle = "rgba(13,17,24,.88)"; ctx.fill();
  ctx.strokeStyle = s.event?.type === "weather" ? C.red : C.runway; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.save();
  ctx.strokeStyle = s.event?.type === "weather" ? C.red : C.runway;
  ctx.globalAlpha = 0.72; ctx.lineWidth = 5; ctx.setLineDash([30, 26]); ctx.lineDashOffset = -now * 0.05 * Math.max(1, s.speed);
  ctx.beginPath(); ctx.moveTo(L.apron.x + 38, runwayY); ctx.lineTo(L.apron.x + L.apron.w - 38, runwayY); ctx.stroke();
  ctx.restore();

  if (s.runwayLevel >= 2) {
    ctx.save();
    ctx.strokeStyle = C.teal; ctx.lineWidth = 4; ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.moveTo(L.apron.x + 34, L.apron.y + 50); ctx.lineTo(L.apron.x + L.apron.w - 46, L.apron.y + 50); ctx.stroke();
    ctx.restore();
    text(ctx, "TAXI", L.apron.x + 36, L.apron.y + 44, C.teal, 9, "left", 950, true);
  }
  if (s.runwayLevel >= 3) {
    rr(ctx, L.apron.x + L.apron.w - 50, L.apron.y + 20, 20, 48, 5); ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fill(); ctx.strokeStyle = C.teal; ctx.lineWidth = 2; ctx.stroke();
    rr(ctx, L.apron.x + L.apron.w - 58, L.apron.y + 9, 36, 14, 5); ctx.fillStyle = "rgba(59,213,221,.16)"; ctx.fill(); ctx.stroke();
  }
  if (s.runwayLevel >= 4) {
    for (let i = 0; i < 14; i += 1) {
      const lx = L.apron.x + 38 + (L.apron.w - 76) * (i / 13);
      ctx.fillStyle = i % 2 ? C.blue : C.runway;
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(tick * 4 + i);
      ctx.beginPath(); ctx.arc(lx, runwayY + 21, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const cartP = (tick * 0.045 * Math.max(1, s.speed)) % 1;
  drawServiceCart(ctx, lerp(L.baggage.x + L.baggage.w, L.apron.x + 80, cartP), lerp(L.baggage.y + 70, L.apron.y + 42, cartP), tick);
  const runwayActive = Boolean(s.lastDeparted) || s.event?.type === "weather";
  const planeP = ((tick * 0.08 * Math.max(1, s.speed)) % 1);
  const planeX = lerp(L.apron.x + 80, L.apron.x + L.apron.w - 90, runwayActive ? planeP : 0.12);
  drawPlaneTop(ctx, planeX, runwayY - 5, runwayActive, "#f3f7fb", s.runwayLevel >= 3 ? 0.70 : 0.62, -0.08);
  text(ctx, `${s.runwayLevel} LVL`, L.apron.x + L.apron.w - 20, L.apron.y + 31, C.runway, 10, "right", 950, true);
}

function drawUpgradeToast(ctx, W, notice) {
  if (!notice) return;
  const alpha = clamp(notice.ttl / 9, 0, 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  rr(ctx, W / 2 - 145, 14, 290, 40, 14);
  ctx.fillStyle = "rgba(9,18,28,.88)";
  ctx.fill();
  ctx.strokeStyle = C.green;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, `UPGRADE INSTALLATO · ${notice.label.toUpperCase()}`, W / 2, 39, C.green, 12, "center", 950, true);
  ctx.restore();
}

export function TerminalCanvas({ state }) {
  const ref = useRef(null);
  const stateRef = useRef(state);
  const cameraRef = useRef(1);
  stateRef.current = state;

  useEffect(() => {
    const canvas = ref.current;
    let raf = 0;

    function draw(now) {
      const s = stateRef.current;
      const theme = s.airportTheme || {};
      const { ctx, w, h } = fitCanvas(canvas);
      const tick = now / 1000;
      const tier = tierFor(s);
      const targetScale = 1 - (tier - 1) * 0.055;
      cameraRef.current = lerp(cameraRef.current, targetScale, 0.055);

      drawSceneBackground(ctx, w, h, theme);
      drawUpgradeToast(ctx, w, s.upgradeNotice);

      const scale = cameraRef.current;
      const W = w / scale;
      const H = h / scale;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.translate(-W / 2, -H / 2);

      const L = layout(W, H, s);
      const secPressure = clamp(s.securityQueue / 520, 0, 1);
      const gatePressure = clamp(s.occCount / Math.max(1, s.gates), 0, 1);
      const bagPressure = clamp((s.securityQueue * 0.18 + s.clearedPool * 0.08) / 120, 0, 1);

      text(ctx, `ART KIT V1 · ZOOM TIER ${tier}`, L.pad, 28, "rgba(255,255,255,.48)", 10, "left", 850, true);
      text(ctx, s.airportName || "Airport", W - L.pad, 28, theme.primary || C.teal, 12, "right", 950, true);

      // Outside arrival curb
      drawBus(ctx, L.curb.x + 24 + Math.sin(tick * 0.6) * 5, L.curb.y + 25, tick);
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 3; ctx.setLineDash([18, 16]);
      ctx.beginPath(); ctx.moveTo(L.curb.x + 8, L.curb.y + L.curb.h - 18); ctx.lineTo(L.curb.x + L.curb.w - 10, L.curb.y + L.curb.h - 18); ctx.stroke();
      ctx.restore();

      drawTerminalShell(ctx, L, theme);
      drawArrivals(ctx, L, s, theme, tick, secPressure);
      drawBagDrop(ctx, L, s, theme, tick, bagPressure);
      drawSecurity(ctx, L, s, theme, tick, secPressure);
      drawAirside(ctx, L, s, theme, tick);
      drawGates(ctx, L, s, theme, tick, gatePressure);
      drawBaggageAndCafe(ctx, L, s, tick, bagPressure);
      drawApron(ctx, L, s, tick, now);

      // Animated flows
      drawFlow(ctx, [
        { x: L.entry.x, y: L.entry.y },
        { x: L.arrivals.x + L.arrivals.w * 0.84, y: L.arrivals.y + L.arrivals.h * 0.62 },
        { x: L.security.x + 22, y: L.security.y + L.security.h * 0.62 },
        { x: L.security.x + L.security.w + 14, y: L.security.y + L.security.h * 0.62 },
        { x: L.airside.x + L.airside.w - 10, y: L.airside.y + L.airside.h * 0.50 },
        { x: L.gates.x + 16, y: L.gates.y + L.gates.h * 0.52 },
      ], theme.primary || C.teal, now, s.running, 5);
      drawFlow(ctx, [
        { x: L.bagDrop.x + L.bagDrop.w - 20, y: L.bagDrop.y + L.bagDrop.h - 28 },
        { x: L.baggage.x + 20, y: L.baggage.y + 66 },
        { x: L.apron.x + 58, y: L.apron.y + 42 },
      ], C.amber, now, s.running, 4);

      // Active boarding stream
      const activeGateIndex = s.flights.find((f) => f.status === "board")?.gate;
      const activeGate = typeof activeGateIndex === "number" ? L.gateRects[activeGateIndex] : null;
      if (activeGate) {
        for (let i = 0; i < 12; i += 1) {
          const p = ((tick * 0.075 * Math.max(1, s.speed) + i / 12) % 1);
          drawPassenger(ctx, lerp(L.airside.x + L.airside.w, activeGate.cx, p), lerp(L.airside.y + L.airside.h * 0.52, activeGate.cy, p) + Math.sin((p + i) * 8) * 4, i % 4 === 0 ? C.green : theme.primary || C.blue, 0.5, "good", tick + i);
        }
      }

      // Status chip inside scene
      const totalLoad = s.securityQueue + s.clearedPool + s.flights.reduce((a, f) => a + Math.max(0, f.pax - f.boarded), 0);
      const visualPax = clamp(Math.round(6 + Math.sqrt(totalLoad) * 1.6), 8, 54);
      ctx.save();
      rr(ctx, W - 295, H - 55, 270, 36, 13);
      ctx.fillStyle = "rgba(9,18,28,.78)"; ctx.fill();
      ctx.strokeStyle = s.upgradeNotice ? C.green : (s.event ? (s.event.type === "weather" ? C.red : C.amber) : C.teal);
      ctx.lineWidth = 2; ctx.stroke();
      const status = s.upgradeNotice ? s.upgradeNotice.label : s.event ? s.event.label : `Carico visivo: ${visualPax} passeggeri`;
      text(ctx, status.toUpperCase(), W - 281, H - 32, s.upgradeNotice ? C.green : C.amberHi, 10, "left", 950, true);
      ctx.restore();

      ctx.restore();
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="terminal-canvas" aria-label="Vista operativa live dell'aeroporto" />;
}
