import { PALETTE as C } from "../sim/constants";

export function rr(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function text(ctx, value, x, y, color = C.text, size = 11, align = "left", weight = 900, mono = false) {
  ctx.save();
  ctx.font = `${weight} ${size}px ${mono ? 'ui-monospace, "SF Mono", Menlo, monospace' : 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(value, x, y);
  ctx.restore();
}

export const ART = {
  ink: "rgba(5, 10, 18, .72)",
  dark: "#0b1624",
  wallPurple: "#5d4d91",
  wallBlue: "#315f91",
  floorViolet: "#5a4aa3",
  floorBlue: "#396eaf",
  floorWarm: "#9a5f66",
  cream: "#f5d99b",
  orange: "#f5a340",
  sign: "#102231",
  glass: "rgba(190, 238, 255, .58)",
  plant: "#68d391",
  bench: "#174778",
  desk: "#b97b50",
  belt: "#101822",
};

export function drawTileFloor(ctx, rect, colorA = "rgba(97,75,166,.45)", colorB = "rgba(255,255,255,.08)") {
  ctx.save();
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 18);
  ctx.clip();
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, colorA);
  g.addColorStop(1, "rgba(35,46,86,.42)");
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.strokeStyle = colorB;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.36;
  for (let x = rect.x - 40; x < rect.x + rect.w + 40; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, rect.y);
    ctx.lineTo(x + 40, rect.y + rect.h);
    ctx.stroke();
  }
  for (let y = rect.y; y < rect.y + rect.h; y += 24) {
    ctx.beginPath();
    ctx.moveTo(rect.x, y);
    ctx.lineTo(rect.x + rect.w, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawZone(ctx, rect, title, opts = {}) {
  const {
    fill = "rgba(92,70,150,.38)",
    stroke = "rgba(255,255,255,.22)",
    label = ART.sign,
    labelColor = C.amberHi,
    glow = false,
    tileColor = fill,
    radius = 22,
  } = opts;
  ctx.save();
  rr(ctx, rect.x, rect.y, rect.w, rect.h, radius);
  ctx.fillStyle = fill;
  ctx.shadowColor = "rgba(0,0,0,.38)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 7;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = glow ? 4 : 2;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  if (glow) {
    ctx.globalAlpha = 0.22;
    ctx.shadowColor = stroke;
    ctx.shadowBlur = 30;
    ctx.stroke();
  }
  ctx.restore();

  drawTileFloor(ctx, { x: rect.x + 8, y: rect.y + 39, w: rect.w - 16, h: rect.h - 47 }, tileColor);

  const lw = Math.min(rect.w - 28, Math.max(92, title.length * 8.7 + 34));
  ctx.save();
  rr(ctx, rect.x + 13, rect.y + 9, lw, 28, 8);
  ctx.fillStyle = label;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, title, rect.x + 13 + lw / 2, rect.y + 28, labelColor, 13, "center", 950, true);
  ctx.restore();
}

export function drawWallWindows(ctx, rect, color = C.teal) {
  ctx.save();
  const x = rect.x + rect.w - 18;
  for (let y = rect.y + 52; y < rect.y + rect.h - 20; y += 26) {
    rr(ctx, x - 10, y, 10, 18, 4);
    ctx.fillStyle = "rgba(189,239,255,.38)";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawGlassDoors(ctx, x, y, w, h, phase = 0, color = C.green) {
  const open = Math.abs(Math.sin(phase * 2.2)) * Math.min(18, w * 0.22);
  ctx.save();
  rr(ctx, x, y, w, h, 9);
  ctx.fillStyle = ART.dark;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.fillStyle = ART.glass;
  rr(ctx, x + 9 - open / 2, y + 5, w / 2 - 10, h - 10, 5);
  ctx.fill();
  rr(ctx, x + w / 2 + 1 + open / 2, y + 5, w / 2 - 10, h - 10, 5);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 4);
  ctx.lineTo(x + w / 2, y + h - 4);
  ctx.stroke();
  ctx.restore();
}

export function drawFlightBoard(ctx, x, y, w = 82, h = 46, color = C.teal, rows = ["AZ 214  ON", "FR 882  G2", "LH 091  08"] ) {
  ctx.save();
  rr(ctx, x, y, w, h, 7);
  ctx.fillStyle = "#07111a";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, "VOLI", x + 8, y + 14, color, 8, "left", 950, true);
  rows.slice(0, 3).forEach((r, i) => text(ctx, r, x + 8, y + 27 + i * 9, i === 0 ? C.green : C.dim, 7.5, "left", 900, true));
  ctx.restore();
}

export function drawPlant(ctx, x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  rr(ctx, -7, 10, 15, 12, 4);
  ctx.fillStyle = "#8a543c";
  ctx.fill();
  ctx.strokeStyle = ART.ink;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = ART.plant;
  ctx.lineCap = "round";
  ctx.lineWidth = 4;
  [[-6,4,-15,-9],[-1,4,-4,-17],[4,4,8,-14],[8,7,18,-5],[-9,8,-18,1]].forEach((p) => {
    ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[2], p[3]); ctx.stroke();
  });
  ctx.restore();
}

export function drawBench(ctx, x, y, seats = 4, color = ART.bench) {
  ctx.save();
  for (let i = 0; i < seats; i += 1) {
    rr(ctx, x + i * 18, y, 15, 13, 5);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = ART.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.08)";
    ctx.fillRect(x + i * 18 + 3, y + 3, 9, 2);
  }
  ctx.restore();
}

export function drawInfoDesk(ctx, x, y, w = 82, h = 26, label = "INFO") {
  ctx.save();
  rr(ctx, x, y, w, h, 7);
  ctx.fillStyle = ART.desk;
  ctx.fill();
  ctx.strokeStyle = ART.ink;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  rr(ctx, x + w / 2 - 18, y - 15, 36, 15, 5);
  ctx.fillStyle = ART.sign;
  ctx.fill();
  ctx.strokeStyle = C.teal;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  text(ctx, label, x + w / 2, y - 4, C.teal, 8, "center", 950, true);
  ctx.restore();
}

export function drawCheckInCounter(ctx, x, y, w = 34, h = 20, label = "D1", active = true) {
  ctx.save();
  rr(ctx, x, y, w, h, 5);
  ctx.fillStyle = active ? "#c08d55" : "#775a49";
  ctx.fill();
  ctx.strokeStyle = ART.ink;
  ctx.lineWidth = 2;
  ctx.stroke();
  rr(ctx, x + 4, y - 13, w - 8, 10, 3);
  ctx.fillStyle = ART.sign;
  ctx.fill();
  ctx.strokeStyle = active ? C.amber : C.dim2;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(ctx, label, x + w / 2, y - 5, active ? C.amberHi : C.dim, 7.5, "center", 950, true);
  ctx.restore();
}

export function drawBaggageBelt(ctx, x, y, w, h = 18, phase = 0, color = C.amber) {
  ctx.save();
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = ART.belt;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.clip();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = "rgba(255,255,255,.45)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 10]);
  ctx.lineDashOffset = -phase * 22;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + h / 2);
  ctx.lineTo(x + w - 6, y + h / 2);
  ctx.stroke();
  ctx.restore();
}

export function drawRopeQueue(ctx, x, y, w, rows = 2, color = C.amber) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = 2;
  for (let r = 0; r < rows; r += 1) {
    const yy = y + r * 26;
    ctx.setLineDash([12, 8]);
    ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i <= 4; i += 1) {
      const px = x + (w / 4) * i;
      ctx.beginPath(); ctx.arc(px, yy, 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
      ctx.beginPath(); ctx.moveTo(px, yy); ctx.lineTo(px, yy + 15); ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawSecurityScanner(ctx, x, y, active = true, warning = false, phase = 0) {
  ctx.save();
  rr(ctx, x, y, 32, 36, 8);
  ctx.fillStyle = warning ? "rgba(255,93,104,.24)" : "rgba(59,213,221,.18)";
  ctx.fill();
  ctx.strokeStyle = warning ? C.red : C.teal;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.55)";
  ctx.beginPath(); ctx.moveTo(x + 6, y + 18); ctx.lineTo(x + 26, y + 18); ctx.stroke();
  ctx.fillStyle = warning ? C.red : active ? C.green : C.dim2;
  ctx.beginPath(); ctx.arc(x + 16, y - 7, 4 + (active ? Math.sin(phase * 5) * 1.2 : 0), 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawGatePod(ctx, rect, title, status = "LIBERO", color = C.teal) {
  ctx.save();
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fillStyle = "rgba(21,52,90,.42)";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, title, rect.x + 9, rect.y + 18, C.amberHi, 12, "left", 950, true);
  rr(ctx, rect.x + rect.w - 54, rect.y + 8, 45, 18, 6);
  ctx.fillStyle = ART.sign;
  ctx.fill();
  text(ctx, status, rect.x + rect.w - 31, rect.y + 21, color, 7.2, "center", 950, true);
  drawBench(ctx, rect.x + 10, rect.y + 31, Math.min(3, Math.floor(rect.w / 25)), ART.bench);
  drawInfoDesk(ctx, rect.x + rect.w - 46, rect.y + 34, 34, 16, "");
  ctx.restore();
}

export function drawSuitcase(ctx, x, y, color = C.amber, scale = 1, phase = 0) {
  ctx.save();
  ctx.translate(x, y + Math.sin(phase * Math.PI * 2) * 0.6);
  ctx.fillStyle = "rgba(0,0,0,.22)";
  ctx.beginPath(); ctx.ellipse(0, 8, 7 * scale, 2.4 * scale, 0, 0, Math.PI * 2); ctx.fill();
  rr(ctx, -6 * scale, -2 * scale, 12 * scale, 10 * scale, 3 * scale);
  ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = ART.ink; ctx.lineWidth = 1.6 * scale; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -2 * scale, 3 * scale, Math.PI, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

export function drawPassenger(ctx, x, y, color, scale = 1, mood = "normal", phase = 0, facing = "right") {
  const outline = ART.ink;
  const visor = mood === "critical" ? "#ffd4d4" : mood === "waiting" ? "#ffe4a3" : mood === "good" ? "#d8ffe9" : "#bcefff";
  const bob = Math.sin(phase * Math.PI * 2) * 1.6 * scale;
  ctx.save();
  ctx.translate(x, y + bob);
  if (facing === "left") ctx.scale(-1, 1);

  ctx.fillStyle = "rgba(0,0,0,.24)";
  ctx.beginPath(); ctx.ellipse(1 * scale, 10 * scale, 8.4 * scale, 3 * scale, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = color;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 2 * scale;
  rr(ctx, -9.5 * scale, -4.2 * scale, 6.2 * scale, 15.2 * scale, 4 * scale); ctx.fill(); ctx.stroke();

  rr(ctx, -6 * scale, -13 * scale, 16.5 * scale, 25.5 * scale, 8.5 * scale);
  const body = ctx.createLinearGradient(-6, -13, 12, 12);
  body.addColorStop(0, color);
  body.addColorStop(1, "rgba(0,0,0,.16)");
  ctx.fillStyle = body; ctx.fill(); ctx.stroke();

  rr(ctx, -5 * scale, 8 * scale, 6 * scale, 8 * scale, 3 * scale); ctx.fill(); ctx.stroke();
  rr(ctx, 4.3 * scale, 8 * scale, 6 * scale, 8 * scale, 3 * scale); ctx.fill(); ctx.stroke();

  rr(ctx, 0.2 * scale, -9 * scale, 11.4 * scale, 7.4 * scale, 4.2 * scale);
  const vg = ctx.createLinearGradient(0, -9, 12, -1);
  vg.addColorStop(0, visor);
  vg.addColorStop(1, "rgba(118,220,255,.88)");
  ctx.fillStyle = vg; ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.beginPath(); ctx.ellipse(3.3 * scale, -7.2 * scale, 2.2 * scale, 1.1 * scale, -0.35, 0, Math.PI * 2); ctx.fill();

  if (mood === "critical" || mood === "waiting") {
    ctx.beginPath(); ctx.arc(9 * scale, -14 * scale, 3.4 * scale, 0, Math.PI * 2);
    ctx.fillStyle = mood === "critical" ? C.red : C.amber;
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.2 * scale;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPlaneTop(ctx, x, y, active, color = "#f3f7fb", scale = 1, angle = -0.08) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.globalAlpha = active ? 1 : 0.78;

  ctx.fillStyle = "rgba(0,0,0,.28)";
  ctx.beginPath(); ctx.ellipse(0, 18, 44, 9, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(4,8,13,.65)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(54, 0);
  ctx.quadraticCurveTo(26, -12, -42, -8);
  ctx.quadraticCurveTo(-58, 0, -42, 8);
  ctx.quadraticCurveTo(26, 12, 54, 0);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = "#d9e4f2";
  ctx.beginPath(); ctx.moveTo(5, -7); ctx.lineTo(-18, -46); ctx.lineTo(-4, -47); ctx.lineTo(24, -7); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(5, 7); ctx.lineTo(-18, 46); ctx.lineTo(-4, 47); ctx.lineTo(24, 7); ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-38, -6); ctx.lineTo(-55, -27); ctx.lineTo(-44, -29); ctx.lineTo(-28, -7); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-38, 6); ctx.lineTo(-55, 27); ctx.lineTo(-44, 29); ctx.lineTo(-28, 7); ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.strokeStyle = "#4da3ff";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(38, 0); ctx.stroke();
  ctx.fillStyle = "#142333";
  for (let i = -24; i < 24; i += 10) { ctx.beginPath(); ctx.arc(i, -4, 1.8, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

export function drawBus(ctx, x, y, phase = 0) {
  ctx.save();
  ctx.translate(x, y);
  rr(ctx, 0, 0, 150, 42, 12);
  ctx.fillStyle = "#e5edf7"; ctx.fill();
  ctx.strokeStyle = ART.ink; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = "#e25b4f"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(14, 28); ctx.lineTo(134, 28); ctx.stroke();
  for (let i = 0; i < 5; i += 1) { rr(ctx, 18 + i * 22, 8, 16, 12, 3); ctx.fillStyle = "#21364a"; ctx.fill(); }
  ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(28, 43, 8, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(122, 43, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.amber; ctx.globalAlpha = 0.25 + 0.1 * Math.sin(phase * 2); ctx.fillRect(2, 18, 16, 6);
  ctx.restore();
}

export function drawServiceCart(ctx, x, y, phase = 0) {
  ctx.save();
  rr(ctx, x - 17, y - 9, 34, 18, 5);
  ctx.fillStyle = "#f28c28"; ctx.fill();
  ctx.strokeStyle = ART.ink; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(x - 10, y + 11, 3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(x + 10, y + 11, 3, 0, Math.PI * 2); ctx.fill();
  drawSuitcase(ctx, x + 22, y, C.amber, 0.66, phase);
  drawSuitcase(ctx, x + 34, y + 2, C.green, 0.55, phase + 0.3);
  ctx.restore();
}


export function drawOverheadSign(ctx, x, y, w, label, sub = "", color = C.teal) {
  ctx.save();
  rr(ctx, x, y, w, 34, 8);
  const g = ctx.createLinearGradient(x, y, x + w, y + 34);
  g.addColorStop(0, "#08131f");
  g.addColorStop(1, "#15283a");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, x + 10, y + 15, color, 10.5, "left", 950, true);
  if (sub) text(ctx, sub, x + 10, y + 27, "rgba(234,244,251,.68)", 7.8, "left", 850, true);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + w - 22, y + 11);
  ctx.lineTo(x + w - 10, y + 17);
  ctx.lineTo(x + w - 22, y + 23);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawQueueMaze(ctx, x, y, w, rows = 3, color = C.teal) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.globalAlpha = 0.75;
  for (let r = 0; r < rows; r += 1) {
    const yy = y + r * 24;
    ctx.beginPath();
    if (r % 2 === 0) {
      ctx.moveTo(x, yy);
      ctx.lineTo(x + w, yy);
      ctx.lineTo(x + w, yy + 16);
    } else {
      ctx.moveTo(x + w, yy);
      ctx.lineTo(x, yy);
      ctx.lineTo(x, yy + 16);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i <= 4; i += 1) {
    const px = x + (w / 4) * i;
    for (let r = 0; r < rows; r += 1) {
      const py = y + r * 24;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ART.ink;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawTrayTable(ctx, x, y, w = 54, phase = 0, color = C.amber) {
  ctx.save();
  rr(ctx, x, y, w, 15, 5);
  ctx.fillStyle = "rgba(8,16,24,.72)";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  const trays = 4;
  for (let i = 0; i < trays; i += 1) {
    const px = x + 8 + ((phase * 20 + i * 14) % Math.max(16, w - 16));
    rr(ctx, px - 4, y + 3, 9, 8, 2);
    ctx.fillStyle = "#d9e4f2";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSecurityLane(ctx, x, y, w, h, label = "L1", warning = false, active = true, phase = 0) {
  const color = warning ? C.red : active ? C.teal : C.dim2;
  ctx.save();
  rr(ctx, x, y, w, h, 12);
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, warning ? "rgba(255,93,104,.16)" : "rgba(59,213,221,.13)");
  g.addColorStop(1, "rgba(5,10,18,.16)");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = warning ? 3 : 2;
  ctx.stroke();

  // entrance belt / tray area
  drawTrayTable(ctx, x + 7, y + h / 2 - 8, Math.max(38, w * 0.32), phase, warning ? C.red : C.amber);

  // scanner arch
  const sx = x + w * 0.48;
  rr(ctx, sx - 13, y + 8, 30, h - 16, 8);
  ctx.fillStyle = warning ? "rgba(255,93,104,.24)" : "rgba(77,163,255,.20)";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.3;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.36)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(sx - 7, y + 15); ctx.lineTo(sx + 10, y + 15);
  ctx.moveTo(sx - 7, y + h - 15); ctx.lineTo(sx + 10, y + h - 15);
  ctx.stroke();

  // exit belt
  drawTrayTable(ctx, x + w * 0.62, y + h / 2 - 8, Math.max(38, w * 0.30), phase + 0.5, warning ? C.red : C.green);

  // status tower
  ctx.fillStyle = warning ? C.red : C.green;
  ctx.beginPath();
  ctx.arc(x + w - 12, y + 10, 4 + (active ? Math.sin(phase * 5) * 1.1 : 0), 0, Math.PI * 2);
  ctx.fill();
  text(ctx, label, x + 9, y + 13, color, 8, "left", 950, true);
  ctx.restore();
}

export function drawOfficer(ctx, x, y, phase = 0, color = "#2f7fd1") {
  ctx.save();
  ctx.translate(x, y + Math.sin(phase * 2) * 0.6);
  ctx.fillStyle = "rgba(0,0,0,.24)";
  ctx.beginPath(); ctx.ellipse(0, 10, 7, 2.7, 0, 0, Math.PI * 2); ctx.fill();
  rr(ctx, -6, -7, 12, 17, 6);
  ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = ART.ink; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -12, 6, 0, Math.PI * 2); ctx.fillStyle = "#f5d1a7"; ctx.fill(); ctx.stroke();
  rr(ctx, -7, -19, 14, 5, 3); ctx.fillStyle = "#17293d"; ctx.fill();
  ctx.restore();
}

export function drawSeatIsland(ctx, x, y, cols = 4, rows = 2, color = ART.bench) {
  ctx.save();
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      rr(ctx, x + c * 17, y + r * 17, 14, 13, 5);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = ART.ink;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawJetBridge(ctx, x1, y1, x2, y2, color = C.teal) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,.32)";
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = "rgba(229,237,247,.78)";
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

export function drawGateDisplay(ctx, x, y, w, code, status, color = C.teal) {
  ctx.save();
  rr(ctx, x, y, w, 26, 7);
  ctx.fillStyle = "#07111a";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, code, x + 8, y + 17, C.amberHi, 10, "left", 950, true);
  text(ctx, status, x + w - 8, y + 17, color, 8, "right", 950, true);
  ctx.restore();
}

export function drawPremiumGatePod(ctx, rect, code, status = "LIBERO", color = C.teal, phase = 0) {
  ctx.save();
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 14);
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, "rgba(31,68,118,.54)");
  g.addColorStop(1, "rgba(70,55,118,.40)");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = status === "RITARDO" ? 3 : 2;
  ctx.stroke();
  drawGateDisplay(ctx, rect.x + 8, rect.y + 8, rect.w - 16, code, status, color);
  drawSeatIsland(ctx, rect.x + 12, rect.y + 42, Math.min(4, Math.floor(rect.w / 23)), 2, ART.bench);
  drawInfoDesk(ctx, rect.x + rect.w - 47, rect.y + rect.h - 25, 37, 16, "");
  // boarding carpet / doorway
  rr(ctx, rect.x + rect.w - 18, rect.y + 41, 10, rect.h - 54, 5);
  ctx.fillStyle = status === "PRONTO" ? "rgba(97,211,148,.28)" : status === "RITARDO" ? "rgba(255,93,104,.24)" : "rgba(246,166,35,.18)";
  ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 1.3; ctx.stroke();
  if (status !== "LIBERO") {
    ctx.globalAlpha = 0.22 + Math.sin(phase * 4) * 0.08;
    ctx.fillStyle = color;
    rr(ctx, rect.x + 9, rect.y + rect.h - 16, rect.w - 18, 7, 5);
    ctx.fill();
  }
  ctx.restore();
}
