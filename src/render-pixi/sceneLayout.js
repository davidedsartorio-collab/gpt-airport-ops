export const SCENE = {
  width: 1536,
  height: 864,
  assets: {
    terminalBase: "/assets/airport/terra01/maps/terminal-base-clean.png",
    runwayBase: "/assets/airport/terra01/maps/runway-base-clean.png",
  },
  zones: {
    arrivals: { x: 255, y: 575, w: 250, h: 135 },
    checkin: { x: 90, y: 92, w: 368, h: 238 },
    bagdrop: { x: 90, y: 345, w: 368, h: 230 },
    security: { x: 500, y: 92, w: 300, h: 273 },
    lounge: { x: 500, y: 390, w: 335, h: 280 },
    gates: { x: 855, y: 92, w: 353, h: 293 },
    baggage: { x: 865, y: 410, w: 185, h: 180 },
    apron: { x: 1270, y: 70, w: 260, h: 745 },
    runway: { x: 1420, y: 20, w: 108, h: 820 },
  },
  paths: {
    arrivalsToCheckin: [
      { x: 380, y: 710 }, { x: 345, y: 615 }, { x: 270, y: 520 }, { x: 235, y: 400 }, { x: 250, y: 270 },
    ],
    checkinToSecurity: [
      { x: 250, y: 270 }, { x: 440, y: 300 }, { x: 555, y: 270 }, { x: 625, y: 220 },
    ],
    securityQueue: [
      { x: 580, y: 365 }, { x: 610, y: 310 }, { x: 640, y: 255 }, { x: 670, y: 195 },
    ],
    securityToLounge: [
      { x: 705, y: 190 }, { x: 805, y: 325 }, { x: 780, y: 470 }, { x: 755, y: 545 },
    ],
    loungeToGates: [
      { x: 755, y: 545 }, { x: 920, y: 460 }, { x: 1035, y: 365 }, { x: 1130, y: 250 },
    ],
    baggageCart: [
      { x: 1170, y: 615 }, { x: 1245, y: 675 }, { x: 1325, y: 700 }, { x: 1390, y: 610 },
    ],
    runwayTaxi: [
      { x: 1320, y: 240 }, { x: 1390, y: 320 }, { x: 1450, y: 455 }, { x: 1450, y: 700 }, { x: 1450, y: -80 },
    ],
  },
  gates: [
    { id: "A1", x: 1078, y: 155, planeX: 1390, planeY: 190, queueX: 1085, queueY: 260 },
    { id: "A2", x: 1190, y: 155, planeX: 1390, planeY: 305, queueX: 1190, queueY: 260 },
    { id: "A3", x: 1305, y: 155, planeX: 1390, planeY: 430, queueX: 1290, queueY: 260 },
    { id: "B1", x: 1078, y: 295, planeX: 1390, planeY: 550, queueX: 1085, queueY: 350 },
    { id: "B2", x: 1190, y: 295, planeX: 1390, planeY: 665, queueX: 1190, queueY: 350 },
    { id: "C1", x: 1305, y: 295, planeX: 1390, planeY: 760, queueX: 1290, queueY: 350 },
  ],
  colors: {
    pax: [0x4da3ff, 0x61d394, 0xb989ff, 0xff7a90, 0xf6a623, 0x6ef3ff, 0xffd166],
    warning: 0xffd166,
    danger: 0xff5d68,
    ok: 0x61d394,
  },
};
