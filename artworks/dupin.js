import { motionFactor } from '../js/state.js';

// DUPIN CYCLIDE
let dupinPG = null;
let dupinTime = 0;
let dupinPrimaryHue = 280;

function initDupin() {
  dupinPG = createGraphics(windowWidth, windowHeight, WEBGL);
  dupinPG.colorMode(HSB, 360, 100, 100, 100);
  dupinPG.smooth();
  dupinTime = 0;
}

function drawDupin() {
  if (!dupinPG) initDupin();

  const safeMotionFactor = Number.isFinite(motionFactor) ? motionFactor : 1;

  dupinPG.background(0);
  dupinPG.resetMatrix();

  // Gentle continuous rotation on Y and Z for life, but Y-axis tilt (X rotation) is mouse-controlled
  dupinTime += 0.008 * safeMotionFactor;
  
  // Obvious interaction: Mouse Y controls the vertical tilt
  const tiltX = map(mouseY, 0, height, -PI, PI, true);
  
  dupinPG.rotateX(tiltX);
  dupinPG.rotateY(dupinTime * 0.8);
  dupinPG.rotateZ(dupinTime * 0.4);

  dupinPG.blendMode(ADD);
  dupinPG.noFill();

  // Dupin cyclide parameters
  const a = min(width, height) * 0.25;
  const b = a * 0.85;
  const c = Math.sqrt(a * a - b * b);
  
  // Obvious interaction: Mouse X directly controls the radius offset 'd'
  // Moving left-to-right smoothly morphs the shape between Spindle -> Horn -> Ring cyclide
  const d = map(mouseX, 0, width, a * 0.1, a * 1.6, true); 

  const numU = 80;
  const numV = 120; // higher density for smooth lines

  // Draw lines wrapping around the cyclide, inspired by the Resonator artwork
  for (let i = 0; i < numU; i++) {
    const u = map(i, 0, numU, 0, TWO_PI) + dupinTime * 0.2; // slight shift over time
    for (let j = 0; j < numV; j++) {
      const v = map(j, 0, numV, 0, TWO_PI) + dupinTime; // animate phase along v

      // First point
      const denom1 = a - c * cos(u) * cos(v);
      const x1 = (d * (c - a * cos(u) * cos(v)) + b * b * cos(u)) / denom1;
      const y1 = (b * sin(u) * (a - d * cos(v))) / denom1;
      const z1 = (b * sin(v) * (c * cos(u) - d)) / denom1;

      // Second point slightly ahead to form a line segment
      const vNext = v + TWO_PI / (numV * 0.5); 
      const denom2 = a - c * cos(u) * cos(vNext);
      const x2 = (d * (c - a * cos(u) * cos(vNext)) + b * b * cos(u)) / denom2;
      const y2 = (b * sin(u) * (a - d * cos(vNext))) / denom2;
      const z2 = (b * sin(vNext) * (c * cos(u) - d)) / denom2;

      // Dynamic hue calculation based on u, v indices and time
      const dynamicHue = (dupinPrimaryHue + i * 1.5 + j * 1.0 + dupinTime * 15) % 360;
      
      // Alpha mapped based on depth for 3D depth perception
      const alpha = map(z1 + z2, -a * 2, a * 2, 10, 85);

      dupinPG.strokeWeight(1.2);
      dupinPG.stroke(dynamicHue, 85, 100, alpha);
      dupinPG.line(x1, y1, z1, x2, y2, z2);
    }
  }

  dupinPG.blendMode(BLEND);
  image(dupinPG, 0, 0, width, height);
}

function setDupinHue(newHue) {
  if (!Number.isFinite(newHue)) return;
  dupinPrimaryHue = ((newHue % 360) + 360) % 360;
}

function getDupinHue() {
  return dupinPrimaryHue;
}

export { initDupin, drawDupin, setDupinHue, getDupinHue };
