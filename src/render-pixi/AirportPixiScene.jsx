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
      const glowLayer = new Container();
      const planeLayer = new Container();
      const bagLayer = new Container();
      const npcLayer = new Container();
      const uiLayer = new Container();
      scene.addChild(bgLayer, glowLayer, planeLayer, bagLayer, npcLayer, uiLayer);

      const texture = await Assets.load(SCENE.assets.runwayFocus || SCENE.assets.terminalBase);
      const bg = new Sprite(texture);
      bg.width = SCENE.width;
      bg.height = SCENE.height;
      bgLayer.addChild(bg);

      // NPC pool: purely visual for now, driven by the current sim state.
      const passengers = Array.from({ length: 95 }).map((_, i) => {
        const color = SCENE.colors.pax[i % SCENE.colors.pax.length];
        const p = makePassenger(color, i % 6 === 0 ? 0.74 : 0.88);
        p.visible = false;
        npcLayer.addChild(p);
        return p;
      });

      const bags = Array.from({ length: 22 }).map((_, i) => {
        const b = makeSuitcase(SCENE.colors.pax[(i + 3) % SCENE.colors.pax.length]);
        bagLayer.addChild(b);
        return b;
      });

      const planes = [
        makePlane(0xf7f8fb, 0x4da3ff, 0.64),
        makePlane(0xfff3d0, 0xf6a623, 0.60),
        makePlane(0xf5f0ff, 0xb989ff, 0.56),
        makePlane(0xedfff6, 0x61d394, 0.56),
        makePlane(0xf8f2ee, 0xff5d68, 0.52),
        makePlane(0xf3fbff, 0x3bd5dd, 0.50),
      ];
      planes.forEach((p) => planeLayer.addChild(p));

      const gateLabels = SCENE.gates.map((gate) => addLabel(uiLayer, gate.id, gate.x, gate.y - 42, 0xffd166));
      const statusLabel = addLabel(uiLayer, "PIXI LIVE MAP", 132, 32, 0x61d394);
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

      pixiRef.current = { app, scene, glowLayer, planeLayer, npcLayer, uiLayer, passengers, bags, planes, gateLabels, ro };

      app.ticker.add(() => {
        const s = stateRef.current;
        const now = performance.now() / 1000;
        const load = visualLoad(s);
        const visible = load.visible;

        glowLayer.removeChildren();
        glowLayer.addChild(makeRunwayLights(now, s.runwayLevel));
        glowLayer.addChild(makeMissionClockArc(s));
        if (s.lastBottleneck === "security" || load.securityPressure > 0.7) glowLayer.addChild(makeGlowRect(SCENE.zones.security, SCENE.colors.danger, 0.62));
        if (s.lastBottleneck === "gate" || load.gatePressure > 0.86) glowLayer.addChild(makeGlowRect(SCENE.zones.gates, SCENE.colors.warning, 0.5));
        if (s.lastBottleneck === "runway" || load.runwayPressure > 0.75) glowLayer.addChild(makeGlowRect(SCENE.zones.runway, SCENE.colors.warning, 0.52));
        if (s.upgradeNotice) {
          const rect = s.upgradeNotice.type === "security" ? SCENE.zones.security : s.upgradeNotice.type === "gate" ? SCENE.zones.gates : SCENE.zones.runway;
          glowLayer.addChild(makeGlowRect(rect, SCENE.colors.ok, 0.72));
        }

        const phasePaths = [
          SCENE.paths.arrivalsToCheckin,
          SCENE.paths.checkinToSecurity,
          SCENE.paths.securityQueue,
          SCENE.paths.securityToLounge,
          SCENE.paths.loungeToGates,
        ];
        const split = [0.18, 0.22, 0.34, 0.14, 0.12];
        let cursor = 0;
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
          const speed = 0.032 + group * 0.006 + s.speed * 0.006;
          const queueSlow = group === 2 ? 1 - load.securityPressure * 0.55 : 1;
          const t = (now * speed * queueSlow + localIndex / Math.max(1, maxForGroup)) % 1;
          const pt = pathPoint(path, t);
          const wobble = Math.sin(now * 3.4 + i * 1.7) * 4;
          p.x = pt.x + wobble;
          p.y = pt.y + Math.cos(now * 2.8 + i) * 4;
          p.alpha = group === 2 && load.securityPressure > 0.82 && i % 3 === 0 ? 1 : 0.96;
          p.scale.set(i % 6 === 0 ? 0.74 : 0.88);
          p.rotation = Math.sin(now * 2 + i) * 0.04;
        });

        bags.forEach((b, i) => {
          const path = i % 2 ? SCENE.paths.baggageCart : SCENE.paths.checkinToSecurity;
          const t = (now * (0.05 + s.speed * 0.008) + i / bags.length) % 1;
          const pt = pathPoint(path, t);
          b.x = pt.x + Math.sin(now + i) * 3;
          b.y = pt.y + 18 + Math.cos(now * 1.3 + i) * 3;
          b.visible = i < Math.max(6, Math.min(22, Math.round(load.visible * 0.3)));
        });

        const activeGate = SCENE.gates[(s.occCount + s.departedFlights) % Math.min(SCENE.gates.length, Math.max(1, s.gates))];
        planes.forEach((plane, i) => {
          const f = s.flights.find((flight) => flight.gate === i);
          const gate = SCENE.gates[i % Math.min(SCENE.gates.length, Math.max(1, s.gates))];
          const taxiPlane = i === 0 && (s.lastDeparted || s.lastBottleneck === "runway" || s.departedFlights > 0);
          const runwayPlane = i === 1 && s.runwayLevel >= 2;
          if (taxiPlane) {
            const t = (now * (0.105 + s.speed * 0.026)) % 1;
            const pt = pathPoint(SCENE.paths.runwayTaxi, t);
            plane.x = pt.x;
            plane.y = pt.y;
            plane.rotation = -Math.PI / 2 + Math.sin(now * 2) * 0.012;
            plane.alpha = t > 0.92 ? 1 - (t - 0.92) * 10 : 0.95;
            plane.scale.set(0.58 + t * 0.16);
          } else if (runwayPlane) {
            const t = (now * 0.052) % 1;
            plane.x = 1450 + Math.sin(now * 0.7) * 5;
            plane.y = 720 - t * 820;
            plane.rotation = -Math.PI / 2;
            plane.alpha = 0.35 + (t < 0.88 ? 0.48 : (1 - t) * 4);
            plane.scale.set(0.46 + t * 0.14);
          } else {
            plane.x = gate?.planeX || activeGate.planeX;
            plane.y = (gate?.planeY || activeGate.planeY) + Math.sin(now + i) * 2;
            plane.rotation = -0.06;
            plane.alpha = f || i < Math.max(2, s.gates - 1) ? 0.94 : 0.28;
            plane.scale.set(i === 0 ? 0.62 : i === 1 ? 0.58 : i === 2 ? 0.54 : 0.48);
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
        statusLabel.text = `V12 · ${visible} NPC · ${Math.floor(left / 60)}h ${left % 60}m · ${s.airportName}`;
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
