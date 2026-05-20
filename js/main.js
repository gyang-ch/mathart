import { initResonator, drawResonator, invertResonatorRotation } from '../artworks/resonator.js';
import { initMorphogenesis, drawMorphogenesis, cycleMorphoPalette } from '../artworks/morphogenesis.js';
import { initFractal, drawFractal } from '../artworks/fractal.js';
import { drawMaurerRose } from '../artworks/rose.js';
import { initDupin, drawDupin } from '../artworks/dupin.js';

import { setReducedMotion, prefersReducedMotion, reducedMotionQuery } from './state.js';
import { initScrollEngine } from './scroll-engine.js';
import { initNav, setActiveNav, setReachedDots, getNavProgressFromScroll, refreshNavAnimation } from './nav-controller.js';
import { updateCaption } from './caption-fx.js';

import { buildControls as buildResonatorControls, onSectionChange as resonatorOnSectionChange } from '../artworks/resonator-controls.js';
import { buildControls as buildMorphogenesisControls } from '../artworks/morphogenesis-controls.js';
import { buildControls as buildFractalControls } from '../artworks/fractal-controls.js';
import { buildControls as buildRoseControls } from '../artworks/rose-controls.js';
import { buildControls as buildDupinControls } from '../artworks/dupin-controls.js';

let mode = 0;
let activeMode = 0;
let transitionPulse = 0;
const _transitionProxy = { value: 0 };

const MOTION = {
  fast: prefersReducedMotion() ? 0.12 : 0.3,
  medium: prefersReducedMotion() ? 0.2 : 0.65,
  slow: prefersReducedMotion() ? 0.25 : 1.05,
  easeOut: "power2.out",
  easeInOut: "power2.inOut"
};

function changeMode(newMode) {
  mode = newMode;
  if (mode === 0) {
    background(8);
    updateCaption("", "");
  } else if (mode === 1) {
    initResonator();
    updateCaption("1. Resonator.", "Resonator: Dynamic 3D Oscilloscope-Inspired Art");
  } else if (mode === 2) {
    background(8);
    initMorphogenesis();
    updateCaption("2. Morphogenesis.", "<b>Interact:</b> Move mouse to rotate. Click or press P to cycle palette.");
  } else if (mode === 3) {
    background(0);
    initFractal();
    updateCaption("3. Fractal.", "<b>Interact:</b> Use right-side controls for depth, rotation, hue, and gap.");
  } else if (mode === 4) {
    background(10);
    updateCaption("4. Rose.", "<b>Interact:</b> Move mouse X (petals) and Y (angle).");
  } else if (mode === 5) {
    initDupin();
    updateCaption("5. Dupin.", "<b>Interact:</b> Move mouse X to morph shape, Y to tilt.");
  }
}

function runModeTransitionFx() {
  const reduced = prefersReducedMotion();
  const glow = document.getElementById("transition-glow");

  gsap.killTweensOf(_transitionProxy);
  _transitionProxy.value = reduced ? 0.55 : 1;
  transitionPulse = _transitionProxy.value;
  gsap.to(_transitionProxy, {
    value: 0,
    duration: reduced ? 0.2 : 0.55,
    ease: "power2.out",
    onUpdate: () => { transitionPulse = _transitionProxy.value; }
  });

  const tl = gsap.timeline();
  tl.fromTo("#canvas-container",
    reduced
      ? { scale: 1, filter: "none" }
      : { scale: 1.08, filter: "blur(15px) saturate(1.5) contrast(1.1)", skewX: 1 },
    { scale: 1, filter: "none", skewX: 0, duration: MOTION.slow, ease: "expo.out" }
  );
  if (glow) {
    tl.fromTo(glow, { opacity: 0.8, scale: 1.2 }, { opacity: 0, scale: 1, duration: MOTION.medium, ease: "power2.out" }, 0);
  }
}

function handleSectionActivate(sectionEl, _options, controlPanels) {
  const { resonatorPanel, morphoPanel, fractalPanel, rosePanel, dupinPanel } = controlPanels;
  const id = sectionEl.id;
  const newMode = Number(sectionEl.dataset.mode);

  if (!Number.isNaN(newMode) && newMode !== activeMode) {
    changeMode(newMode);
    activeMode = newMode;
    runModeTransitionFx();
  }

  resonatorPanel?.classList.toggle("visible", id === "s1");
  morphoPanel?.classList.toggle("visible",    id === "s2");
  fractalPanel?.classList.toggle("visible",   id === "s3");
  rosePanel?.classList.toggle("visible",      id === "s4");
  dupinPanel?.classList.toggle("visible",     id === "s5");

  if (id === "s1") resonatorOnSectionChange();

  setActiveNav(id);
}

function handleIntroActivate(controlPanels) {
  const { resonatorPanel, morphoPanel, fractalPanel, rosePanel, dupinPanel } = controlPanels;
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById("intro")?.classList.add("active");
  updateCaption("", "");
  setActiveNav("");
  resonatorPanel?.classList.remove("visible");
  morphoPanel?.classList.remove("visible");
  fractalPanel?.classList.remove("visible");
  rosePanel?.classList.remove("visible");
  dupinPanel?.classList.remove("visible");
  if (activeMode !== 0) {
    changeMode(0);
    activeMode = 0;
    runModeTransitionFx();
  }
}

// ── p5.js lifecycle ──────────────────────────────────────────────────────────

window.setup = function () {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent("canvas-container");

  const resonatorPanel = buildResonatorControls();
  const morphoPanel    = buildMorphogenesisControls();
  const fractalPanel   = buildFractalControls();
  const rosePanel      = buildRoseControls();
  const dupinPanel     = buildDupinControls();
  document.body.append(resonatorPanel, morphoPanel, fractalPanel, rosePanel, dupinPanel);

  const controlPanels = { resonatorPanel, morphoPanel, fractalPanel, rosePanel, dupinPanel };
  const sections    = gsap.utils.toArray("section");
  const artSections = gsap.utils.toArray("section[data-mode]");
  const introSection = document.getElementById("intro");
  const introTitle   = document.getElementById("intro-title");

  const { scrollToSectionIndex, activateSection } = initScrollEngine({
    sections,
    artSections,
    introSection,
    prefersReducedMotion,
    MOTION,
    onSectionActivate: (sectionEl, opts) => handleSectionActivate(sectionEl, opts, controlPanels),
    onIntroActivate:   () => handleIntroActivate(controlPanels),
    onScrollProgress:  (scrollY) => {
      const percent = getNavProgressFromScroll(scrollY);
      setReachedDots(percent);
    }
  });

  initNav({
    sections,
    introTitle,
    navContainer: document.getElementById("progress-nav"),
    prefersReducedMotion,
    scrollToFn: scrollToSectionIndex,
    activateFn: activateSection
  });

  setActiveNav("");
  setReachedDots(0);
  setReducedMotion(prefersReducedMotion());
  changeMode(0);
  runModeTransitionFx();
};

window.draw = function () {
  if      (mode === 0) background(8);
  else if (mode === 1) drawResonator();
  else if (mode === 2) drawMorphogenesis();
  else if (mode === 3) drawFractal();
  else if (mode === 4) drawMaurerRose();
  else if (mode === 5) drawDupin();
  _drawTransitionOverlay();
};

function _drawTransitionOverlay() {
  if (transitionPulse <= 0.001) return;
  push();
  resetMatrix();
  const ctx = drawingContext;
  const cx = width * 0.5 + (mouseX - width * 0.5) * 0.15;
  const cy = height * 0.5 + (mouseY - height * 0.5) * 0.15;
  const maxRadius = Math.max(width, height) * 0.7;
  const glow = ctx.createRadialGradient(cx, cy, maxRadius * 0.08, cx, cy, maxRadius);
  glow.addColorStop(0,    `rgba(255, 255, 255, ${0.16 * transitionPulse})`);
  glow.addColorStop(0.45, `rgba(0, 220, 255, ${0.1 * transitionPulse})`);
  glow.addColorStop(1,    "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  pop();
}

window.windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
  if (mode === 1) initResonator();
  if (mode === 2) initMorphogenesis();
  if (mode === 3) initFractal();
  if (mode === 5) initDupin();
};

window.mousePressed = function (event) {
  if (event?.target?.closest("#resonator-controls, #morphogenesis-controls, #fractal-controls, #rose-controls, #dupin-controls, .regenerate-btn")) return;
  if (mode === 1) invertResonatorRotation();
  else if (mode === 2) cycleMorphoPalette();
};

window.keyPressed = function () {
  if ((key === 's' || key === 'S') && mode === 1) {
    document.getElementById('save-resonator-screenshot')?.click();
  }
  if ((key === 'p' || key === 'P') && mode === 2) cycleMorphoPalette();
  return true;
};

window.keyReleased = function () { return true; };

// ── Reduced-motion live updates ──────────────────────────────────────────────
reducedMotionQuery.addEventListener("change", (event) => {
  setReducedMotion(event.matches);
  refreshNavAnimation(prefersReducedMotion);
  ScrollTrigger.refresh();
});
