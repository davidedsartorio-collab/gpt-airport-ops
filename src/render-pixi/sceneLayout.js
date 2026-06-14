export const SCENE = {
  width: 1536,
  height: 864,
  assets: {
    terminalBase: "/assets/airport/terra01/maps/terminal-base.png",
    runwayFocus: "/assets/airport/terra01/maps/runway-focus.png",
  },
  zones: {
    arrivals: { x: 255, y: 575, w: 250, h: 135 },
    checkin: { x: 125, y: 115, w: 355, h: 330 },
    bagdrop: { x: 130, y: 350, w: 350, h: 175 },
    security: { x: 540, y: 95, w: 370, h: 320 },
    lounge: { x: 560, y: 410, w: 350, h: 235 },
    gates: { x: 1020, y: 85, w: 360, h: 300 },
    baggage: { x: 1040, y: 430, w: 265, h: 170 },
    apron: { x: 1290, y: 120, w: 230, h: 700 },
    runway: { x: 1390, y: 0, w: 146, h: 864 },
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
