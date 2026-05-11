// RESONATOR NEW
const RESONATOR_NEW_CURVE_MODES = [
  { key: "harmonic", label: "Harmonic Phase" },
  { key: "hypotrochoidal", label: "Hypotrochoidal Evolution" },
  { key: "toroidal", label: "Toroidal Knot" }
];

const MORPHOGENESIS_PALETTES = [
  { bg: [2, 5, 12], colors: [[0, 255, 180], [0, 100, 255], [200, 255, 255]] },
  { bg: [8, 2, 5], colors: [[255, 50, 100], [255, 150, 50], [255, 200, 200]] },
  { bg: [10, 8, 12], colors: [[255, 100, 200], [255, 200, 50], [100, 50, 255]] },
  { bg: [5, 5, 5], colors: [[100, 150, 255], [200, 200, 255], [255, 255, 255]] },
  { bg: [5, 5, 5], colors: [[167, 122, 75], [236, 198, 162], [164, 48, 32]] },
  { bg: [5, 5, 5], colors: [[74, 113, 105], [190, 181, 156], [115, 82, 49]] },
  { bg: [5, 5, 5], colors: [[86, 141, 75], [213, 187, 86], [210, 106, 27]] },
  { bg: [5, 5, 5], colors: [[182, 102, 54], [84, 122, 86], [189, 174, 91]] },
  { bg: [5, 5, 5], colors: [[45, 68, 114], [110, 99, 82], [217, 204, 172]] }
];

let resonatorNewActivePaletteIdx = 0;
let resonatorNewCurveMode = 0;
let resonatorNewTime = 0;
let resonatorNewRotationSpeed = 1;
let resonatorNewNumLines = 400;
let resonatorNewBaseRadius = 0;
let resonatorNewMajorRadius = 0;
let resonatorNewMinorRadius = 0;
let resonatorNewPG = null;
let resonatorNewAngleX = 0;
let resonatorNewAngleY = 0;
let resonatorNewAngleZ = 0;

function initResonatorNew() {
  resonatorNewPG = createGraphics(windowWidth, windowHeight, WEBGL);
  resonatorNewPG.colorMode(RGB, 255, 255, 255, 255);
  resonatorNewPG.smooth();
  resonatorNewTime = 0;

  if (resonatorNewCurveMode === 1) {
    resonatorNewBaseRadius = min(width, height) * 0.22;
    resonatorNewMajorRadius = 0;
    resonatorNewMinorRadius = 0;
    resonatorNewAngleX = PI / 4;
    resonatorNewAngleY = 0;
    resonatorNewAngleZ = 0;
    return;
  }

  if (resonatorNewCurveMode === 2) {
    resonatorNewMajorRadius = min(width, height) * 0.25;
    resonatorNewMinorRadius = min(width, height) * 0.12;
    resonatorNewBaseRadius = 0;
    resonatorNewAngleX = PI / 5;
    resonatorNewAngleY = 0;
    resonatorNewAngleZ = 0;
    return;
  }

  resonatorNewBaseRadius = min(width, height) * 0.35;
  resonatorNewMajorRadius = 0;
  resonatorNewMinorRadius = 0;
  resonatorNewAngleX = 0;
  resonatorNewAngleY = 0;
  resonatorNewAngleZ = 0;
}

function applyMorphogenesisDistortionNew(pt, time) {
  let qx = pt.x;
  let qy = pt.y;
  let qz = pt.z;
  let freq = 0.02;
  let amp = 15.0;

  for (let i = 0; i < 3; i++) {
    const bucklingX = abs(sin(qx * freq + sin(qy * freq) + time * 1.5)) - 0.5;
    const bucklingY = abs(sin(qy * freq + sin(qz * freq) + time * 1.5)) - 0.5;
    const bucklingZ = abs(sin(qz * freq + sin(qx * freq) + time * 1.5)) - 0.5;

    qx += amp * bucklingX;
    qy += amp * bucklingY;
    qz += amp * bucklingZ;

    amp *= 0.45;
    freq *= 2.0;
  }

  return { x: qx, y: qy, z: qz };
}

function getMorphogenesisColorNew(x, y, z, pFactor, time) {
  const palette = MORPHOGENESIS_PALETTES[resonatorNewActivePaletteIdx];
  const c1 = palette.colors[0];
  const c2 = palette.colors[1];
  const c3 = palette.colors[2];

  const distFromCore = dist(0, 0, 0, x, y, z);
  const mix1 = constrain(map(distFromCore, 0, min(width, height) * 0.4, 0, 1), 0, 1);
  const mix2 = constrain(map(sin(pFactor * TWO_PI + time * 2), -1, 1, 0, 1), 0, 1);

  const rBase = lerp(c1[0], c2[0], mix1);
  const gBase = lerp(c1[1], c2[1], mix1);
  const bBase = lerp(c1[2], c2[2], mix1);

  const rFinal = lerp(rBase, c3[0], mix2);
  const gFinal = lerp(gBase, c3[1], mix2);
  const bFinal = lerp(bBase, c3[2], mix2);

  return [rFinal, gFinal, bFinal];
}

function applyResonatorNewPaletteBackground() {
  const bg = MORPHOGENESIS_PALETTES[resonatorNewActivePaletteIdx].bg;
  resonatorNewPG.background(bg[0], bg[1], bg[2]);
}

function drawResonatorNew() {
  if (!resonatorNewPG) initResonatorNew();

  const sharedMotionFactor = typeof motionFactor === "number" ? motionFactor : window.motionFactor;
  const safeMotionFactor = Number.isFinite(sharedMotionFactor) ? sharedMotionFactor : 1;
  const distFromCenter = dist(mouseX - width * 0.5, mouseY - height * 0.5, 0, 0);

  if (resonatorNewCurveMode === 1) {
    drawHypotrochoidalResonatorNew(distFromCenter, safeMotionFactor);
    return;
  }

  if (resonatorNewCurveMode === 2) {
    drawToroidalResonatorNew(distFromCenter, safeMotionFactor);
    return;
  }

  drawHarmonicResonatorNew(distFromCenter, safeMotionFactor);
}

function drawHarmonicResonatorNew(distFromCenter, safeMotionFactor) {
  applyResonatorNewPaletteBackground();
  resonatorNewPG.resetMatrix();

  resonatorNewAngleY += 0.008 * resonatorNewRotationSpeed * safeMotionFactor;
  resonatorNewAngleZ += 0.004 * resonatorNewRotationSpeed * safeMotionFactor;
  resonatorNewPG.rotateY(resonatorNewAngleY);
  resonatorNewPG.rotateZ(resonatorNewAngleZ);

  const targetAmp = map(distFromCenter, 0, width * 0.5, 0.5, 1.5, true);
  const targetFreq = 4;

  resonatorNewPG.blendMode(ADD);
  resonatorNewPG.noFill();

  drawResonatorHarmonicPhase3DNew(resonatorNewTime, targetFreq, targetAmp);
  drawResonatorHarmonicPhase3DNew(resonatorNewTime + PI, targetFreq, targetAmp);

  const speedMult = map(distFromCenter, 5, width * 0.5, 0.55, 1.0, true);
  resonatorNewTime += 0.05 * speedMult * resonatorNewRotationSpeed * safeMotionFactor;

  resonatorNewPG.blendMode(BLEND);
  image(resonatorNewPG, 0, 0, width, height);
}

function drawHypotrochoidalResonatorNew(distFromCenter, safeMotionFactor) {
  applyResonatorNewPaletteBackground();
  resonatorNewPG.resetMatrix();

  resonatorNewAngleX += 0.004 * resonatorNewRotationSpeed * safeMotionFactor;
  resonatorNewAngleY += 0.006 * resonatorNewRotationSpeed * safeMotionFactor;
  resonatorNewAngleZ += 0.003 * resonatorNewRotationSpeed * safeMotionFactor;
  resonatorNewPG.rotateX(resonatorNewAngleX);
  resonatorNewPG.rotateY(resonatorNewAngleY);
  resonatorNewPG.rotateZ(resonatorNewAngleZ);

  const targetAmp = map(distFromCenter, 0, width * 0.5, 0.6, 1.6, true);
  const targetFreq = 1;

  resonatorNewPG.blendMode(ADD);
  resonatorNewPG.noFill();
  drawHypotrochoid3DNew(resonatorNewTime, targetFreq, targetAmp);
  drawHypotrochoid3DNew(resonatorNewTime + PI * 0.5, targetFreq, targetAmp * 0.6);

  const speedMult = map(distFromCenter, 0, width * 0.5, 0.5, 1.5, true);
  resonatorNewTime += 0.02 * speedMult * resonatorNewRotationSpeed * safeMotionFactor;

  resonatorNewPG.blendMode(BLEND);
  image(resonatorNewPG, 0, 0, width, height);
}

function drawToroidalResonatorNew(distFromCenter, safeMotionFactor) {
  applyResonatorNewPaletteBackground();
  resonatorNewPG.resetMatrix();

  resonatorNewAngleX += 0.003 * resonatorNewRotationSpeed * safeMotionFactor;
  resonatorNewAngleY += 0.005 * resonatorNewRotationSpeed * safeMotionFactor;
  resonatorNewAngleZ += 0.002 * resonatorNewRotationSpeed * safeMotionFactor;
  resonatorNewPG.rotateX(resonatorNewAngleX);
  resonatorNewPG.rotateY(resonatorNewAngleY);
  resonatorNewPG.rotateZ(resonatorNewAngleZ);

  const targetAmp = map(distFromCenter, 0, width * 0.5, 0.7, 1.8, true);
  const targetFreq = 1;

  resonatorNewPG.blendMode(ADD);
  resonatorNewPG.noFill();
  drawToroidalHarmonic3DNew(resonatorNewTime, targetFreq, targetAmp);
  drawToroidalHarmonic3DNew(resonatorNewTime + PI, targetFreq, targetAmp * 0.75);

  const speedMult = map(distFromCenter, 0, width * 0.5, 0.5, 1.5, true);
  resonatorNewTime += 0.015 * speedMult * resonatorNewRotationSpeed * safeMotionFactor;

  resonatorNewPG.blendMode(BLEND);
  image(resonatorNewPG, 0, 0, width, height);
}

function drawResonatorHarmonicPhase3DNew(time, freq, amp) {
  for (let i = 0; i < resonatorNewNumLines; i++) {
    const p = i / resonatorNewNumLines;
    const theta = TWO_PI * p * freq + time;
    const phi = TWO_PI * p + time * 0.5;

    let pt1 = {
      x: resonatorNewBaseRadius * sin(theta) * cos(phi * 2) * amp,
      y: resonatorNewBaseRadius * cos(theta * 1.5) * sin(phi) * amp,
      z: resonatorNewBaseRadius * sin(phi + theta) * amp
    };

    let pt2 = {
      x: resonatorNewBaseRadius * cos(theta + time) * amp,
      y: resonatorNewBaseRadius * sin(phi + theta) * amp,
      z: resonatorNewBaseRadius * cos(phi - theta) * amp
    };

    pt1 = applyMorphogenesisDistortionNew(pt1, time);
    pt2 = applyMorphogenesisDistortionNew(pt2, time);

    const c = getMorphogenesisColorNew(pt1.x, pt1.y, pt1.z, p, time);
    const alpha = map(pt1.z, -resonatorNewBaseRadius, resonatorNewBaseRadius, 50, 230);

    resonatorNewPG.strokeWeight(1.5);
    resonatorNewPG.stroke(c[0], c[1], c[2], alpha);
    resonatorNewPG.line(pt1.x, pt1.y, pt1.z, pt2.x, pt2.y, pt2.z);
  }
}

function drawHypotrochoid3DNew(time, freq, amp) {
  for (let i = 0; i < resonatorNewNumLines; i++) {
    const pFactor = i / resonatorNewNumLines;
    const theta = TWO_PI * pFactor * freq * 12;

    const R1 = resonatorNewBaseRadius * 1.0;
    const r1 = resonatorNewBaseRadius * 0.25;
    const d1 = resonatorNewBaseRadius * 0.6;
    const t1 = theta + time;

    let pt1 = {
      x: ((R1 - r1) * cos(t1) + d1 * cos(((R1 - r1) / r1) * t1)) * amp,
      y: ((R1 - r1) * sin(t1) - d1 * sin(((R1 - r1) / r1) * t1)) * amp,
      z: sin(theta * 2 + time * 1.5) * (resonatorNewBaseRadius * 0.5) * amp
    };

    const R2 = resonatorNewBaseRadius * 1.4;
    const r2 = resonatorNewBaseRadius * 0.4;
    const d2 = resonatorNewBaseRadius * 0.9;
    const t2 = theta - time * 0.8;

    let pt2 = {
      x: ((R2 - r2) * cos(t2) + d2 * cos(((R2 - r2) / r2) * t2)) * amp,
      y: ((R2 - r2) * sin(t2) - d2 * sin(((R2 - r2) / r2) * t2)) * amp,
      z: cos(theta * 3 - time) * (resonatorNewBaseRadius * 0.7) * amp
    };

    pt1 = applyMorphogenesisDistortionNew(pt1, time);
    pt2 = applyMorphogenesisDistortionNew(pt2, time);

    const c = getMorphogenesisColorNew(pt1.x, pt1.y, pt1.z, pFactor, time);
    const alpha = map(
      pt1.z + pt2.z,
      -resonatorNewBaseRadius * 1.5,
      resonatorNewBaseRadius * 1.5,
      25,
      220
    );

    resonatorNewPG.strokeWeight(1.0);
    resonatorNewPG.stroke(c[0], c[1], c[2], alpha);
    resonatorNewPG.line(pt1.x, pt1.y, pt1.z, pt2.x, pt2.y, pt2.z);
  }
}

function drawToroidalHarmonic3DNew(time, freq, amp) {
  for (let i = 0; i < resonatorNewNumLines; i++) {
    const pFactor = i / resonatorNewNumLines;
    const theta = TWO_PI * pFactor * freq;

    const p1 = 3;
    const q1 = 2;
    const u1 = p1 * theta + time;
    const v1 = q1 * theta - time * 1.5;

    const p2 = 5;
    const q2 = 4;
    const u2 = p2 * theta - time * 0.8;
    const v2 = q2 * theta + time * 2;

    const R = resonatorNewMajorRadius * amp;
    const r = resonatorNewMinorRadius * amp;

    let pt1 = {
      x: (R + r * cos(v1)) * cos(u1),
      y: (R + r * cos(v1)) * sin(u1),
      z: r * sin(v1)
    };

    const R2 = R * 1.3;
    const r2 = r * 0.8;
    let pt2 = {
      x: (R2 + r2 * cos(v2)) * cos(u2),
      y: (R2 + r2 * cos(v2)) * sin(u2),
      z: r2 * sin(v2)
    };

    pt1 = applyMorphogenesisDistortionNew(pt1, time);
    pt2 = applyMorphogenesisDistortionNew(pt2, time);

    const c = getMorphogenesisColorNew(pt1.x, pt1.y, pt1.z, pFactor, time);
    const alpha = map(pt1.z + pt2.z, -(r + r2), r + r2, 35, 230);

    resonatorNewPG.strokeWeight(1.2);
    resonatorNewPG.stroke(c[0], c[1], c[2], alpha);
    resonatorNewPG.line(pt1.x, pt1.y, pt1.z, pt2.x, pt2.y, pt2.z);
  }
}

function getResonatorNewCurveLabel() {
  return RESONATOR_NEW_CURVE_MODES[resonatorNewCurveMode].label;
}

function cycleResonatorNewCurve() {
  resonatorNewCurveMode = (resonatorNewCurveMode + 1) % RESONATOR_NEW_CURVE_MODES.length;
  initResonatorNew();
  return getResonatorNewCurveLabel();
}

function cycleResonatorNewPalette() {
  resonatorNewActivePaletteIdx = (resonatorNewActivePaletteIdx + 1) % MORPHOGENESIS_PALETTES.length;
  return resonatorNewActivePaletteIdx;
}

function getResonatorNewPaletteIndex() {
  return resonatorNewActivePaletteIdx;
}

function invertResonatorNewRotation() {
  resonatorNewRotationSpeed *= -1;
}

window.getResonatorNewCurveLabel = getResonatorNewCurveLabel;
window.cycleResonatorNewCurve = cycleResonatorNewCurve;
window.cycleResonatorNewPalette = cycleResonatorNewPalette;
window.getResonatorNewPaletteIndex = getResonatorNewPaletteIndex;
window.invertResonatorNewRotation = invertResonatorNewRotation;
