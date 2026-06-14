export const SCENE = {
  width: 1536,
  height: 864,
  assets: {
    terminalBase: "/assets/airport/terra01/maps/terminal-base-production.png",
    runwayBase: "/assets/airport/terra01/maps/apron-runway-production.png",
  },
  // Coordinates tuned for the new production candidate map.
  zones: {
    departures: { x: 130, y: 42, w: 300, h: 125 },
    checkin: { x: 105, y: 248, w: 410, h: 245 },
    bagdrop: { x: 105, y: 565, w: 295, h: 110 },
    security: { x: 540, y: 58, w: 350, h: 220 },
    lounge: { x: 610, y: 350, w: 290, h: 255 },
    gates: { x: 920, y: 45, w: 470, h: 230 },
    baggage: { x: 985, y: 315, w: 305, h: 165 },
    cafe: { x: 1055, y: 520, w: 260, h: 210 },
    entrance: { x: 580, y: 675, w: 390, h: 95 },
    apron: { x: 1330, y: 500, w: 205, h: 330 },
    runway: { x: 1370, y: 590, w: 160, h: 260 },
  },
  doors: {
    entrance: { x: 705, y: 690, w: 120, h: 54 },
    securityExit: { x: 820, y: 228, w: 48, h: 70 },
    gates: [
      { id: "A1", x: 940, y: 96, w: 48, h: 64 },
      { id: "A2", x: 1058, y: 96, w: 48, h: 64 },
      { id: "A3", x: 1192, y: 96, w: 48, h: 64 },
      { id: "A4", x: 1320, y: 96, w: 48, h: 64 },
    ],
  },
  paths: {
    arrivalsToCheckin: [
      { x: 760, y: 760 }, { x: 600, y: 690 }, { x: 465, y: 610 }, { x: 325, y: 535 }, { x: 250, y: 440 },
    ],
    checkinToSecurity: [
      { x: 250, y: 440 }, { x: 375, y: 330 }, { x: 535, y: 265 }, { x: 645, y: 215 },
    ],
    securityQueue: [
      { x: 595, y: 282 }, { x: 620, y: 230 }, { x: 655, y: 178 }, { x: 705, y: 138 }, { x: 775, y: 120 },
    ],
    securityToLounge: [
      { x: 800, y: 215 }, { x: 820, y: 315 }, { x: 770, y: 405 }, { x: 725, y: 505 },
    ],
    loungeToGates: [
      { x: 725, y: 505 }, { x: 850, y: 415 }, { x: 940, y: 320 }, { x: 1020, y: 210 },
    ],
    baggageCart: [
      { x: 1115, y: 455 }, { x: 1225, y: 515 }, { x: 1370, y: 620 }, { x: 1470, y: 720 },
    ],
    runwayTaxi: [
      { x: 1368, y: 715 }, { x: 1420, y: 680 }, { x: 1492, y: 640 }, { x: 1505, y: 535 }, { x: 1468, y: 470 },
    ],
  },
  gates: [
    { id: "A1", x: 958, y: 116, planeX: 1388, planeY: 755 },
    { id: "A2", x: 1082, y: 116, planeX: 1450, planeY: 718 },
    { id: "A3", x: 1216, y: 116, planeX: 1488, planeY: 665 },
    { id: "A4", x: 1344, y: 116, planeX: 1502, planeY: 612 },
  ],
  colors: {
    ok: 0x61d394,
    warning: 0xffd166,
    danger: 0xff5d68,
    blue: 0x4da3ff,
    purple: 0xb989ff,
    fog: 0xdce7f4,
    pax: [0x25c05a, 0x39d5dd, 0xff9f1c, 0x8e5cf7, 0xff5d68, 0xffd166, 0x2f80ed],
  },
};
