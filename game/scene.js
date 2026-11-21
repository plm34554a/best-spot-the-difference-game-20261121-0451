// scene.js — paints the study. One function draws the whole room onto a
// canvas; the right-hand panel passes right=true and the changed version of
// each active difference is painted instead of the original. Nothing here
// knows about score, timers or input — it only draws.

export const PANEL_W = 560;
export const PANEL_H = 420;

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function drawWallAndFloor(ctx) {
  const wall = ctx.createLinearGradient(0, 0, 0, 340);
  wall.addColorStop(0, '#31405c');
  wall.addColorStop(1, '#243349');
  rect(ctx, 0, 0, PANEL_W, 340, '#243349');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, PANEL_W, 340);
  rect(ctx, 0, 336, PANEL_W, 6, '#1a2536');
  const floor = ctx.createLinearGradient(0, 342, 0, PANEL_H);
  floor.addColorStop(0, '#7a5233');
  floor.addColorStop(1, '#5d3c22');
  ctx.fillStyle = floor;
  ctx.fillRect(0, 342, PANEL_W, PANEL_H - 342);
  line(ctx, 0, 342, PANEL_W, 342, '#4a2e18', 2);
}

function drawWindow(ctx, changed) {
  // Frame and sill.
  rect(ctx, 36, 28, 150, 140, '#8a5a2b');
  rect(ctx, 44, 36, 134, 124, '#0e1a2e');
  const sky = ctx.createLinearGradient(44, 36, 44, 160);
  sky.addColorStop(0, '#16294d');
  sky.addColorStop(1, '#3d5a8a');
  ctx.fillStyle = sky;
  ctx.fillRect(44, 36, 134, 124);
  // Stars.
  const stars = [[60, 55], [80, 48], [120, 52], [150, 60], [165, 95], [70, 110], [135, 120], [105, 140], [160, 140]];
  for (const [x, y] of stars) circle(ctx, x, y, 1.6, '#ffe9a8');
  // Moon: full on the left panel, a crescent on the right — the sky-coloured
  // disc bites a chunk out of the full moon.
  circle(ctx, 95, 75, 18, '#f5eeda');
  if (changed) {
    ctx.beginPath();
    ctx.arc(104, 70, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#2c4266';
    ctx.fill();
  }
  // Window crossbars.
  rect(ctx, 108, 36, 6, 124, '#8a5a2b');
  rect(ctx, 44, 92, 134, 6, '#8a5a2b');
  rect(ctx, 28, 168, 166, 10, '#a06a35');
}

function drawClock(ctx, changed) {
  circle(ctx, 305, 64, 30, '#e8dcc0');
  ctx.beginPath();
  ctx.arc(305, 64, 30, 0, Math.PI * 2);
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 5;
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    circle(ctx, 305 + Math.sin(a) * 24, 64 - Math.cos(a) * 24, 1.8, '#5d3c22');
  }
  // Left panel: 3 o'clock. Right panel: hands swung to twenty past seven.
  if (!changed) {
    line(ctx, 305, 64, 305, 46, '#2b2b2b', 3);
    line(ctx, 305, 64, 321, 64, '#2b2b2b', 3);
  } else {
    line(ctx, 305, 64, 297, 47, '#2b2b2b', 3);
    line(ctx, 305, 64, 296, 80, '#2b2b2b', 3);
  }
  circle(ctx, 305, 64, 3, '#8a2f2f');
}

function drawPainting(ctx, changed) {
  rect(ctx, 408, 40, 96, 72, '#8a5a2b');
  rect(ctx, 414, 46, 84, 60, '#7fb069');
  // Hills.
  ctx.beginPath();
  ctx.moveTo(414, 106);
  ctx.quadraticCurveTo(440, 78, 470, 106);
  ctx.lineTo(498, 106);
  ctx.closePath();
  ctx.fillStyle = '#4a7c59';
  ctx.fill();
  // Sun on the left panel, a pale moon on the right.
  if (!changed) {
    circle(ctx, 456, 76, 12, '#f2c14e');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      line(ctx, 456 + Math.cos(a) * 15, 76 + Math.sin(a) * 15, 456 + Math.cos(a) * 19, 76 + Math.sin(a) * 19, '#f2c14e', 2);
    }
  } else {
    circle(ctx, 456, 76, 11, '#e8e4d2');
    circle(ctx, 460, 73, 9, '#7fb069');
  }
}

function drawBookshelf(ctx, changed) {
  rect(ctx, 420, 140, 120, 182, '#6b4423');
  rect(ctx, 428, 148, 104, 76, '#3a2412');
  rect(ctx, 428, 232, 104, 76, '#3a2412');
  const shelfOne = ['#b03a2e', '#2e6f8e', '#d9a441', '#5d8a4a', '#7a4a8a', '#c96f2e'];
  const shelfTwo = ['#2e6f8e', '#8a2f2f', '#d9a441', '#4a7c59', '#b03a2e'];
  shelfOne.forEach((color, i) => {
    const x = 431 + i * 17;
    // The second spine from the left is the difference: red vs teal.
    const fill = changed && i === 1 ? '#2e8f7a' : color;
    rect(ctx, x, 196 - (i % 2) * 4, 14, 28 + (i % 2) * 4, fill);
  });
  shelfTwo.forEach((color, i) => {
    rect(ctx, 431 + i * 20, 282, 17, 26, color);
  });
  rect(ctx, 428, 224, 104, 8, '#6b4423');
  rect(ctx, 428, 308, 104, 8, '#6b4423');
  // A brass globe on the bottom shelf.
  circle(ctx, 505, 292, 14, '#c9a227');
  line(ctx, 505, 306, 505, 314, '#8a6d1f', 3);
}

function drawCandleTable(ctx, changed) {
  rect(ctx, 100, 210, 90, 10, '#6b4423');
  line(ctx, 108, 220, 104, 262, '#54331a', 5);
  line(ctx, 182, 220, 186, 262, '#54331a', 5);
  rect(ctx, 136, 196, 18, 16, '#e8e4d2');
  rect(ctx, 132, 210, 26, 4, '#c9a227');
  if (!changed) {
    // A lit flame, with a warm glow.
    const glow = ctx.createRadialGradient(145, 182, 2, 145, 182, 26);
    glow.addColorStop(0, 'rgba(255, 190, 80, 0.55)');
    glow.addColorStop(1, 'rgba(255, 190, 80, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(145, 182, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(145, 170);
    ctx.quadraticCurveTo(152, 180, 145, 190);
    ctx.quadraticCurveTo(138, 180, 145, 170);
    ctx.fillStyle = '#ffb347';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(145, 176);
    ctx.quadraticCurveTo(149, 182, 145, 188);
    ctx.quadraticCurveTo(141, 182, 145, 176);
    ctx.fillStyle = '#fff3c4';
    ctx.fill();
  } else {
    // Burnt out: a thin wisp of smoke instead of a flame.
    line(ctx, 145, 194, 145, 190, '#2b2b2b', 2);
    ctx.beginPath();
    ctx.moveTo(145, 188);
    ctx.quadraticCurveTo(140, 178, 146, 170);
    ctx.quadraticCurveTo(150, 176, 145, 168);
    ctx.strokeStyle = 'rgba(200,200,200,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawDesk(ctx, changed) {
  rect(ctx, 150, 292, 280, 14, '#6b4423');
  line(ctx, 160, 306, 156, 342, '#54331a', 6);
  line(ctx, 420, 306, 424, 342, '#54331a', 6);
  // Inkpot and quill.
  circle(ctx, 185, 286, 8, '#1f2a44');
  line(ctx, 192, 282, 206, 262, '#e8e4d2', 3);
  // Spectacles.
  ctx.beginPath();
  ctx.arc(268, 296, 7, 0, Math.PI * 2);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(284, 296, 7, 0, Math.PI * 2);
  ctx.stroke();
  line(ctx, 275, 296, 277, 296, '#c9a227', 2);
  // A mug.
  rect(ctx, 388, 280, 20, 16, '#2e6f8e');
  ctx.beginPath();
  ctx.arc(410, 288, 5, -Math.PI / 2, Math.PI / 2);
  ctx.strokeStyle = '#2e6f8e';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Teapot: body, lid, handle — and a spout only on the left panel.
  ellipse(ctx, 215, 300, 18, 12, '#b03a2e');
  circle(ctx, 215, 286, 6, '#8a2f2f');
  ctx.beginPath();
  ctx.arc(198, 298, 7, Math.PI / 2, Math.PI * 1.5);
  ctx.strokeStyle = '#8a2f2f';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (!changed) {
    ctx.beginPath();
    ctx.moveTo(230, 294);
    ctx.lineTo(244, 286);
    ctx.lineTo(246, 294);
    ctx.lineTo(232, 302);
    ctx.closePath();
    ctx.fillStyle = '#b03a2e';
    ctx.fill();
  }
}

function drawOrrery(ctx, changed) {
  // Brass stand and the sun at the centre.
  line(ctx, 310, 292, 310, 262, '#8a6d1f', 3);
  ellipse(ctx, 310, 293, 16, 4, '#8a6d1f');
  circle(ctx, 310, 252, 12, '#f2c14e');
  // Orbit rings.
  ctx.beginPath();
  ctx.ellipse(310, 252, 34, 12, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(201,162,39,0.8)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(310, 252, 48, 18, 0, 0, Math.PI * 2);
  ctx.stroke();
  circle(ctx, 280, 244, 5, '#7fb069');
  // The outer planet: ringed on the left, a bare ball on the right.
  if (!changed) {
    ctx.beginPath();
    ctx.ellipse(340, 238, 14, 4, -0.4, 0, Math.PI * 2);
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    circle(ctx, 340, 238, 7, '#c96f2e');
  } else {
    circle(ctx, 340, 238, 5, '#c96f2e');
  }
}

function drawPlant(ctx, changed) {
  // Terracotta pot and leaves: five on the left, three on the right.
  ctx.beginPath();
  ctx.moveTo(62, 330);
  ctx.lineTo(98, 330);
  ctx.lineTo(92, 356);
  ctx.lineTo(68, 356);
  ctx.closePath();
  ctx.fillStyle = '#a8542e';
  ctx.fill();
  const leaves = changed
    ? [[80, 296, -0.5], [72, 302, -1.0], [88, 302, 0.1]]
    : [[80, 292, -0.6], [70, 300, -1.1], [90, 300, 0.0], [62, 308, -1.5], [98, 308, 0.6]];
  for (const [x, y, tilt] of leaves) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.beginPath();
    ctx.ellipse(0, -14, 6, 16, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4a7c59';
    ctx.fill();
    ctx.restore();
  }
}

function drawRugAndCat(ctx, changed) {
  ellipse(ctx, 300, 392, 170, 26, '#7a2e2e');
  ellipse(ctx, 300, 392, 140, 20, '#a8542e');
  ellipse(ctx, 300, 392, 105, 14, '#d9a441');
  // The cat, asleep on the rug: body, head, ears, stripes.
  ellipse(ctx, 445, 348, 38, 16, '#d97b2e');
  circle(ctx, 478, 338, 13, '#d97b2e');
  ctx.beginPath();
  ctx.moveTo(470, 328);
  ctx.lineTo(473, 318);
  ctx.lineTo(478, 327);
  ctx.closePath();
  ctx.fillStyle = '#d97b2e';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(482, 327);
  ctx.lineTo(486, 318);
  ctx.lineTo(489, 328);
  ctx.closePath();
  ctx.fill();
  line(ctx, 430, 340, 430, 356, '#8a4a1a', 2);
  line(ctx, 445, 336, 445, 360, '#8a4a1a', 2);
  line(ctx, 460, 340, 460, 356, '#8a4a1a', 2);
  circle(ctx, 483, 336, 1.6, '#2b2b2b');
  // Tail: raised high on the left, curled flat on the right.
  if (!changed) {
    ctx.beginPath();
    ctx.moveTo(410, 348);
    ctx.quadraticCurveTo(398, 332, 404, 314);
    ctx.quadraticCurveTo(408, 306, 414, 312);
    ctx.quadraticCurveTo(410, 326, 418, 344);
    ctx.closePath();
    ctx.fillStyle = '#d97b2e';
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(410, 352);
    ctx.quadraticCurveTo(398, 362, 412, 366);
    ctx.quadraticCurveTo(424, 368, 422, 358);
    ctx.quadraticCurveTo(418, 352, 410, 352);
    ctx.closePath();
    ctx.fillStyle = '#d97b2e';
    ctx.fill();
  }
}

// Draw one panel. `changedIds` lists the differences that differ on this
// panel (empty for the left panel, the level's ids for the right one).
export function drawScene(ctx, changedIds) {
  const changed = new Set(changedIds);
  drawWallAndFloor(ctx);
  drawWindow(ctx, changed.has('moon'));
  drawClock(ctx, changed.has('clock'));
  drawPainting(ctx, changed.has('painting'));
  drawBookshelf(ctx, changed.has('book'));
  drawCandleTable(ctx, changed.has('candle'));
  drawDesk(ctx, changed.has('teapot'));
  drawOrrery(ctx, changed.has('orrery'));
  drawPlant(ctx, changed.has('plant'));
  drawRugAndCat(ctx, changed.has('cat'));
}

// A gold ring with a number, drawn over a found difference on both panels.
export function drawFoundMarker(ctx, diff, index) {
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, diff.r + 4, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffd54a';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, diff.r + 9, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 213, 74, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  circle(ctx, diff.x, diff.y, 11, '#ffd54a');
  ctx.fillStyle = '#3a2412';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(index + 1), diff.x, diff.y + 0.5);
}

// The pulsing ring a hint draws around a still-hidden difference.
export function drawHintRing(ctx, diff, pulse) {
  const r = diff.r + 8 + Math.sin(pulse) * 4;
  ctx.beginPath();
  ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(127, 176, 105, 0.95)';
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
}

// The keyboard / mouse cursor: a thin crosshair circle.
export function drawCursor(ctx, x, y, active) {
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.strokeStyle = active ? '#ffffff' : 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  line(ctx, x - 22, y, x - 10, y, '#ffffff', 2);
  line(ctx, x + 10, y, x + 22, y, '#ffffff', 2);
  line(ctx, x, y - 22, x, y - 10, '#ffffff', 2);
  line(ctx, x, y + 10, x, y + 22, '#ffffff', 2);
  circle(ctx, x, y, 2, '#ffffff');
}

// A red X where a wrong click landed, fading with `alpha`.
export function drawMissMark(ctx, x, y, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  line(ctx, x - 12, y - 12, x + 12, y + 12, '#ff5a5a', 4);
  line(ctx, x + 12, y - 12, x - 12, y + 12, '#ff5a5a', 4);
  ctx.restore();
}
