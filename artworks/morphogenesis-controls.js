import { cycleMorphoPalette } from './morphogenesis.js';

export function buildControls() {
  const panel = document.createElement('aside');
  panel.id = 'morphogenesis-controls';
  panel.setAttribute('aria-label', 'Morphogenesis controls');
  panel.innerHTML = `
    <h3>Controls</h3>
    <div class="resonator-button-grid">
      <div class="btn-glow-wrapper">
        <div class="btn-glow"></div>
        <button id="cycle-morpho-palette" type="button" class="resonator-curve-btn relative-btn">Cycle Palette</button>
      </div>
      <div class="btn-glow-wrapper">
        <div class="btn-glow"></div>
        <button id="save-morpho-screenshot" type="button" class="resonator-curve-btn relative-btn">Save PNG</button>
      </div>
    </div>
  `;

  _wireControls(panel);
  return panel;
}

function _playButtonShine(btn, event) {
  if (!btn || !event) return;
  const rect = btn.getBoundingClientRect();
  const clampedX = gsap.utils.clamp(0, rect.width,  (event.clientX ?? rect.width  / 2) - rect.left);
  const clampedY = gsap.utils.clamp(0, rect.height, (event.clientY ?? rect.height / 2) - rect.top);

  const shine = document.createElement("span");
  shine.className = "resonator-curve-btn-shine";
  shine.style.left = `${clampedX}px`;
  shine.style.top  = `${clampedY}px`;
  btn.appendChild(shine);

  const base = parseFloat(getComputedStyle(shine).width) || 26;
  const maxDist = Math.max(
    Math.hypot(clampedX, clampedY),
    Math.hypot(rect.width - clampedX, clampedY),
    Math.hypot(clampedX, rect.height - clampedY),
    Math.hypot(rect.width - clampedX, rect.height - clampedY)
  );

  gsap.set(shine, { xPercent: -50, yPercent: -50, scale: 0.08, opacity: 0 });
  gsap.to(shine, {
    scale: Math.max(1.2, (maxDist * 2 * 1.1) / base),
    duration: 0.45,
    ease: "power2.out",
    keyframes: [
      { opacity: 0.58, duration: 0.08, ease: "power2.out" },
      { opacity: 0,    duration: 0.37, ease: "power2.out" }
    ],
    overwrite: "auto",
    onComplete: () => shine.remove()
  });
}

function _wireControls(panel) {
  const cycleBtn = panel.querySelector('#cycle-morpho-palette');
  const saveBtn  = panel.querySelector('#save-morpho-screenshot');

  cycleBtn?.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    _playButtonShine(cycleBtn, e);
    cycleMorphoPalette();
  });

  saveBtn?.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    _playButtonShine(saveBtn, e);
    saveCanvas('morphogenesis-moment', 'png');
  });
}
