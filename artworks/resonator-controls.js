import { initScrubbers, updateScrubberDisplay } from '../js/scrubbers.js';
import {
  getResonatorConfig,
  setResonatorConfig,
  resetResonatorConfig,
  selectResonatorCurve,
  invertResonatorRotation
} from './resonator.js';

let panel = null;
let configInputs = [];
let curveRadios = [];
let curveSections = [];

export function buildControls() {
  panel = document.createElement('aside');
  panel.id = 'resonator-controls';
  panel.setAttribute('aria-label', 'Resonator controls');
  panel.innerHTML = `
    <h3>Resonator Control Surface</h3>
    <div class="resonator-curve-selector" role="radiogroup" aria-label="Curve mode">
      <label class="resonator-curve-option">
        <input type="radio" name="resonator-curve" value="0" checked />
        <span class="resonator-curve-dot"></span>
        <span class="resonator-curve-option-label">Harmonic Phase</span>
      </label>
      <label class="resonator-curve-option">
        <input type="radio" name="resonator-curve" value="1" />
        <span class="resonator-curve-dot"></span>
        <span class="resonator-curve-option-label">Hypotrochoidal Evolution</span>
      </label>
      <label class="resonator-curve-option">
        <input type="radio" name="resonator-curve" value="2" />
        <span class="resonator-curve-dot"></span>
        <span class="resonator-curve-option-label">Toroidal Knot</span>
      </label>
    </div>
    <div class="resonator-button-grid resonator-button-grid--3">
      <div class="btn-glow-wrapper">
        <div class="btn-glow"></div>
        <button id="invert-resonator-rotation" type="button" class="resonator-curve-btn relative-btn">Invert Spin</button>
      </div>
      <div class="btn-glow-wrapper">
        <div class="btn-glow"></div>
        <button id="reset-resonator-controls" type="button" class="resonator-curve-btn relative-btn">Reset</button>
      </div>
      <div class="btn-glow-wrapper">
        <div class="btn-glow"></div>
        <button id="save-resonator-screenshot" type="button" class="resonator-curve-btn relative-btn">Save PNG</button>
      </div>
    </div>

    <div class="resonator-section-toggle">
      <div class="resonator-section-header">Field + Colour</div>
      <div class="resonator-control-stack">
        <div class="res-scrubber" data-min="40" data-max="1200" data-step="10">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">Line count N</span>
          <span class="res-scrubber-value">400</span>
          <input class="res-scrubber-input" data-resonator-key="numLines" type="number" min="40" max="1200" step="10" value="400" />
        </div>
        <div class="res-scrubber" data-min="0" data-max="360" data-step="1">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">Primary hue h&#x2080;</span>
          <span class="res-scrubber-value">118</span>
          <input id="resonator-hue" class="res-scrubber-input" data-resonator-key="primaryHue" type="number" min="0" max="360" step="1" value="118" />
        </div>
        <div class="res-scrubber" data-min="0" data-max="360" data-step="1">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">Hue offset &Delta;h</span>
          <span class="res-scrubber-value">132</span>
          <input class="res-scrubber-input" data-resonator-key="hueOffset" type="number" min="0" max="360" step="1" value="132" />
        </div>
        <div class="res-scrubber" data-min="0" data-max="6" data-step="0.05">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">Rotation speed</span>
          <span class="res-scrubber-value">0.50</span>
          <input class="res-scrubber-input" data-resonator-key="rotationSpeedScale" type="number" min="0" max="6" step="0.05" value="0.5" />
        </div>
        <div class="resonator-grid-2">
          <div class="res-scrubber" data-min="0" data-max="100" data-step="1">
            <div class="res-scrubber-fill"></div>
            <span class="res-scrubber-label">S</span>
            <span class="res-scrubber-value">90</span>
            <input class="res-scrubber-input" data-resonator-key="saturation" type="number" min="0" max="100" step="1" value="90" />
          </div>
          <div class="res-scrubber" data-min="0" data-max="100" data-step="1">
            <div class="res-scrubber-fill"></div>
            <span class="res-scrubber-label">B</span>
            <span class="res-scrubber-value">100</span>
            <input class="res-scrubber-input" data-resonator-key="brightness" type="number" min="0" max="100" step="1" value="100" />
          </div>
        </div>
      </div>
    </div>

    <div class="resonator-section-toggle" data-curve-section="0">
      <div class="resonator-section-header">Harmonic Phase</div>
      <div class="resonator-formula-card">
        <div class="resonator-formula">\\[ \\theta_i = 2\\pi f\\, u_i + t, \\quad \\phi_i = 2\\pi u_i + \\tfrac{t}{2} \\]</div>
        <div class="resonator-formula">\\[ \\begin{aligned}
          x_1 &= R\\sin(\\theta_i)\\cos(m_\\phi\\,\\phi_i) \\\\
          y_1 &= R\\cos(m_\\theta\\,\\theta_i)\\sin(\\phi_i) \\\\
          z_1 &= R\\sin(\\phi_i + \\theta_i)
        \\end{aligned} \\]</div>
      </div>
      <div class="resonator-grid-2">
        <div class="res-scrubber" data-min="0.25" data-max="16" data-step="0.05">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">f</span>
          <span class="res-scrubber-value">4.00</span>
          <input class="res-scrubber-input" data-resonator-key="harmonicFreq" type="number" min="0.25" max="16" step="0.05" value="4" />
        </div>
        <div class="res-scrubber" data-min="0.1" data-max="8" data-step="0.05">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">m<sub>&phi;</sub></span>
          <span class="res-scrubber-value">2.00</span>
          <input class="res-scrubber-input" data-resonator-key="harmonicPhiMultiplier" type="number" min="0.1" max="8" step="0.05" value="2" />
        </div>
        <div class="res-scrubber" data-min="0.1" data-max="8" data-step="0.05">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">m<sub>&theta;</sub></span>
          <span class="res-scrubber-value">1.50</span>
          <input class="res-scrubber-input" data-resonator-key="harmonicThetaMultiplier" type="number" min="0.1" max="8" step="0.05" value="1.5" />
        </div>
        <div class="res-scrubber" data-min="0.05" data-max="0.7" data-step="0.01">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">R</span>
          <span class="res-scrubber-value">0.35</span>
          <input class="res-scrubber-input" data-resonator-key="harmonicRadiusScale" type="number" min="0.05" max="0.7" step="0.01" value="0.35" />
        </div>
        <div class="res-scrubber" data-min="0" data-max="0.2" data-step="0.001">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">&Delta;t</span>
          <span class="res-scrubber-value">0.050</span>
          <input class="res-scrubber-input" data-resonator-key="harmonicTimeStep" type="number" min="0" max="0.2" step="0.001" value="0.05" />
        </div>
        <div class="res-scrubber" data-min="0.1" data-max="6" data-step="0.1">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">w</span>
          <span class="res-scrubber-value">1.5</span>
          <input class="res-scrubber-input" data-resonator-key="harmonicStrokeWeight" type="number" min="0.1" max="6" step="0.1" value="1.5" />
        </div>
      </div>
    </div>

    <div class="resonator-section-toggle" data-curve-section="1">
      <div class="resonator-section-header">Hypotrochoidal Evolution</div>
      <div class="resonator-formula-card">
        <div class="resonator-formula">\\[ \\theta_i = 2\\pi\\kappa\\, u_i, \\quad t_1 = \\theta_i + t \\]</div>
        <div class="resonator-formula">\\[ \\begin{aligned}
          x &= (R-r)\\cos(t_1) + d\\cos\\!\\left(\\tfrac{R-r}{r}\\,t_1\\right) \\\\
          y &= (R-r)\\sin(t_1) - d\\sin\\!\\left(\\tfrac{R-r}{r}\\,t_1\\right)
        \\end{aligned} \\]</div>
      </div>
      <div class="resonator-grid-3">
        <div class="res-scrubber" data-min="1" data-max="32" data-step="0.5">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">&kappa;</span>
          <span class="res-scrubber-value">12</span>
          <input class="res-scrubber-input" data-resonator-key="hypoThetaMultiplier" type="number" min="1" max="32" step="0.5" value="12" />
        </div>
        <div class="res-scrubber" data-min="0.1" data-max="3" data-step="0.05">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">R&#x2081;</span>
          <span class="res-scrubber-value">1.00</span>
          <input class="res-scrubber-input" data-resonator-key="hypoCurve1RScale" type="number" min="0.1" max="3" step="0.05" value="1" />
        </div>
        <div class="res-scrubber" data-min="0.05" data-max="2" data-step="0.01">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">r&#x2081;</span>
          <span class="res-scrubber-value">0.25</span>
          <input class="res-scrubber-input" data-resonator-key="hypoCurve1rScale" type="number" min="0.05" max="2" step="0.01" value="0.25" />
        </div>
        <div class="res-scrubber" data-min="0" data-max="2" data-step="0.01">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">d&#x2081;</span>
          <span class="res-scrubber-value">0.60</span>
          <input class="res-scrubber-input" data-resonator-key="hypoCurve1dScale" type="number" min="0" max="2" step="0.01" value="0.6" />
        </div>
        <div class="res-scrubber" data-min="0.1" data-max="3" data-step="0.05">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">R&#x2082;</span>
          <span class="res-scrubber-value">1.40</span>
          <input class="res-scrubber-input" data-resonator-key="hypoCurve2RScale" type="number" min="0.1" max="3" step="0.05" value="1.4" />
        </div>
        <div class="res-scrubber" data-min="0.05" data-max="2" data-step="0.01">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">r&#x2082;</span>
          <span class="res-scrubber-value">0.40</span>
          <input class="res-scrubber-input" data-resonator-key="hypoCurve2rScale" type="number" min="0.05" max="2" step="0.01" value="0.4" />
        </div>
        <div class="res-scrubber" data-min="0" data-max="2" data-step="0.01">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">d&#x2082;</span>
          <span class="res-scrubber-value">0.90</span>
          <input class="res-scrubber-input" data-resonator-key="hypoCurve2dScale" type="number" min="0" max="2" step="0.01" value="0.9" />
        </div>
        <div class="res-scrubber" data-min="0" data-max="0.2" data-step="0.001">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">&Delta;t</span>
          <span class="res-scrubber-value">0.020</span>
          <input class="res-scrubber-input" data-resonator-key="hypoTimeStep" type="number" min="0" max="0.2" step="0.001" value="0.02" />
        </div>
        <div class="res-scrubber" data-min="0.05" data-max="0.6" data-step="0.01">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">size</span>
          <span class="res-scrubber-value">0.22</span>
          <input class="res-scrubber-input" data-resonator-key="hypotrochoidRadiusScale" type="number" min="0.05" max="0.6" step="0.01" value="0.22" />
        </div>
      </div>
    </div>

    <div class="resonator-section-toggle" data-curve-section="2">
      <div class="resonator-section-header">Toroidal Knot</div>
      <div class="resonator-formula-card">
        <div class="resonator-formula">\\[ \\psi_i = 2\\pi s_i, \\quad u_1 = m_1\\psi_i + t, \\quad v_1 = n_1\\psi_i - \\alpha t \\]</div>
        <div class="resonator-formula">\\[ \\begin{aligned}
          x_1 &= (R + r\\cos v_1)\\cos u_1 \\\\
          y_1 &= (R + r\\cos v_1)\\sin u_1 \\\\
          z_1 &= r\\sin v_1
        \\end{aligned} \\]</div>
      </div>
      <div class="resonator-grid-3">
        <div class="res-scrubber" data-min="1" data-max="12" data-step="1">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">m<sub>1</sub></span>
          <span class="res-scrubber-value">3</span>
          <input class="res-scrubber-input" data-resonator-key="toroidalP1" type="number" min="1" max="12" step="1" value="3" />
        </div>
        <div class="res-scrubber" data-min="1" data-max="12" data-step="1">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">n<sub>1</sub></span>
          <span class="res-scrubber-value">2</span>
          <input class="res-scrubber-input" data-resonator-key="toroidalQ1" type="number" min="1" max="12" step="1" value="2" />
        </div>
        <div class="res-scrubber" data-min="1" data-max="12" data-step="1">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">m<sub>2</sub></span>
          <span class="res-scrubber-value">5</span>
          <input class="res-scrubber-input" data-resonator-key="toroidalP2" type="number" min="1" max="12" step="1" value="5" />
        </div>
        <div class="res-scrubber" data-min="1" data-max="12" data-step="1">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">n<sub>2</sub></span>
          <span class="res-scrubber-value">4</span>
          <input class="res-scrubber-input" data-resonator-key="toroidalQ2" type="number" min="1" max="12" step="1" value="4" />
        </div>
        <div class="res-scrubber" data-min="0.05" data-max="0.7" data-step="0.01">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">R</span>
          <span class="res-scrubber-value">0.25</span>
          <input class="res-scrubber-input" data-resonator-key="toroidalMajorRadiusScale" type="number" min="0.05" max="0.7" step="0.01" value="0.25" />
        </div>
        <div class="res-scrubber" data-min="0.02" data-max="0.4" data-step="0.01">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">r</span>
          <span class="res-scrubber-value">0.12</span>
          <input class="res-scrubber-input" data-resonator-key="toroidalMinorRadiusScale" type="number" min="0.02" max="0.4" step="0.01" value="0.12" />
        </div>
        <div class="res-scrubber" data-min="0.1" data-max="3" data-step="0.05">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">R&#x2082;/R</span>
          <span class="res-scrubber-value">1.30</span>
          <input class="res-scrubber-input" data-resonator-key="toroidalMajor2Scale" type="number" min="0.1" max="3" step="0.05" value="1.3" />
        </div>
        <div class="res-scrubber" data-min="0.1" data-max="3" data-step="0.05">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">r&#x2082;/r</span>
          <span class="res-scrubber-value">0.80</span>
          <input class="res-scrubber-input" data-resonator-key="toroidalMinor2Scale" type="number" min="0.1" max="3" step="0.05" value="0.8" />
        </div>
        <div class="res-scrubber" data-min="0" data-max="0.2" data-step="0.001">
          <div class="res-scrubber-fill"></div>
          <span class="res-scrubber-label">&Delta;t</span>
          <span class="res-scrubber-value">0.015</span>
          <input class="res-scrubber-input" data-resonator-key="toroidalTimeStep" type="number" min="0" max="0.2" step="0.001" value="0.015" />
        </div>
      </div>
    </div>
  `;

  initScrubbers(panel);
  _wireControls();
  _renderFormulas();
  return panel;
}

function _renderFormulas() {
  if (!panel || typeof window === "undefined") return;
  const run = () => {
    if (typeof window.renderMathInElement !== "function") return false;
    window.renderMathInElement(panel, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false }
      ],
      throwOnError: false
    });
    return true;
  };
  if (run()) return;
  const start = Date.now();
  const tick = () => {
    if (run()) return;
    if (Date.now() - start > 4000) return;
    setTimeout(tick, 60);
  };
  tick();
}

function _playButtonShine(btn, event) {
  if (!btn || !event) return;
  const rect = btn.getBoundingClientRect();
  const localX = typeof event.clientX === "number" ? event.clientX - rect.left : rect.width / 2;
  const localY = typeof event.clientY === "number" ? event.clientY - rect.top : rect.height / 2;
  const clampedX = gsap.utils.clamp(0, rect.width, localX);
  const clampedY = gsap.utils.clamp(0, rect.height, localY);

  const shine = document.createElement("span");
  shine.className = "resonator-curve-btn-shine";
  shine.style.left = `${clampedX}px`;
  shine.style.top = `${clampedY}px`;
  btn.appendChild(shine);

  const shineBaseSize = parseFloat(getComputedStyle(shine).width) || 26;
  const maxDist = Math.max(
    Math.hypot(clampedX, clampedY),
    Math.hypot(rect.width - clampedX, clampedY),
    Math.hypot(clampedX, rect.height - clampedY),
    Math.hypot(rect.width - clampedX, rect.height - clampedY)
  );
  const fullCoverScale = Math.max(1.2, (maxDist * 2 * 1.1) / shineBaseSize);

  gsap.set(shine, { xPercent: -50, yPercent: -50, scale: 0.08, opacity: 0 });
  gsap.to(shine, {
    scale: fullCoverScale, duration: 0.45, ease: "power2.out",
    keyframes: [
      { opacity: 0.58, duration: 0.08, ease: "power2.out" },
      { opacity: 0, duration: 0.37, ease: "power2.out" }
    ],
    overwrite: "auto",
    onComplete: () => shine.remove()
  });
}

function _showCurveSection(index, animate) {
  if (!panel) return;
  curveSections.forEach((section) => {
    gsap.killTweensOf(section);
    if (Number(section.dataset.curveSection) === index) {
      if (animate) {
        gsap.set(section, { display: "block" });
        const scrubbers = section.querySelectorAll(".res-scrubber");
        gsap.fromTo(section, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" });
        if (scrubbers.length) {
          gsap.fromTo(scrubbers, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.26, ease: "power2.out", stagger: 0.025, delay: 0.06 });
        }
      } else {
        gsap.set(section, { display: "block", opacity: 1, y: 0 });
      }
    } else {
      gsap.set(section, { display: "none", opacity: 0 });
    }
  });
}

function _syncCurveSelection() {
  const config = getResonatorConfig();
  const currentMode = config.curveMode ?? 0;
  curveRadios.forEach((radio) => { radio.checked = Number(radio.value) === currentMode; });
}

function _syncConfigControls() {
  const config = getResonatorConfig();
  if (!config) return;
  configInputs.forEach((input) => {
    const key = input.dataset.resonatorKey;
    if (!key || !(key in config)) return;
    const nextValue = String(config[key]);
    if (document.activeElement === input) return;
    if (input.value !== nextValue) {
      input.value = nextValue;
      const scrubber = input.closest(".res-scrubber");
      if (scrubber) updateScrubberDisplay(scrubber);
    }
  });
}

function _applyConfigValue(input) {
  const key = input.dataset.resonatorKey;
  if (!key) return;
  const nextValue = Number(input.value);
  if (!Number.isFinite(nextValue)) return;
  const config = setResonatorConfig({ [key]: nextValue });
  if (!config) return;
  configInputs.forEach((peer) => {
    if (peer.dataset.resonatorKey !== key || peer === input || !(key in config)) return;
    peer.value = String(config[key]);
  });
}

function _wireControls() {
  if (!panel) return;

  curveRadios = Array.from(panel.querySelectorAll('input[name="resonator-curve"]'));
  curveSections = Array.from(panel.querySelectorAll('[data-curve-section]'));
  configInputs = Array.from(panel.querySelectorAll('[data-resonator-key]'));

  const initialMode = getResonatorConfig().curveMode ?? 0;
  _showCurveSection(initialMode, false);

  curveRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      const modeIndex = Number(radio.value);
      selectResonatorCurve(modeIndex);
      _showCurveSection(modeIndex, true);
    });
  });

  configInputs.forEach((input) => {
    input.addEventListener("input", () => _applyConfigValue(input));
    input.addEventListener("change", () => { _applyConfigValue(input); _syncConfigControls(); });
  });

  const invertBtn = panel.querySelector('#invert-resonator-rotation');
  const resetBtn = panel.querySelector('#reset-resonator-controls');
  const saveBtn = panel.querySelector('#save-resonator-screenshot');

  invertBtn?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    _playButtonShine(invertBtn, e);
    invertResonatorRotation();
  });

  resetBtn?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    _playButtonShine(resetBtn, e);
    resetResonatorConfig();
    _syncCurveSelection();
    _syncConfigControls();
  });

  saveBtn?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    _playButtonShine(saveBtn, e);
    saveCanvas('resonator-moment', 'png');
  });
}

export function onSectionChange() {
  _syncCurveSelection();
  _syncConfigControls();
}
