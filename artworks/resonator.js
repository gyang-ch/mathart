// RESONATOR
const RESONATOR_CURVE_MODES = [
  { key: "harmonic", label: "Harmonic Phase" },
  { key: "hypotrochoidal", label: "Hypotrochoidal Evolution" },
  { key: "toroidal", label: "Toroidal Knot" }
];

const RESONATOR_PI = Math.PI;
const RESONATOR_TWO_PI = Math.PI * 2;

const RESONATOR_DEFAULTS = Object.freeze({
  numLines: 400,
  primaryHue: 118,
  hueOffset: 132,
  saturation: 90,
  brightness: 100,
  rotationSpeedScale: 0.5,
  harmonicBg: 0,
  hypotrochoidBg: 4,
  toroidalBg: 5,
  harmonicRadiusScale: 0.35,
  hypotrochoidRadiusScale: 0.22,
  toroidalMajorRadiusScale: 0.25,
  toroidalMinorRadiusScale: 0.12,
  harmonicFreq: 4,
  harmonicPhiMultiplier: 2,
  harmonicThetaMultiplier: 1.5,
  harmonicTimeStep: 0.05,
  harmonicAmpMin: 0.5,
  harmonicAmpMax: 1.5,
  harmonicSpeedMin: 0.55,
  harmonicSpeedMax: 1.0,
  harmonicStrokeWeight: 1.5,
  harmonicAlphaMin: 20,
  harmonicAlphaMax: 90,
  harmonicHueSineScale: 0.01,
  harmonicHueTimeMult: 50,
  harmonicHueLineMult: 2,
  hypoThetaMultiplier: 12,
  hypoCurve1RScale: 1.0,
  hypoCurve1rScale: 0.25,
  hypoCurve1dScale: 0.6,
  hypoCurve2RScale: 1.4,
  hypoCurve2rScale: 0.4,
  hypoCurve2dScale: 0.9,
  hypoZ1ThetaMultiplier: 2,
  hypoZ1TimeMultiplier: 1.5,
  hypoZ1RadiusScale: 0.5,
  hypoZ2ThetaMultiplier: 3,
  hypoZ2TimeMultiplier: 1,
  hypoZ2RadiusScale: 0.7,
  hypoSecondCurveTimeScale: 0.8,
  hypoSecondTimeOffset: RESONATOR_PI * 0.5,
  hypoSecondAmpScale: 0.6,
  hypoTimeStep: 0.02,
  hypoAmpMin: 0.6,
  hypoAmpMax: 1.6,
  hypoSpeedMin: 0.5,
  hypoSpeedMax: 1.5,
  hypoStrokeWeight: 1.0,
  hypoAlphaMin: 10,
  hypoAlphaMax: 85,
  hypoHueSineScale: 0.02,
  hypoHueTimeMult: 40,
  hypoHueLineMult: 1.5,
  toroidalP1: 3,
  toroidalQ1: 2,
  toroidalP2: 5,
  toroidalQ2: 4,
  toroidalV1TimeMultiplier: 1.5,
  toroidalU2TimeMultiplier: 0.8,
  toroidalV2TimeMultiplier: 2,
  toroidalMajor2Scale: 1.3,
  toroidalMinor2Scale: 0.8,
  toroidalSecondTimeOffset: RESONATOR_PI,
  toroidalSecondAmpScale: 0.75,
  toroidalTimeStep: 0.015,
  toroidalAmpMin: 0.7,
  toroidalAmpMax: 1.8,
  toroidalSpeedMin: 0.5,
  toroidalSpeedMax: 1.5,
  toroidalStrokeWeight: 1.2,
  toroidalAlphaMin: 15,
  toroidalAlphaMax: 90,
  toroidalHueSineScale: 0.05,
  toroidalHueTimeMult: 30,
  toroidalHueLineMult: 2.5
});

const RESONATOR_INTEGER_KEYS = new Set([
  "numLines",
  "primaryHue",
  "hueOffset",
  "saturation",
  "brightness",
  "harmonicBg",
  "hypotrochoidBg",
  "toroidalBg",
  "harmonicAlphaMin",
  "harmonicAlphaMax",
  "hypoAlphaMin",
  "hypoAlphaMax",
  "toroidalAlphaMin",
  "toroidalAlphaMax",
  "toroidalP1",
  "toroidalQ1",
  "toroidalP2",
  "toroidalQ2"
]);

const RESONATOR_CLAMPS = {
  numLines: [40, 1200],
  primaryHue: [0, 360],
  hueOffset: [0, 360],
  saturation: [0, 100],
  brightness: [0, 100],
  rotationSpeedScale: [0, 6],
  harmonicBg: [0, 100],
  hypotrochoidBg: [0, 100],
  toroidalBg: [0, 100],
  harmonicRadiusScale: [0.05, 0.7],
  hypotrochoidRadiusScale: [0.05, 0.6],
  toroidalMajorRadiusScale: [0.05, 0.7],
  toroidalMinorRadiusScale: [0.02, 0.4],
  harmonicFreq: [0.25, 16],
  harmonicPhiMultiplier: [0.1, 8],
  harmonicThetaMultiplier: [0.1, 8],
  harmonicTimeStep: [0, 0.2],
  harmonicAmpMin: [0, 3],
  harmonicAmpMax: [0, 4],
  harmonicSpeedMin: [0, 3],
  harmonicSpeedMax: [0, 3],
  harmonicStrokeWeight: [0.1, 6],
  harmonicAlphaMin: [0, 100],
  harmonicAlphaMax: [0, 100],
  harmonicHueSineScale: [0.001, 0.5],
  harmonicHueTimeMult: [0, 200],
  harmonicHueLineMult: [0, 20],
  hypoThetaMultiplier: [1, 32],
  hypoCurve1RScale: [0.1, 3],
  hypoCurve1rScale: [0.05, 2],
  hypoCurve1dScale: [0, 2],
  hypoCurve2RScale: [0.1, 3],
  hypoCurve2rScale: [0.05, 2],
  hypoCurve2dScale: [0, 2],
  hypoZ1ThetaMultiplier: [0, 12],
  hypoZ1TimeMultiplier: [0, 8],
  hypoZ1RadiusScale: [0, 2],
  hypoZ2ThetaMultiplier: [0, 12],
  hypoZ2TimeMultiplier: [0, 8],
  hypoZ2RadiusScale: [0, 2],
  hypoSecondCurveTimeScale: [0, 4],
  hypoSecondTimeOffset: [-RESONATOR_TWO_PI, RESONATOR_TWO_PI],
  hypoSecondAmpScale: [0, 2],
  hypoTimeStep: [0, 0.2],
  hypoAmpMin: [0, 3],
  hypoAmpMax: [0, 4],
  hypoSpeedMin: [0, 3],
  hypoSpeedMax: [0, 3],
  hypoStrokeWeight: [0.1, 6],
  hypoAlphaMin: [0, 100],
  hypoAlphaMax: [0, 100],
  hypoHueSineScale: [0.001, 0.5],
  hypoHueTimeMult: [0, 200],
  hypoHueLineMult: [0, 20],
  toroidalP1: [1, 12],
  toroidalQ1: [1, 12],
  toroidalP2: [1, 12],
  toroidalQ2: [1, 12],
  toroidalV1TimeMultiplier: [0, 8],
  toroidalU2TimeMultiplier: [0, 8],
  toroidalV2TimeMultiplier: [0, 8],
  toroidalMajor2Scale: [0.1, 3],
  toroidalMinor2Scale: [0.1, 3],
  toroidalSecondTimeOffset: [-RESONATOR_TWO_PI, RESONATOR_TWO_PI],
  toroidalSecondAmpScale: [0, 2],
  toroidalTimeStep: [0, 0.2],
  toroidalAmpMin: [0, 3],
  toroidalAmpMax: [0, 4],
  toroidalSpeedMin: [0, 3],
  toroidalSpeedMax: [0, 3],
  toroidalStrokeWeight: [0.1, 6],
  toroidalAlphaMin: [0, 100],
  toroidalAlphaMax: [0, 100],
  toroidalHueSineScale: [0.001, 0.5],
  toroidalHueTimeMult: [0, 200],
  toroidalHueLineMult: [0, 20]
};

let resonatorCurveMode = 0;
let resonatorTime = 0;
let resonatorRotationDirection = 1;
let resonatorNumLines = RESONATOR_DEFAULTS.numLines;
let resonatorBaseRadius = 0;
let resonatorMajorRadius = 0;
let resonatorMinorRadius = 0;
let resonatorPG = null;
let resonatorAngleX = 0;
let resonatorAngleY = 0;
let resonatorAngleZ = 0;
let resonatorConfig = { ...RESONATOR_DEFAULTS };

function clampResonatorValue(key, value) {
  const clampRange = RESONATOR_CLAMPS[key];
  let nextValue = Number(value);
  if (!Number.isFinite(nextValue)) return null;
  if (clampRange) {
    nextValue = constrain(nextValue, clampRange[0], clampRange[1]);
  }
  if (RESONATOR_INTEGER_KEYS.has(key)) {
    nextValue = Math.round(nextValue);
  }
  return nextValue;
}

function updateResonatorGeometry() {
  resonatorNumLines = Math.max(2, Math.round(resonatorConfig.numLines));

  if (resonatorCurveMode === 1) {
    resonatorBaseRadius = min(width, height) * resonatorConfig.hypotrochoidRadiusScale;
    resonatorMajorRadius = 0;
    resonatorMinorRadius = 0;
    return;
  }

  if (resonatorCurveMode === 2) {
    resonatorMajorRadius = min(width, height) * resonatorConfig.toroidalMajorRadiusScale;
    resonatorMinorRadius = min(width, height) * resonatorConfig.toroidalMinorRadiusScale;
    resonatorBaseRadius = 0;
    return;
  }

  resonatorBaseRadius = min(width, height) * resonatorConfig.harmonicRadiusScale;
  resonatorMajorRadius = 0;
  resonatorMinorRadius = 0;
}

function resetResonatorOrientation() {
  if (resonatorCurveMode === 1) {
    resonatorAngleX = RESONATOR_PI / 4;
    resonatorAngleY = 0;
    resonatorAngleZ = 0;
    return;
  }

  if (resonatorCurveMode === 2) {
    resonatorAngleX = RESONATOR_PI / 5;
    resonatorAngleY = 0;
    resonatorAngleZ = 0;
    return;
  }

  resonatorAngleX = 0;
  resonatorAngleY = 0;
  resonatorAngleZ = 0;
}

function initResonator() {
  resonatorPG = createGraphics(windowWidth, windowHeight, WEBGL);
  resonatorPG.colorMode(HSB, 360, 100, 100, 100);
  resonatorPG.smooth();
  resonatorTime = 0;
  resetResonatorOrientation();
  updateResonatorGeometry();
}

function drawResonator() {
  if (!resonatorPG) initResonator();

  updateResonatorGeometry();

  const safeMotionFactor = Number.isFinite(motionFactor) ? motionFactor : 1;
  const distFromCenter = dist(mouseX - width * 0.5, mouseY - height * 0.5, 0, 0);

  if (resonatorCurveMode === 1) {
    drawHypotrochoidalResonator(distFromCenter, safeMotionFactor);
    return;
  }

  if (resonatorCurveMode === 2) {
    drawToroidalResonator(distFromCenter, safeMotionFactor);
    return;
  }

  drawHarmonicResonator(distFromCenter, safeMotionFactor);
}

function getResonatorRotationFactor() {
  return resonatorRotationDirection * resonatorConfig.rotationSpeedScale;
}

function drawHarmonicResonator(distFromCenter, safeMotionFactor) {
  resonatorPG.background(0, 0, resonatorConfig.harmonicBg);
  resonatorPG.resetMatrix();

  const rotationFactor = getResonatorRotationFactor() * safeMotionFactor;
  resonatorAngleY += 0.008 * rotationFactor;
  resonatorAngleZ += 0.004 * rotationFactor;
  resonatorPG.rotateY(resonatorAngleY);
  resonatorPG.rotateZ(resonatorAngleZ);

  const targetAmp = map(
    distFromCenter,
    0,
    width * 0.5,
    resonatorConfig.harmonicAmpMin,
    resonatorConfig.harmonicAmpMax,
    true
  );

  resonatorPG.blendMode(ADD);
  resonatorPG.noFill();

  drawResonatorHarmonicPhase3D(resonatorTime, resonatorConfig.harmonicFreq, targetAmp);
  drawResonatorHarmonicPhase3D(resonatorTime + RESONATOR_PI, resonatorConfig.harmonicFreq, targetAmp);

  const speedMult = map(
    distFromCenter,
    5,
    width * 0.5,
    resonatorConfig.harmonicSpeedMin,
    resonatorConfig.harmonicSpeedMax,
    true
  );
  resonatorTime += resonatorConfig.harmonicTimeStep * speedMult * rotationFactor;

  resonatorPG.blendMode(BLEND);
  image(resonatorPG, 0, 0, width, height);
}

function drawHypotrochoidalResonator(distFromCenter, safeMotionFactor) {
  resonatorPG.background(0, 0, resonatorConfig.hypotrochoidBg);
  resonatorPG.resetMatrix();

  const rotationFactor = getResonatorRotationFactor() * safeMotionFactor;
  resonatorAngleX += 0.004 * rotationFactor;
  resonatorAngleY += 0.006 * rotationFactor;
  resonatorAngleZ += 0.003 * rotationFactor;
  resonatorPG.rotateX(resonatorAngleX);
  resonatorPG.rotateY(resonatorAngleY);
  resonatorPG.rotateZ(resonatorAngleZ);

  const targetAmp = map(
    distFromCenter,
    0,
    width * 0.5,
    resonatorConfig.hypoAmpMin,
    resonatorConfig.hypoAmpMax,
    true
  );

  resonatorPG.blendMode(ADD);
  resonatorPG.noFill();
  drawHypotrochoid3D(resonatorTime, 1, targetAmp);
  drawHypotrochoid3D(
    resonatorTime + resonatorConfig.hypoSecondTimeOffset,
    1,
    targetAmp * resonatorConfig.hypoSecondAmpScale
  );

  const speedMult = map(
    distFromCenter,
    0,
    width * 0.5,
    resonatorConfig.hypoSpeedMin,
    resonatorConfig.hypoSpeedMax,
    true
  );
  resonatorTime += resonatorConfig.hypoTimeStep * speedMult * rotationFactor;

  resonatorPG.blendMode(BLEND);
  image(resonatorPG, 0, 0, width, height);
}

function drawToroidalResonator(distFromCenter, safeMotionFactor) {
  resonatorPG.background(0, 0, resonatorConfig.toroidalBg);
  resonatorPG.resetMatrix();

  const rotationFactor = getResonatorRotationFactor() * safeMotionFactor;
  resonatorAngleX += 0.003 * rotationFactor;
  resonatorAngleY += 0.005 * rotationFactor;
  resonatorAngleZ += 0.002 * rotationFactor;
  resonatorPG.rotateX(resonatorAngleX);
  resonatorPG.rotateY(resonatorAngleY);
  resonatorPG.rotateZ(resonatorAngleZ);

  const targetAmp = map(
    distFromCenter,
    0,
    width * 0.5,
    resonatorConfig.toroidalAmpMin,
    resonatorConfig.toroidalAmpMax,
    true
  );

  resonatorPG.blendMode(ADD);
  resonatorPG.noFill();
  drawToroidalHarmonic3D(resonatorTime, 1, targetAmp);
  drawToroidalHarmonic3D(
    resonatorTime + resonatorConfig.toroidalSecondTimeOffset,
    1,
    targetAmp * resonatorConfig.toroidalSecondAmpScale
  );

  const speedMult = map(
    distFromCenter,
    0,
    width * 0.5,
    resonatorConfig.toroidalSpeedMin,
    resonatorConfig.toroidalSpeedMax,
    true
  );
  resonatorTime += resonatorConfig.toroidalTimeStep * speedMult * rotationFactor;

  resonatorPG.blendMode(BLEND);
  image(resonatorPG, 0, 0, width, height);
}

function drawResonatorHarmonicPhase3D(time, freq, amp) {
  for (let i = 0; i < resonatorNumLines; i++) {
    const p = i / resonatorNumLines;
    const theta = RESONATOR_TWO_PI * p * freq + time;
    const phi = RESONATOR_TWO_PI * p + time * 0.5;

    const x1 = resonatorBaseRadius * sin(theta) * cos(phi * resonatorConfig.harmonicPhiMultiplier) * amp;
    const y1 = resonatorBaseRadius * cos(theta * resonatorConfig.harmonicThetaMultiplier) * sin(phi) * amp;
    const z1 = resonatorBaseRadius * sin(phi + theta) * amp;

    const x2 = resonatorBaseRadius * cos(theta + time) * amp;
    const y2 = resonatorBaseRadius * sin(phi + theta) * amp;
    const z2 = resonatorBaseRadius * cos(phi - theta) * amp;

    const dynamicHue = getResonatorDynamicHue(
      time,
      i,
      resonatorConfig.harmonicHueSineScale,
      resonatorConfig.harmonicHueTimeMult,
      resonatorConfig.harmonicHueLineMult
    );
    const alpha = map(
      z1,
      -resonatorBaseRadius,
      resonatorBaseRadius,
      resonatorConfig.harmonicAlphaMin,
      resonatorConfig.harmonicAlphaMax
    );

    resonatorPG.strokeWeight(resonatorConfig.harmonicStrokeWeight);
    resonatorPG.stroke(dynamicHue, resonatorConfig.saturation, resonatorConfig.brightness, alpha);
    resonatorPG.line(x1, y1, z1, x2, y2, z2);
  }
}

function drawHypotrochoid3D(time, freq, amp) {
  for (let i = 0; i < resonatorNumLines; i++) {
    const pFactor = i / resonatorNumLines;
    const theta = RESONATOR_TWO_PI * pFactor * freq * resonatorConfig.hypoThetaMultiplier;

    const R1 = resonatorBaseRadius * resonatorConfig.hypoCurve1RScale;
    const r1 = resonatorBaseRadius * resonatorConfig.hypoCurve1rScale;
    const d1 = resonatorBaseRadius * resonatorConfig.hypoCurve1dScale;
    const t1 = theta + time;

    let x1 = (R1 - r1) * cos(t1) + d1 * cos(((R1 - r1) / r1) * t1);
    let y1 = (R1 - r1) * sin(t1) - d1 * sin(((R1 - r1) / r1) * t1);
    let z1 = sin(theta * resonatorConfig.hypoZ1ThetaMultiplier + time * resonatorConfig.hypoZ1TimeMultiplier) *
      (resonatorBaseRadius * resonatorConfig.hypoZ1RadiusScale);

    const R2 = resonatorBaseRadius * resonatorConfig.hypoCurve2RScale;
    const r2 = resonatorBaseRadius * resonatorConfig.hypoCurve2rScale;
    const d2 = resonatorBaseRadius * resonatorConfig.hypoCurve2dScale;
    const t2 = theta - time * resonatorConfig.hypoSecondCurveTimeScale;

    let x2 = (R2 - r2) * cos(t2) + d2 * cos(((R2 - r2) / r2) * t2);
    let y2 = (R2 - r2) * sin(t2) - d2 * sin(((R2 - r2) / r2) * t2);
    let z2 = cos(theta * resonatorConfig.hypoZ2ThetaMultiplier - time * resonatorConfig.hypoZ2TimeMultiplier) *
      (resonatorBaseRadius * resonatorConfig.hypoZ2RadiusScale);

    x1 *= amp;
    y1 *= amp;
    z1 *= amp;
    x2 *= amp;
    y2 *= amp;
    z2 *= amp;

    const dynamicHue = getResonatorDynamicHue(
      time,
      i,
      resonatorConfig.hypoHueSineScale,
      resonatorConfig.hypoHueTimeMult,
      resonatorConfig.hypoHueLineMult
    );
    const alpha = map(
      z1 + z2,
      -resonatorBaseRadius * 1.5,
      resonatorBaseRadius * 1.5,
      resonatorConfig.hypoAlphaMin,
      resonatorConfig.hypoAlphaMax
    );

    resonatorPG.strokeWeight(resonatorConfig.hypoStrokeWeight);
    resonatorPG.stroke(dynamicHue, resonatorConfig.saturation, resonatorConfig.brightness, alpha);
    resonatorPG.line(x1, y1, z1, x2, y2, z2);
  }
}

function drawToroidalHarmonic3D(time, freq, amp) {
  for (let i = 0; i < resonatorNumLines; i++) {
    const pFactor = i / resonatorNumLines;
    const theta = RESONATOR_TWO_PI * pFactor * freq;

    const u1 = resonatorConfig.toroidalP1 * theta + time;
    const v1 = resonatorConfig.toroidalQ1 * theta - time * resonatorConfig.toroidalV1TimeMultiplier;

    const u2 = resonatorConfig.toroidalP2 * theta - time * resonatorConfig.toroidalU2TimeMultiplier;
    const v2 = resonatorConfig.toroidalQ2 * theta + time * resonatorConfig.toroidalV2TimeMultiplier;

    const R = resonatorMajorRadius * amp;
    const r = resonatorMinorRadius * amp;

    const x1 = (R + r * cos(v1)) * cos(u1);
    const y1 = (R + r * cos(v1)) * sin(u1);
    const z1 = r * sin(v1);

    const R2 = R * resonatorConfig.toroidalMajor2Scale;
    const r2 = r * resonatorConfig.toroidalMinor2Scale;
    const x2 = (R2 + r2 * cos(v2)) * cos(u2);
    const y2 = (R2 + r2 * cos(v2)) * sin(u2);
    const z2 = r2 * sin(v2);

    const dynamicHue = getResonatorDynamicHue(
      time,
      i,
      resonatorConfig.toroidalHueSineScale,
      resonatorConfig.toroidalHueTimeMult,
      resonatorConfig.toroidalHueLineMult
    );
    const alpha = map(
      z1 + z2,
      -(r + r2),
      r + r2,
      resonatorConfig.toroidalAlphaMin,
      resonatorConfig.toroidalAlphaMax
    );

    resonatorPG.strokeWeight(resonatorConfig.toroidalStrokeWeight);
    resonatorPG.stroke(dynamicHue, resonatorConfig.saturation, resonatorConfig.brightness, alpha);
    resonatorPG.line(x1, y1, z1, x2, y2, z2);
  }
}

function getResonatorCurveLabel() {
  return RESONATOR_CURVE_MODES[resonatorCurveMode].label;
}

function getResonatorSecondaryHue() {
  return (resonatorConfig.primaryHue + resonatorConfig.hueOffset) % 360;
}

function getResonatorDynamicHue(time, i, sineScale, timeMult, lineMult) {
  const hueVal = (time * timeMult + i * lineMult) % 360;
  return map(sin(hueVal * sineScale), -1, 1, resonatorConfig.primaryHue, getResonatorSecondaryHue());
}

function cycleResonatorCurve() {
  resonatorCurveMode = (resonatorCurveMode + 1) % RESONATOR_CURVE_MODES.length;
  initResonator();
  return getResonatorCurveLabel();
}

function selectResonatorCurve(index) {
  const clamped = Math.max(0, Math.min(RESONATOR_CURVE_MODES.length - 1, Math.round(index)));
  if (clamped === resonatorCurveMode) return getResonatorCurveLabel();
  resonatorCurveMode = clamped;
  initResonator();
  return getResonatorCurveLabel();
}

function setResonatorHue(newHue) {
  setResonatorConfig({ primaryHue: newHue });
}

function getResonatorHue() {
  return resonatorConfig.primaryHue;
}

function invertResonatorRotation() {
  resonatorRotationDirection *= -1;
  return resonatorRotationDirection;
}

function getResonatorConfig() {
  return {
    ...resonatorConfig,
    rotationDirection: resonatorRotationDirection,
    curveMode: resonatorCurveMode
  };
}

function setResonatorConfig(patch) {
  if (!patch || typeof patch !== "object") return getResonatorConfig();

  const nextConfig = { ...resonatorConfig };
  let changed = false;

  Object.keys(patch).forEach((key) => {
    if (!(key in RESONATOR_DEFAULTS)) return;
    const nextValue = clampResonatorValue(key, patch[key]);
    if (nextValue === null) return;
    if (nextConfig[key] === nextValue) return;
    nextConfig[key] = nextValue;
    changed = true;
  });

  if (!changed) return getResonatorConfig();

  if (nextConfig.harmonicAmpMin > nextConfig.harmonicAmpMax) {
    nextConfig.harmonicAmpMax = nextConfig.harmonicAmpMin;
  }
  if (nextConfig.hypoAmpMin > nextConfig.hypoAmpMax) {
    nextConfig.hypoAmpMax = nextConfig.hypoAmpMin;
  }
  if (nextConfig.toroidalAmpMin > nextConfig.toroidalAmpMax) {
    nextConfig.toroidalAmpMax = nextConfig.toroidalAmpMin;
  }

  resonatorConfig = nextConfig;
  updateResonatorGeometry();
  return getResonatorConfig();
}

function resetResonatorConfig() {
  resonatorConfig = { ...RESONATOR_DEFAULTS };
  resonatorRotationDirection = 1;
  updateResonatorGeometry();
  resetResonatorOrientation();
  resonatorTime = 0;
  return getResonatorConfig();
}

window.getResonatorCurveLabel = getResonatorCurveLabel;
window.cycleResonatorCurve = cycleResonatorCurve;
window.selectResonatorCurve = selectResonatorCurve;
window.setResonatorHue = setResonatorHue;
window.getResonatorHue = getResonatorHue;
window.invertResonatorRotation = invertResonatorRotation;
window.getResonatorConfig = getResonatorConfig;
window.setResonatorConfig = setResonatorConfig;
window.resetResonatorConfig = resetResonatorConfig;
