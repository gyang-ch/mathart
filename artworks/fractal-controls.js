import { initScrubbers, updateScrubberDisplay } from '../js/scrubbers.js';
import { setFractalSettings } from './fractal.js';

export function buildControls() {
  const panel = document.createElement('aside');
  panel.id = 'fractal-controls';
  panel.setAttribute('aria-label', 'Fractal controls');
  panel.innerHTML = `
    <h3>Controls</h3>
    <div class="resonator-control-stack">
      <div class="res-scrubber" data-min="0" data-max="5" data-step="1">
        <div class="res-scrubber-fill"></div>
        <span class="res-scrubber-label">Fractal Depth</span>
        <span class="res-scrubber-value">3</span>
        <input id="fractal-depth" class="res-scrubber-input" type="number" min="0" max="5" step="1" value="3" />
      </div>
      <div class="res-scrubber" data-min="0" data-max="0.05" data-step="0.001">
        <div class="res-scrubber-fill"></div>
        <span class="res-scrubber-label">Rotation X</span>
        <span class="res-scrubber-value">0.010</span>
        <input id="fractal-rot-x" class="res-scrubber-input" type="number" min="0" max="0.05" step="0.001" value="0.01" />
      </div>
      <div class="res-scrubber" data-min="0" data-max="0.05" data-step="0.001">
        <div class="res-scrubber-fill"></div>
        <span class="res-scrubber-label">Rotation Y</span>
        <span class="res-scrubber-value">0.015</span>
        <input id="fractal-rot-y" class="res-scrubber-input" type="number" min="0" max="0.05" step="0.001" value="0.015" />
      </div>
      <div class="res-scrubber" data-min="0" data-max="360" data-step="1">
        <div class="res-scrubber-fill"></div>
        <span class="res-scrubber-label">Base Hue</span>
        <span class="res-scrubber-value">200</span>
        <input id="fractal-hue" class="res-scrubber-input" type="number" min="0" max="360" step="1" value="200" />
      </div>
      <div class="res-scrubber" data-min="1" data-max="2" data-step="0.05">
        <div class="res-scrubber-fill"></div>
        <span class="res-scrubber-label">Cube Gap</span>
        <span class="res-scrubber-value">1.00</span>
        <input id="fractal-gap" class="res-scrubber-input" type="number" min="1" max="2" step="0.05" value="1" />
      </div>
    </div>
  `;

  initScrubbers(panel);
  _wireControls(panel);
  return panel;
}

function _clamp(v, min, max) { return Math.max(min, Math.min(max, Number(v) || 0)); }

function _wireControls(panel) {
  const depthInput = panel.querySelector('#fractal-depth');
  const rotXInput  = panel.querySelector('#fractal-rot-x');
  const rotYInput  = panel.querySelector('#fractal-rot-y');
  const hueInput   = panel.querySelector('#fractal-hue');
  const gapInput   = panel.querySelector('#fractal-gap');

  const inputs = [depthInput, rotXInput, rotYInput, hueInput, gapInput];

  function applySettings() {
    setFractalSettings({
      depth:     Math.floor(_clamp(depthInput.value, 0, 7)),
      rotXSpeed: _clamp(rotXInput.value, 0, 0.05),
      rotYSpeed: _clamp(rotYInput.value, 0, 0.05),
      baseHue:   _clamp(hueInput.value, 0, 360),
      gap:       _clamp(gapInput.value, 1, 2)
    });
    inputs.forEach(input => {
      if (!input) return;
      const scrubber = input.closest('.res-scrubber');
      if (scrubber) updateScrubberDisplay(scrubber);
    });
  }

  inputs.forEach(input => { if (input) input.addEventListener('input', applySettings); });
  applySettings();
}
