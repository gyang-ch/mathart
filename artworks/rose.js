// ROSE
let n = 6;
let d = 71;
let rosePalette = {
  coolHue: 196,
  warmHue: 338
};

function clampRoseHue(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return ((num % 360) + 360) % 360;
}

function roseHsvToRgb(h, s, v) {
  const hue = ((h % 360) + 360) % 360;
  const sat = min(max(s, 0), 1);
  const val = min(max(v, 0), 1);
  const c = val * sat;
  const x = c * (1 - abs((hue / 60) % 2 - 1));
  const m = val - c;

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hue < 60) {
    r1 = c; g1 = x; b1 = 0;
  } else if (hue < 120) {
    r1 = x; g1 = c; b1 = 0;
  } else if (hue < 180) {
    r1 = 0; g1 = c; b1 = x;
  } else if (hue < 240) {
    r1 = 0; g1 = x; b1 = c;
  } else if (hue < 300) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  return {
    r: (r1 + m) * 255,
    g: (g1 + m) * 255,
    b: (b1 + m) * 255
  };
}

function setRosePalette(next = {}) {
  if (Object.prototype.hasOwnProperty.call(next, "coolHue")) {
    rosePalette.coolHue = clampRoseHue(next.coolHue);
  }
  if (Object.prototype.hasOwnProperty.call(next, "warmHue")) {
    rosePalette.warmHue = clampRoseHue(next.warmHue);
  }
}

function getRosePalette() {
  return {
    coolHue: rosePalette.coolHue,
    warmHue: rosePalette.warmHue
  };
}

window.setRosePalette = setRosePalette;
window.getRosePalette = getRosePalette;

function drawMaurerRose() {
  background(10);
  translate(width / 2, height / 2);
  noFill();

  let dim = min(width, height);
  let rBase = dim * 0.42;

  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    n = floor(map(mouseX, 0, width, 2, 20));
    d = floor(map(mouseY, 0, height, 1, 180));
  }

  const coolColor = roseHsvToRgb(rosePalette.coolHue, 0.92, 1);
  const warmColor = roseHsvToRgb(rosePalette.warmHue, 0.86, 1);

  strokeWeight(2.6);
  stroke(coolColor.r, coolColor.g, coolColor.b, 38);
  beginShape();
  for (let i = 0; i < 361; i++) {
    let k = i * d;
    let r = rBase * sin(n * k);
    let x = r * cos(k);
    let y = r * sin(k);
    vertex(x, y);
  }
  endShape();

  strokeWeight(1.2);
  stroke(coolColor.r, coolColor.g, coolColor.b, 152);
  beginShape();
  for (let i = 0; i < 361; i++) {
    let k = i * d;
    let r = rBase * sin(n * k);
    let x = r * cos(k);
    let y = r * sin(k);
    vertex(x, y);
  }
  endShape();

  stroke(warmColor.r, warmColor.g, warmColor.b, 46);
  strokeWeight(3.6);
  beginShape();
  for (let i = 0; i < 361; i++) {
    let k = i;
    let r = rBase * sin(n * k);
    let x = r * cos(k);
    let y = r * sin(k);
    vertex(x, y);
  }
  endShape();

  stroke(warmColor.r, warmColor.g, warmColor.b, 235);
  strokeWeight(2.1);
  beginShape();
  for (let i = 0; i < 361; i++) {
    let k = i;
    let r = rBase * sin(n * k);
    let x = r * cos(k);
    let y = r * sin(k);
    vertex(x, y);
  }
  endShape();

  resetMatrix();
}
