import { reducedMotion } from '../js/state.js';

// FRACTAL
let fractalPG = null;
let fractalBoxes = [];
let currentDepth = -1;
let currentGap = -1;

let fractalSettings = {
  depth: 3,
  rotXSpeed: 0.01,
  rotYSpeed: 0.015,
  baseHue: 200,
  gap: 1
};

export function setFractalSettings(partial) {
  Object.assign(fractalSettings, partial);
}

export function getFractalSettings() {
  return { ...fractalSettings };
}

function clampFractalNumber(value, minValue, maxValue) {
  return min(max(Number(value) || 0, minValue), maxValue);
}

export function initFractal() {
  fractalPG = createGraphics(windowWidth, windowHeight, WEBGL);
  fractalPG.colorMode(HSB, 360, 100, 100, 100);
  generateFractalStructure();
}

function generateFractalStructure() {
  fractalBoxes = [];
  currentDepth = fractalSettings.depth;
  currentGap = fractalSettings.gap;
  const baseSize = min(width, height) * 0.38;
  createBoxes(0, 0, 0, baseSize, currentDepth, currentDepth);
}

function branchNoise(x, y, z, level) {
  const n = sin(x * 12.9898 + y * 78.233 + z * 37.719 + level * 11.137) * 43758.5453;
  return n - floor(n);
}

function createBoxes(x, y, z, size, depth, targetDepth) {
  if (depth === 0) {
    fractalBoxes.push({ x, y, z, size });
    return;
  }
  const nextSize = size / 3;
  const level = targetDepth - depth;
  const extraLevel = max(0, level - 3);
  const keepRate = extraLevel === 0 ? 1 : pow(0.7, extraLevel);
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      for (let k = -1; k <= 1; k++) {
        let centerCount = 0;
        if (i === 0) centerCount++;
        if (j === 0) centerCount++;
        if (k === 0) centerCount++;
        if (centerCount < 2) {
          const nx = x + i * nextSize;
          const ny = y + j * nextSize;
          const nz = z + k * nextSize;
          if (keepRate >= 1 || branchNoise(nx, ny, nz, level) <= keepRate) {
            createBoxes(nx, ny, nz, nextSize, depth - 1, targetDepth);
          }
        }
      }
    }
  }
}

export function drawFractal() {
  if (!fractalPG) initFractal();

  if (currentDepth !== fractalSettings.depth || abs(currentGap - fractalSettings.gap) > 0.0001) {
    generateFractalStructure();
  }

  const motionScale = reducedMotion ? 0.5 : 1;

  fractalPG.background(228, 58, 9);
  fractalPG.push();

  const locX = mouseX - width * 0.5;
  const locY = mouseY - height * 0.5;
  fractalPG.pointLight(0, 0, 100, locX, locY, min(width, height) * 0.35);
  fractalPG.ambientLight(fractalSettings.baseHue, 55, 38);
  fractalPG.directionalLight(0, 0, 92, 1, 1, -1);

  fractalPG.rotateX(frameCount * fractalSettings.rotXSpeed * motionScale);
  fractalPG.rotateY(frameCount * fractalSettings.rotYSpeed * motionScale);
  fractalPG.rotateZ(frameCount * 0.004 * motionScale);

  fractalPG.specularMaterial(255);
  fractalPG.shininess(42);
  fractalPG.noStroke();

  const measuredFps = frameRate();
  let maxRenderBoxes = reducedMotion ? 12000 : 22000;
  if (measuredFps < 42) maxRenderBoxes = floor(maxRenderBoxes * 0.72);
  if (measuredFps > 57) maxRenderBoxes = floor(maxRenderBoxes * 1.12);
  const renderStep = max(1, ceil(fractalBoxes.length / maxRenderBoxes));

  for (let i = 0; i < fractalBoxes.length; i += renderStep) {
    const boxData = fractalBoxes[i];
    fractalPG.push();
    fractalPG.translate(
      boxData.x * fractalSettings.gap,
      boxData.y * fractalSettings.gap,
      boxData.z * fractalSettings.gap
    );
    fractalPG.box(boxData.size);
    fractalPG.pop();
  }

  fractalPG.pop();
  image(fractalPG, 0, 0, width, height);
}
