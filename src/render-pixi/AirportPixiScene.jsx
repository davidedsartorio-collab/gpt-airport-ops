import { useEffect, useRef } from "react";
import { Application, Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import { SCENE } from "./sceneLayout";

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const lerp = (a, b, t) => a + (b - a) * t;

function pathPoint(path, t) {
  const pts = path || [];
  if (pts.length === 0) return { x: 0, y: 0 };
  if (pts.length === 1) return pts[0];
  const scaled = clamp(t, 0, 0.9999) * (pts.length - 1);
  const i = Math.floor(scaled);
  const local = scaled - i;
  const a = pts[i];
  const b = pts[i + 1] || a;
  return { x: lerp(a.x, b.x, local), y: lerp(a.y, b.y, local) };
}


const NPC_TYPES = ["standard", "business", "budget", "family", "standard", "budget", "business", "vip"];
const NPC_STATES = ["idle", "walk1", "walk2", "waiting", "luggage"];
const PLANE_SPRITES = ["plane-blue", "plane-pink", "plane-teal", "plane-orange"];
const VEHICLE_SPRITES = ["baggage-train", "fuel-truck", "pushback-tug", "bus", "service-van"];

function npcUrl(type, state) {
  return `/assets/airport/terra01/sprites/npc/${type}-${state}.png`;
}

function planeUrl(name) {
  return `/assets/airport/terra01/sprites/planes/${name}.png`;
}

function vehicleUrl(name) {
  return `/assets/airport/terra01/sprites/vehicles/${name}.png`;
}

async function loadSpriteTextures() {
  const npcPaths = NPC_TYPES
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .flatMap((type) => NPC_STATES.map((state) => npcUrl(type, state)));
  const planePaths = PLANE_SPRITES.map(planeUrl);
  const vehiclePaths = VEHICLE_SPRITES.map(vehicleUrl);
  const paths = [...npcPaths, ...planePaths, ...vehiclePaths];
  const loaded = await Promise.all(paths.map((path) => Assets.load(path).then((texture) => [path, texture])));
  return Object.fromEntries(loaded);
}

function makeNpcSprite(texture, type = "standard") {
  const s = new Sprite(texture);
  s.anchor.set(0.5, 0.92);
  s.__type = type;
  s.__baseScale = type === "family" ? 0.18 : type === "vip" ? 0.26 : 0.30;
  s.scale.set(s.__baseScale);
  return s;
}

function makeImageSprite(texture, scale = 0.3, anchorY = 0.5) {
  const s = new Sprite(texture);
  s.anchor.set(0.5, anchorY);
  s.scale.set(scale);
  return s;
}

function visualLoad(state) {
  const gateLoad = state.flights.reduce((a, f) => a + Math.max(0, f.pax - f.boarded), 0);
  const load = state.securityQueue + state.clearedPool + gateLoad;
  return {
    total: load,
    visible: clamp(Math.round(8 + Math.sqrt(load) * 2.15), 12, 90),
    securityPressure: clamp(state.securityQueue / 520, 0, 1),
    gatePressure: clamp(state.occCount / Math.max(1, state.gates), 0, 1),
    runwayPressure: state.lastBottleneck === "runway" ? 1 : clamp(state.flights.filter((f) => f.status === "ready").length / 3, 0, 1),
  };
}

function makePassenger(color, scale = 1) {
  const c = new Container();
  c.scale.set(scale);

  const shadow = new Graphics();
  shadow.ellipse(0, 13, 11, 4).fill({ color: 0x000000, alpha: 0.24 });
  c.addChild(shadow);

  const backpack = new Graphics();
  backpack.roundRect(-12, -2, 8, 17, 4).fill(color).stroke({ color: 0x071018, width: 2, alpha: 0.82 });
  backpack.alpha = 0.82;
  c.addChild(backpack);

  const body = new Graphics();
  body.roundRect(-7, -15, 20, 31, 10).fill(color).stroke({ color: 0x071018, width: 2.5, alpha: 0.82 });
  c.addChild(body);

  const visor = new Graphics();
  visor.roundRect(2, -10, 14, 9, 5).fill(0xbcefff).stroke({ color: 0x071018, width: 2, alpha: 0.75 });
  c.addChild(visor);

  const feet = new Graphics();
  feet.roundRect(-5, 12, 7, 10, 4).fill(color).stroke({ color: 0x071018, width: 2, alpha: 0.82 });
  feet.roundRect(7, 12, 7, 10, 4).fill(color).stroke({ color: 0x071018, width: 2, alpha: 0.82 });
  c.addChild(feet);
  return c;
}

function makeSuitcase(color) {
  const c = new Container();
  const g = new Graphics();
  g.roundRect(-7, -6, 15, 17, 4).fill(color).stroke({ color: 0x071018, width: 2, alpha: 0.76 });
  g.arc(0, -6, 4, Math.PI, 0).stroke({ color: 0x071018, width: 2, alpha: 0.76 });
  c.addChild(g);
  return c;
}

function makePlane(color = 0xf4f7fb, accent = 0x4da3ff, scale = 0.82) {
  const c = new Container();
  c.scale.set(scale);
  const sh = new Graphics();
  sh.ellipse(0, 20, 52, 12).fill({ color: 0x000000, alpha: 0.22 });
  c.addChild(sh);

  const wings = new Graphics();
  wings.moveTo(4, -8).lineTo(-24, -52).lineTo(-6, -54).lineTo(30, -8).closePath().fill(0xdce7f4).stroke({ color: 0x071018, width: 2.2, alpha: 0.65 });
  wings.moveTo(4, 8).lineTo(-24, 52).lineTo(-6, 54).lineTo(30, 8).closePath().fill(0xdce7f4).stroke({ color: 0x071018, width: 2.2, alpha: 0.65 });
  c.addChild(wings);

  const tail = new Graphics();
  tail.moveTo(-44, -7).lineTo(-62, -28).lineTo(-50, -31).lineTo(-31, -8).closePath().fill(0xdce7f4).stroke({ color: 0x071018, width: 2, alpha: 0.65 });
  tail.moveTo(-44, 7).lineTo(-62, 28).lineTo(-50, 31).lineTo(-31, 8).closePath().fill(0xdce7f4).stroke({ color: 0x071018, width: 2, alpha: 0.65 });
  c.addChild(tail);

  const body = new Graphics();
  body.moveTo(60, 0).quadraticCurveTo(28, -14, -48, -9).quadraticCurveTo(-66, 0, -48, 9).quadraticCurveTo(28, 14, 60, 0).closePath().fill(color).stroke({ color: 0x071018, width: 2.5, alpha: 0.72 });
  body.moveTo(-35, 0).lineTo(42, 0).stroke({ color: accent, width: 3, alpha: 0.9 });
  for (let i = -24; i < 24; i += 10) body.circle(i, -4, 2).fill(0x142333);
  c.addChild(body);
  return c;
}

function makeGlowRect(rect, color, alpha = 0.45) {
  const g = new Graphics();
  g.roundRect(rect.x, rect.y, rect.w, rect.h, 18)
    .fill({ color, alpha: alpha * 0.08 })
    .stroke({ color, width: 5, alpha });
  return g;
}

function addLabel(layer, text, x, y, color = 0xffd166) {
  const t = new Text({
    text,
    style: {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 13,
      fontWeight: "900",
      fill: color,
      stroke: { color: 0x071018, width: 3 },
    },
  });
  t.anchor.set(0.5);
  t.x = x;
  t.y = y;
  layer.addChild(t);
  return t;
}

function makeRunwayLights(now, level) {
  const g = new Graphics();
  const count = level >= 3 ? 24 : 14;
  for (let i = 0; i < count; i += 1) {
    const y = 70 + i * 34;
    const pulse = 0.45 + Math.sin(now * 5 + i * 0.8) * 0.22;
    g.circle(1468, y, 3.3).fill({ color: i % 2 ? 0x61d394 : 0x4da3ff, alpha: pulse });
    g.circle(1532, y, 3.3).fill({ color: i % 2 ? 0x61d394 : 0x4da3ff, alpha: pulse });
  }
  if (level >= 2) {
    g.moveTo(1320, 530).lineTo(1390, 610).lineTo(1450, 700).stroke({ color: 0xffd166, width: 4, alpha: 0.82 });
  }
  if (level >= 3) {
    g.roundRect(1285, 430, 92, 110, 18).fill({ color: 0x102231, alpha: 0.25 }).stroke({ color: 0x61d394, width: 3, alpha: 0.65 });
  }
  return g;
}

function makeMissionClockArc(state) {
  const g = new Graphics();
  const pct = Math.min(1, Math.max(0, (state.minute - state.dayStartMinute) / Math.max(1, state.dayLength)));
  g.roundRect(30, 842, 330, 18, 9).fill({ color: 0x071018, alpha: 0.55 }).stroke({ color: 0xffd166, width: 2, alpha: 0.65 });
  g.roundRect(34, 846, 322 * pct, 10, 5).fill({ color: pct > 0.82 ? 0xff5d68 : 0x61d394, alpha: 0.92 });
  return g;
}


function drawDoor(g, rect, open, now, color = 0x4da3ff) {
  const glow = open ? 0x61d394 : 0xffd166;
  const alpha = open ? 0.34 + Math.sin(now * 8) * 0.08 : 0.18;
  g.roundRect(rect.x, rect.y, rect.w, rect.h, 8)
    .fill({ color: 0x071018, alpha: 0.16 })
    .stroke({ color: glow, width: open ? 3 : 1.5, alpha });
  const gap = open ? rect.w * 0.22 : 0;
  const panelW = rect.w * 0.42;
  g.roundRect(rect.x + 4 - gap, rect.y + 5, panelW, rect.h - 10, 5)
    .fill({ color: color, alpha: open ? 0.12 : 0.26 })
    .stroke({ color: 0xbcefff, width: 1.2, alpha: open ? 0.5 : 0.22 });
  g.roundRect(rect.x + rect.w - panelW - 4 + gap, rect.y + 5, panelW, rect.h - 10, 5)
    .fill({ color: color, alpha: open ? 0.12 : 0.26 })
    .stroke({ color: 0xbcefff, width: 1.2, alpha: open ? 0.5 : 0.22 });
  g.circle(rect.x + rect.w / 2, rect.y - 5, 4).fill({ color: open ? 0x61d394 : 0xffd166, alpha: 0.9 });
}

function makeStateLayer(state, now, load) {
  const g = new Graphics();
  drawDoor(g, SCENE.doors.entrance, load.visible > 16 || state.event?.type === "rush", now, 0x4da3ff);
  drawDoor(g, SCENE.doors.securityExit, state.lanes > 3 || state.securityQueue > 80, now, 0xb989ff);

  SCENE.doors.gates.forEach((door, i) => {
    const f = state.flights.find((flight) => flight.gate === i);
    const open = !!f && (f.status === "board" || f.status === "ready");
    drawDoor(g, door, open, now, f?.age > 24 ? 0xff5d68 : 0x4da3ff);
    if (f?.age > 24) {
      g.roundRect(door.x - 5, door.y + door.h + 5, door.w + 10, 16, 5)
        .fill({ color: 0xff5d68, alpha: 0.88 });
    }
  });

  // Upgrade states: draw subtle visual additions without replacing the base map.
  if (state.lanes >= 4) {
    g.roundRect(818, 112, 42, 92, 9).fill({ color: 0x102231, alpha: 0.42 }).stroke({ color: 0x61d394, width: 2, alpha: 0.75 });
    g.circle(839, 105, 4).fill({ color: 0x61d394, alpha: 0.95 });
  }
  if (state.lanes >= 5) {
    g.roundRect(856, 112, 42, 92, 9).fill({ color: 0x102231, alpha: 0.42 }).stroke({ color: 0x61d394, width: 2, alpha: 0.75 });
    g.circle(877, 105, 4).fill({ color: 0x61d394, alpha: 0.95 });
  }
  if (state.gates >= 4) {
    g.roundRect(1288, 172, 112, 28, 8).fill({ color: 0x071018, alpha: 0.45 }).stroke({ color: 0xffd166, width: 2, alpha: 0.72 });
  }
  if (state.runwayLevel >= 2) {
    for (let i = 0; i < 9; i += 1) {
      const pulse = 0.45 + Math.sin(now * 5 + i) * 0.22;
      g.circle(1428 + i * 12, 640 + i * 11, 3.2).fill({ color: i % 2 ? 0x4da3ff : 0x61d394, alpha: pulse });
    }
  }
  return g;
}

function makeEventLayer(state, now, load) {
  const g = new Graphics();
  const event = state.event?.type;
  if (event === "weather") {
    g.rect(0, 0, SCENE.width, SCENE.height).fill({ color: 0x0b1b2f, alpha: 0.18 });
    for (let i = 0; i < 70; i += 1) {
      const x = (i * 97 + now * 180) % SCENE.width;
      const y = (i * 43 + now * 260) % SCENE.height;
      g.moveTo(x, y).lineTo(x - 18, y + 38).stroke({ color: 0x9fd9ff, width: 1.3, alpha: 0.32 });
    }
    if (Math.sin(now * 2.1) > 0.88) {
      g.rect(0, 0, SCENE.width, SCENE.height).fill({ color: 0xcfeaff, alpha: 0.16 });
      g.moveTo(1235, 0).lineTo(1200, 70).lineTo(1228, 70).lineTo(1182, 162).stroke({ color: 0xdaf1ff, width: 5, alpha: 0.86 });
    }
    g.roundRect(32, 54, 170, 44, 12).fill({ color: 0x5b1722, alpha: 0.88 }).stroke({ color: 0xffd166, width: 2, alpha: 0.8 });
  }

  if (event === "rush") {
    g.roundRect(32, 54, 160, 44, 12).fill({ color: 0x2a1707, alpha: 0.86 }).stroke({ color: 0xffd166, width: 2, alpha: 0.82 });
    for (let i = 0; i < 18; i += 1) {
      const x = 510 + ((now * 52 + i * 58) % 440);
      const y = 620 + Math.sin(now * 2 + i) * 18;
      g.moveTo(x, y).lineTo(x + 34, y).stroke({ color: 0xffd166, width: 4, alpha: 0.26 });
    }
  }

  if (event === "security") {
    g.roundRect(SCENE.zones.security.x, SCENE.zones.security.y, SCENE.zones.security.w, SCENE.zones.security.h, 18)
      .fill({ color: 0xff5d68, alpha: 0.07 + Math.sin(now * 5) * 0.025 })
      .stroke({ color: 0xff5d68, width: 5, alpha: 0.45 });
  }

  if (state.lastBottleneck !== "none") {
    const zone = state.lastBottleneck === "security" ? SCENE.zones.security : state.lastBottleneck === "gate" || state.lastBottleneck === "boarding" ? SCENE.zones.gates : SCENE.zones.runway;
    const pulse = 0.35 + Math.sin(now * 5) * 0.12;
    g.roundRect(zone.x, zone.y, zone.w, zone.h, 20).stroke({ color: 0xff5d68, width: 6, alpha: pulse });
  }
  return g;
}

function makeServiceVehicle(color = 0xf6a623) {
  const c = new Container();
  const shadow = new Graphics();
  shadow.ellipse(0, 12, 24, 7).fill({ color: 0x000000, alpha: 0.22 });
  c.addChild(shadow);
  const g = new Graphics();
  g.roundRect(-22, -12, 44, 24, 7).fill(color).stroke({ color: 0x071018, width: 2.2, alpha: 0.76 });
  g.roundRect(0, -16, 18, 15, 5).fill(0xeaf4fb).stroke({ color: 0x071018, width: 1.6, alpha: 0.7 });
  g.circle(-13, 12, 4).fill(0x071018);
  g.circle(13, 12, 4).fill(0x071018);
  c.addChild(g);
  return c;
}


export function AirportPixiScene({ state }) {
  const hostRef = useRef(null);
  const stateRef = useRef(state);
  const pixiRef = useRef(null);
  stateRef.current = state;

  useEffect(() => {
    let destroyed = false;
    const host = hostRef.current;
    let app;

    async function init() {
      app = new Application();
      await app.init({
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        resizeTo: host,
      });
      if (destroyed) {
        app.destroy(true);
        return;
      }
      host.appendChild(app.canvas);
      app.canvas.className = "pixi-canvas";

      const scene = new Container();
      app.stage.addChild(scene);
      const bgLayer = new Container();
      const eventLayer = new Container();
      const stateLayer = new Container();
      const glowLayer = new Container();
      const planeLayer = new Container();
      const vehicleLayer = new Container();
      const bagLayer = new Container();
      const npcLayer = new Container();
      const uiLayer = new Container();
      scene.addChild(bgLayer, eventLayer, stateLayer, glowLayer, planeLayer, vehicleLayer, bagLayer, npcLayer, uiLayer);

      const [texture, spriteTextures] = await Promise.all([
        Assets.load(SCENE.assets.terminalBase),
        loadSpriteTextures(),
      ]);
      const bg = new Sprite(texture);
      bg.width = SCENE.width;
      bg.height = SCENE.height;
      bgLayer.addChild(bg);

      const passengers = Array.from({ length: 115 }).map((_, i) => {
        const type = NPC_TYPES[i % NPC_TYPES.length];
        const p = makeNpcSprite(spriteTextures[npcUrl(type, "idle")], type);
        p.__type = type;
        p.__lastState = "idle";
        p.visible = false;
        npcLayer.addChild(p);
        return p;
      });

      const bags = Array.from({ length: 28 }).map((_, i) => {
        const b = makeSuitcase(SCENE.colors.pax[(i + 3) % SCENE.colors.pax.length]);
        bagLayer.addChild(b);
        return b;
      });

      const planes = PLANE_SPRITES.map((name, i) => makeImageSprite(spriteTextures[planeUrl(name)], i === 0 ? 0.31 : 0.28));
      planes.forEach((p) => planeLayer.addChild(p));

      const vehicles = VEHICLE_SPRITES.map((name, i) => makeImageSprite(spriteTextures[vehicleUrl(name)], i === 0 ? 0.19 : 0.23));
      vehicles.forEach((v) => vehicleLayer.addChild(v));

      const gateLabels = SCENE.gates.map((gate) => addLabel(uiLayer, gate.id, gate.x, gate.y - 45, 0xffd166));
      const statusLabel = addLabel(uiLayer, "V15 QA SPRITE MAP", 138, 32, 0x61d394);
      statusLabel.scale.set(1.05);

      function resizeScene() {
        const scale = Math.min(app.screen.width / SCENE.width, app.screen.height / SCENE.height);
        scene.scale.set(scale);
        scene.x = Math.round((app.screen.width - SCENE.width * scale) / 2);
        scene.y = Math.round((app.screen.height - SCENE.height * scale) / 2);
      }

      const ro = new ResizeObserver(resizeScene);
      ro.observe(host);
      resizeScene();

      pixiRef.current = { app, scene, eventLayer, stateLayer, glowLayer, planeLayer, vehicleLayer, npcLayer, uiLayer, passengers, bags, planes, vehicles, gateLabels, ro };

      app.ticker.add(() => {
        const s = stateRef.current;
        const now = performance.now() / 1000;
        const load = visualLoad(s);
        const visible = s.event?.type === "rush" ? Math.min(115, Math.round(load.visible * 1.35)) : load.visible;

        eventLayer.removeChildren();
        eventLayer.addChild(makeEventLayer(s, now, load));

        stateLayer.removeChildren();
        stateLayer.addChild(makeStateLayer(s, now, load));

        glowLayer.removeChildren();
        glowLayer.addChild(makeRunwayLights(now, s.runwayLevel));
        glowLayer.addChild(makeMissionClockArc(s));
        if (s.lastBottleneck === "security" || load.securityPressure > 0.7) glowLayer.addChild(makeGlowRect(SCENE.zones.security, SCENE.colors.danger, 0.62));
        if (s.lastBottleneck === "gate" || load.gatePressure > 0.86) glowLayer.addChild(makeGlowRect(SCENE.zones.gates, SCENE.colors.warning, 0.5));
        if (s.lastBottleneck === "runway" || load.runwayPressure > 0.75) glowLayer.addChild(makeGlowRect(SCENE.zones.apron, SCENE.colors.warning, 0.52));
        if (s.upgradeNotice) {
          const rect = s.upgradeNotice.type === "security" ? SCENE.zones.security : s.upgradeNotice.type === "gate" ? SCENE.zones.gates : SCENE.zones.apron;
          glowLayer.addChild(makeGlowRect(rect, SCENE.colors.ok, 0.72));
        }

        const phasePaths = [
          SCENE.paths.arrivalsToCheckin,
          SCENE.paths.checkinToSecurity,
          SCENE.paths.securityQueue,
          SCENE.paths.securityToLounge,
          SCENE.paths.loungeToGates,
        ];
        const split = s.event?.type === "rush" ? [0.20, 0.24, 0.30, 0.12, 0.14] : [0.18, 0.22, 0.34, 0.14, 0.12];
        passengers.forEach((p, i) => {
          p.visible = i < visible;
          if (!p.visible) return;
          let group = 0;
          let localIndex = i;
          let maxForGroup = Math.ceil(visible * split[0]);
          let threshold = maxForGroup;
          while (i >= threshold && group < split.length - 1) {
            group += 1;
            localIndex = i - threshold;
            maxForGroup = Math.ceil(visible * split[group]);
            threshold += maxForGroup;
          }
          const path = phasePaths[group];
          const speed = 0.030 + group * 0.006 + s.speed * 0.006;
          const queueSlow = group === 2 ? 1 - load.securityPressure * 0.58 : 1;
          const t = (now * speed * queueSlow + localIndex / Math.max(1, maxForGroup)) % 1;
          const pt = pathPoint(path, t);
          const wobble = Math.sin(now * 3.4 + i * 1.7) * 3.2;
          p.x = pt.x + wobble;
          p.y = pt.y + Math.cos(now * 2.8 + i) * 3.2;
          p.alpha = group === 2 && load.securityPressure > 0.82 && i % 3 === 0 ? 1 : 0.96;
          const npcState = group === 2 ? "waiting" : (group === 0 && i % 3 === 0 ? "luggage" : (Math.floor(now * 5 + i) % 2 ? "walk1" : "walk2"));
          if (p.__lastState !== npcState) {
            p.texture = spriteTextures[npcUrl(p.__type, npcState)] || spriteTextures[npcUrl(p.__type, "idle")];
            p.__lastState = npcState;
          }
          const baseScale = p.__type === "family" ? 0.19 : p.__type === "vip" ? 0.26 : 0.30;
          p.scale.set(baseScale * (i % 8 === 0 ? 0.86 : 1));
          p.rotation = Math.sin(now * 2 + i) * 0.025;
        });

        bags.forEach((b, i) => {
          const path = i % 2 ? SCENE.paths.baggageCart : SCENE.paths.checkinToSecurity;
          const t = (now * (0.05 + s.speed * 0.008) + i / bags.length) % 1;
          const pt = pathPoint(path, t);
          b.x = pt.x + Math.sin(now + i) * 3;
          b.y = pt.y + 18 + Math.cos(now * 1.3 + i) * 3;
          b.visible = i < Math.max(7, Math.min(28, Math.round(visible * 0.32)));
        });

        vehicles.forEach((v, i) => {
          const t = (now * (0.035 + i * 0.008) + i / vehicles.length) % 1;
          const pt = pathPoint(SCENE.paths.baggageCart, t);
          v.x = pt.x + i * 12;
          v.y = pt.y + 35 + Math.sin(now + i) * 3;
          v.rotation = -0.03 + Math.sin(now * 1.2 + i) * 0.02;
          v.alpha = 0.92;
          v.scale.set(i === 0 ? 0.18 : 0.22);
        });

        const gateCount = Math.min(SCENE.gates.length, Math.max(1, s.gates));
        const activeGate = SCENE.gates[(s.occCount + s.departedFlights) % gateCount];
        planes.forEach((plane, i) => {
          const f = s.flights.find((flight) => flight.gate === i);
          const gate = SCENE.gates[i % gateCount];
          const taxiPlane = i === 0 && (s.lastDeparted || s.lastBottleneck === "runway" || s.departedFlights > 0);
          if (taxiPlane) {
            const t = (now * (0.080 + s.speed * 0.020)) % 1;
            const pt = pathPoint(SCENE.paths.runwayTaxi, t);
            plane.x = pt.x;
            plane.y = pt.y;
            plane.rotation = -0.08 + Math.sin(now * 2) * 0.012;
            plane.alpha = t > 0.92 ? 1 - (t - 0.92) * 10 : 0.92;
            plane.scale.set(0.25 + t * 0.04);
          } else {
            plane.x = gate?.planeX || activeGate.planeX;
            plane.y = (gate?.planeY || activeGate.planeY) + Math.sin(now + i) * 2;
            plane.rotation = -0.10;
            plane.alpha = f || i < Math.max(1, s.gates - 1) ? 0.90 : 0.20;
            plane.scale.set(i === 0 ? 0.29 : i === 1 ? 0.26 : 0.23);
          }
        });

        SCENE.gates.forEach((gate, i) => {
          const f = s.flights.find((flight) => flight.gate === i);
          const label = gateLabels[i];
          label.text = f ? `${gate.id} ${f.status === "ready" ? "READY" : f.age > 24 ? "DELAY" : "BOARD"}` : `${gate.id} FREE`;
          label.style.fill = f ? (f.age > 24 ? 0xff5d68 : f.status === "ready" ? 0x61d394 : 0xffd166) : 0x8ea6b7;
          label.visible = i < s.gates;
        });
        const left = Math.max(0, (s.dayLength || 720) - (s.minute - (s.dayStartMinute || 360)));
        const eventText = s.event?.type ? ` · ${s.event.type.toUpperCase()}` : "";
        statusLabel.text = `V15 · ${visible} NPC · ${Math.floor(left / 60)}h ${left % 60}m${eventText}`;
      });
    }

    init();
    return () => {
      destroyed = true;
      const ref = pixiRef.current;
      if (ref?.ro) ref.ro.disconnect();
      if (ref?.app) ref.app.destroy(true, { children: true, texture: false });
      pixiRef.current = null;
      if (host) host.innerHTML = "";
    };
  }, []);

  return <div ref={hostRef} className="terminal-canvas pixi-airport-scene" />;
}
