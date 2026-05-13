import { motionFactor } from '../js/state.js';

// MORPHOGENESIS
// Reaction-diffusion surface rendered via a GLSL ray-marcher.
// Move cursor to rotate. Click or press P to cycle colour palette.

const MORPHO_PALETTES = [
  { bg: [2, 5, 12],   colors: [[0, 255, 180],   [0, 100, 255],   [200, 255, 255]] },
  { bg: [8, 2, 5],    colors: [[255, 50, 100],   [255, 150, 50],  [255, 200, 200]] },
  { bg: [10, 8, 12],  colors: [[255, 100, 200],  [255, 200, 50],  [100, 50, 255]] },
  { bg: [5, 5, 5],    colors: [[100, 150, 255],  [200, 200, 255], [255, 255, 255]] },
  { bg: [5, 5, 5],    colors: [[167, 122, 75],   [236, 198, 162], [164, 48, 32]] },
  { bg: [5, 5, 5],    colors: [[74, 113, 105],   [190, 181, 156], [115, 82, 49]] },
  { bg: [5, 5, 5],    colors: [[86, 141, 75],    [213, 187, 86],  [210, 106, 27]] },
  { bg: [5, 5, 5],    colors: [[182, 102, 54],   [84, 122, 86],   [189, 174, 91]] },
  { bg: [5, 5, 5],    colors: [[45, 68, 114],    [110, 99, 82],   [217, 204, 172]] }
];

function morphoNormalizeColor(rgbArr) {
  return [rgbArr[0] / 255, rgbArr[1] / 255, rgbArr[2] / 255];
}

const MORPHO_VERTEX_SHADER = `
precision highp float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vUv;

void main() {
  vUv = aTexCoord;
  gl_Position = vec4(aPosition, 1.0);
}
`;

const MORPHO_FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_bg;
uniform vec2 u_rotation;

#define MAX_STEPS 150
#define MAX_DIST 25.0
#define SURF_DIST 0.005

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

float getDistance(vec3 p) {
  float bound = length(p) - 3.8;
  if (bound > 1.0) return bound;

  p.yz *= rot(u_rotation.x);
  p.xz *= rot(u_rotation.y);

  vec3 q = p;
  float d = length(q * vec3(1.0, 1.2, 1.0)) - 2.0;

  float freq = 2.0;
  float amp = 0.6;

  for (int i = 0; i < 4; i++) {
    q.xy *= rot(1.23);
    q.yz *= rot(1.67);
    q.zx *= rot(0.89);

    float buckling = abs(sin(q.x * freq + sin(q.y * freq) + u_time * 0.3)) - 0.5;
    d += amp * buckling;

    amp *= 0.45;
    freq *= 2.0;
  }

  return max(d * 0.3, bound);
}

vec3 getNormal(vec3 p) {
  float d = getDistance(p);
  vec2 e = vec2(0.002, 0.0);
  vec3 n = d - vec3(
    getDistance(p - e.xyy),
    getDistance(p - e.yxy),
    getDistance(p - e.yyx)
  );
  return normalize(n);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  vec3 ro = vec3(0.0, 0.0, -6.0);
  vec3 rd = normalize(vec3(uv.x, uv.y, 1.0));

  float dO = 0.0;
  vec3 p;
  for (int i = 0; i < MAX_STEPS; i++) {
    p = ro + rd * dO;
    float dS = getDistance(p);
    dO += dS;
    if (dO > MAX_DIST || abs(dS) < SURF_DIST) break;
  }

  vec3 col = u_bg;

  if (dO < MAX_DIST) {
    vec3 n = getNormal(p);
    vec3 lightDir = normalize(vec3(1.0, 2.0, -1.0));

    float distFromCore = length(p);
    float mix1 = smoothstep(1.5, 3.0, distFromCore);
    float mix2 = smoothstep(-1.0, 1.0, n.y);

    vec3 baseColor = mix(u_color1, u_color2, mix1);
    baseColor = mix(baseColor, u_color3, mix2 * 0.5);

    float dif = max(dot(n, lightDir), 0.0) * 0.8 + 0.2;
    float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    float sss = smoothstep(0.0, 0.25, getDistance(p + lightDir * 0.4)) * 0.9;

    col = baseColor * dif
      + (u_color1 * fresnel * 1.2)
      + (u_color2 * sss);
  } else {
    col -= length(uv) * 0.2;
  }

  gl_FragColor = vec4(pow(col, vec3(0.4545)), 1.0);
}
`;

let morphoPG = null;
let morphoShader = null;
let morphoActivePalette = MORPHO_PALETTES[0];

function initMorphogenesis() {
  morphoPG = createGraphics(windowWidth, windowHeight, WEBGL);
  morphoShader = morphoPG.createShader(MORPHO_VERTEX_SHADER, MORPHO_FRAGMENT_SHADER);
  morphoActivePalette = MORPHO_PALETTES[Math.floor(Math.random() * MORPHO_PALETTES.length)];
}

function drawMorphogenesis() {
  if (!morphoPG) initMorphogenesis();

  const safeMotionFactor = Number.isFinite(motionFactor) ? motionFactor : 1;
  const t = millis() * 0.001 * safeMotionFactor;
  const pd = pixelDensity();
  const mx = width > 0 ? (mouseX / width) * 2 - 1 : 0;
  const my = height > 0 ? (mouseY / height) * 2 - 1 : 0;
  const rotX = my * Math.PI + t * 0.1;
  const rotY = mx * Math.PI + t * 0.05;

  morphoPG.shader(morphoShader);
  morphoShader.setUniform('u_time', t);
  morphoShader.setUniform('u_resolution', [morphoPG.width * pd, morphoPG.height * pd]);
  morphoShader.setUniform('u_rotation', [rotX, rotY]);
  morphoShader.setUniform('u_bg', morphoNormalizeColor(morphoActivePalette.bg));
  morphoShader.setUniform('u_color1', morphoNormalizeColor(morphoActivePalette.colors[0]));
  morphoShader.setUniform('u_color2', morphoNormalizeColor(morphoActivePalette.colors[1]));
  morphoShader.setUniform('u_color3', morphoNormalizeColor(morphoActivePalette.colors[2]));

  morphoPG.quad(-1, -1, 1, -1, 1, 1, -1, 1);
  image(morphoPG, 0, 0, width, height);
}

function cycleMorphoPalette() {
  morphoActivePalette = MORPHO_PALETTES[Math.floor(Math.random() * MORPHO_PALETTES.length)];
}

export { initMorphogenesis, drawMorphogenesis, cycleMorphoPalette };
