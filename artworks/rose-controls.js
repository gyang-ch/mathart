import { initScrubbers, updateScrubberDisplay } from '../js/scrubbers.js';
import { setRosePalette, getRosePalette } from './rose.js';

export function buildControls() {
  const panel = document.createElement('aside');
  panel.id = 'rose-controls';
  panel.setAttribute('aria-label', 'Rose controls');
  panel.innerHTML = `
    <h3>Controls</h3>
    <div class="resonator-control-stack">
      <div class="res-scrubber" data-min="0" data-max="360" data-step="1">
        <div class="res-scrubber-fill"></div>
        <span class="res-scrubber-label">Inner Hue</span>
        <span class="res-scrubber-value">196</span>
        <input id="rose-cool-hue" class="res-scrubber-input" type="number" min="0" max="360" step="1" value="196" />
      </div>
      <div class="res-scrubber" data-min="0" data-max="360" data-step="1">
        <div class="res-scrubber-fill"></div>
        <span class="res-scrubber-label">Outer Hue</span>
        <span class="res-scrubber-value">338</span>
        <input id="rose-warm-hue" class="res-scrubber-input" type="number" min="0" max="360" step="1" value="338" />
      </div>
    </div>
  `;

  initScrubbers(panel);
  _wireControls(panel);
  return panel;
}

function _wireControls(panel) {
  const coolInput = panel.querySelector('#rose-cool-hue');
  const warmInput = panel.querySelector('#rose-warm-hue');

  const initial = getRosePalette();
  coolInput.value = String(Math.round(initial.coolHue ?? 196));
  warmInput.value = String(Math.round(initial.warmHue ?? 338));
  [coolInput, warmInput].forEach(input => {
    const scrubber = input.closest('.res-scrubber');
    if (scrubber) updateScrubberDisplay(scrubber);
  });

  function applyPalette() {
    setRosePalette({ coolHue: Number(coolInput.value), warmHue: Number(warmInput.value) });
    [coolInput, warmInput].forEach(input => {
      const scrubber = input.closest('.res-scrubber');
      if (scrubber) updateScrubberDisplay(scrubber);
    });
  }

  coolInput.addEventListener('input', applyPalette);
  warmInput.addEventListener('input', applyPalette);
  applyPalette();
}
