import { initScrubbers, updateScrubberDisplay } from '../js/scrubbers.js';
import { setDupinHue, getDupinHue } from './dupin.js';

export function buildControls() {
  const panel = document.createElement('aside');
  panel.id = 'dupin-controls';
  panel.setAttribute('aria-label', 'Dupin controls');
  panel.innerHTML = `
    <h3>Controls</h3>
    <div class="resonator-control-stack">
      <div class="res-scrubber" data-min="0" data-max="360" data-step="1">
        <div class="res-scrubber-fill"></div>
        <span class="res-scrubber-label">Primary Hue</span>
        <span class="res-scrubber-value">280</span>
        <input id="dupin-hue" class="res-scrubber-input" type="number" min="0" max="360" step="1" value="280" />
      </div>
    </div>
  `;

  initScrubbers(panel);
  _wireControls(panel);
  return panel;
}

function _wireControls(panel) {
  const hueInput = panel.querySelector('#dupin-hue');
  hueInput.value = String(Math.round(getDupinHue()));
  const scrubber = hueInput.closest('.res-scrubber');
  if (scrubber) updateScrubberDisplay(scrubber);

  function applyHue() {
    setDupinHue(Number(hueInput.value));
    if (scrubber) updateScrubberDisplay(scrubber);
  }

  hueInput.addEventListener('input', applyHue);
  applyHue();
}
