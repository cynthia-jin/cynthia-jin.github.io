let lastLoggedMinute = -1;

// Mondrian-ish palette (tweak freely)
const OFF_WHITE = "#F4F1E8";
const BLACK = "#111111";
const RED = "#D62828";
const BLUE = "#1D4ED8";
const YELLOW = "#F7C948";
const LIGHT_GRAY = "#D9D9D9";

function setup() {
  createCanvas(700, 700);
  rectMode(CORNER);
  textAlign(CENTER, CENTER);
  noStroke();
}

function draw() {
  background(240);

  const hrRaw = hour();
  const min = minute();
  const sec = second();

  // Requirement: log minute() only when the minute changes
  if (min !== lastLoggedMinute) {
    console.log(min);
    lastLoggedMinute = min;
  }

  // Normalize hour to 1..12
  let hr12 = hrRaw % 12;
  if (hr12 === 0) hr12 = 12;

  // Painting region
  const pad = 40;
  const size = Math.min(width, height) - pad * 2;
  const x0 = (width - size) / 2;
  const y0 = (height - size) / 2;

  // Border thickness + inner padding
  const border = 18;
  const innerPad = 12;

  // Outer border
  fill(BLACK);
  rect(x0, y0, size, size);

  // Inner background
  const ix = x0 + border;
  const iy = y0 + border;
  const isz = size - border * 2;
  fill(OFF_WHITE);
  rect(ix, iy, isz, isz);

  // Hour block dimensions (upper-left)
  const hourW = isz * 0.52;
  const hourH = isz * 0.52;

  // Divider thickness
  const lineW = 10;

  // Regions:
  // A) Hour block: (ix, iy, hourW, hourH)
  // B) Right strip: (ix + hourW + lineW, iy, isz - hourW - lineW, hourH)
  // C) Bottom strip: (ix, iy + hourH + lineW, isz, isz - hourH - lineW)

  // Draw divider lines (black)
  fill(BLACK);
  rect(ix + hourW, iy, lineW, isz);      // vertical divider
  rect(ix, iy + hourH, isz, lineW);      // horizontal divider

  // --- Hour block color mapping ---
  // Hour block outer (still keep Mondrian border look)
const hx = ix + innerPad;
const hy = iy + innerPad;
const hw = hourW - innerPad * 2;
const hh = hourH - innerPad * 2;

// Base background for hour block (off-white)
fill(OFF_WHITE);
rect(hx, hy, hw, hh);

// 12 "bars" layout (3 cols x 4 rows = 12)
const hCols = 3;
const hRows = 4;
const barGap = 8; // black gutter thickness inside hour block

// Choose a color per hour (or keep constant red if you want)
const hourFillColor = RED; // or hourPalette[(hr12-1) % hourPalette.length]

// Fill first hr12 bars
let filled = hr12; // 1..12

for (let r = 0; r < hRows; r++) {
  for (let c = 0; c < hCols; c++) {
    const idx = r * hCols + c; // 0..11

    // Bar cell bounds
    const cellX = hx + (c * hw) / hCols;
    const cellY = hy + (r * hh) / hRows;
    const cellW = hw / hCols;
    const cellH = hh / hRows;

    // Black cell border
    fill(BLACK);
    rect(cellX, cellY, cellW, cellH);

    // Inner bar
    const innerX = cellX + barGap;
    const innerY = cellY + barGap;
    const innerW = cellW - barGap * 2;
    const innerH = cellH - barGap * 2;

    if (idx < filled) {
      fill(hourFillColor);
    } else {
      fill(OFF_WHITE);
    }
    rect(innerX, innerY, innerW, innerH);
  }
}


  // --- Minute rectangles (60 total) ---
  // We'll place 24 tiles in the right strip (6 rows x 4 cols)
  // and 36 tiles in the bottom strip (6 rows x 6 cols)
  const rightCols = 4, rightRows = 6;   // 24
  const bottomCols = 6, bottomRows = 6; // 36
  const totalTiles = rightCols * rightRows + bottomCols * bottomRows; // 60

  // Create an order list of tile rects (x,y,w,h)
  const tiles = [];

  // Right strip bounds
  const rx = ix + hourW + lineW;
  const ry = iy;
  const rw = isz - hourW - lineW;
  const rh = hourH;

  // Bottom strip bounds
  const bx = ix;
  const by = iy + hourH + lineW;
  const bw = isz;
  const bh = isz - hourH - lineW;

  // Add right strip tiles
  for (let r = 0; r < rightRows; r++) {
    for (let c = 0; c < rightCols; c++) {
      const tx = rx + (c * rw) / rightCols;
      const ty = ry + (r * rh) / rightRows;
      const tw = rw / rightCols;
      const th = rh / rightRows;
      tiles.push({ x: tx, y: ty, w: tw, h: th });
    }
  }

  // Add bottom strip tiles
  for (let r = 0; r < bottomRows; r++) {
    for (let c = 0; c < bottomCols; c++) {
      const tx = bx + (c * bw) / bottomCols;
      const ty = by + (r * bh) / bottomRows;
      const tw = bw / bottomCols;
      const th = bh / bottomRows;
      tiles.push({ x: tx, y: ty, w: tw, h: th });
    }
  }

  // Draw minute tiles with thick black gutters
  // Fill first `min` tiles
  for (let i = 0; i < totalTiles; i++) {
    const t = tiles[i];

    // Black tile border/gutter
    fill(BLACK);
    rect(t.x, t.y, t.w, t.h);

    // Inner tile
    const gap = 6;
    const innerX = t.x + gap;
    const innerY = t.y + gap;
    const innerW = t.w - gap * 2;
    const innerH = t.h - gap * 2;

    // Color choice for filled minutes: rotate between Mondrian colors
    if (i < min) {
      const colorCycle = [RED, BLUE, YELLOW, LIGHT_GRAY];
      fill(colorCycle[i % colorCycle.length]);
    } else {
      fill(OFF_WHITE);
    }
    rect(innerX, innerY, innerW, innerH);
  }

  // --- Seconds border LEDs (60 segments around the painting) ---
  // We'll draw them on the BLACK border area, inset slightly.
  drawSecondBorderLEDs(x0, y0, size, border, sec);
}

// Draw 60 small squares around the border; first `sec` are lit
function drawSecondBorderLEDs(x0, y0, size, border, sec) {
  const ledCount = 60;
  const inset = 4; // keep inside border
  const ledSize = border - inset * 2;

  // How many LEDs per side? We'll distribute: 15 per side = 60 total
  const perSide = 15;

  // Precompute LED positions in clockwise order: top -> right -> bottom -> left
  const leds = [];

  // Top (left to right)
  for (let i = 0; i < perSide; i++) {
    const t = (i + 0.5) / perSide;
    const x = x0 + t * size;
    const y = y0 + border / 2;
    leds.push({ x, y, rot: 0 });
  }
  // Right (top to bottom)
  for (let i = 0; i < perSide; i++) {
    const t = (i + 0.5) / perSide;
    const x = x0 + size - border / 2;
    const y = y0 + t * size;
    leds.push({ x, y, rot: 0 });
  }
  // Bottom (right to left)
  for (let i = 0; i < perSide; i++) {
    const t = (i + 0.5) / perSide;
    const x = x0 + (1 - t) * size;
    const y = y0 + size - border / 2;
    leds.push({ x, y, rot: 0 });
  }
  // Left (bottom to top)
  for (let i = 0; i < perSide; i++) {
    const t = (i + 0.5) / perSide;
    const x = x0 + border / 2;
    const y = y0 + (1 - t) * size;
    leds.push({ x, y, rot: 0 });
  }

  // Draw LEDs: unlit = dark; lit = bright + “glow”
  for (let i = 0; i < ledCount; i++) {
    const p = leds[i];

    // Unlit base
    fill("#1b1b1b");
    rectMode(CENTER);
    rect(p.x, p.y, ledSize, ledSize);

    if (i < sec) {
      // Simple glow: translucent bigger square behind
      fill(255, 255, 255, 60);
      rect(p.x, p.y, ledSize * 1.5, ledSize * 1.5);

      // Lit square (white or a Mondrian color)
      const glowColors = ["#FFFFFF", "#F7C948", "#1D4ED8", "#D62828"];
      fill(glowColors[i % glowColors.length]);
      rect(p.x, p.y, ledSize, ledSize);
    }
  }

  rectMode(CORNER);
}