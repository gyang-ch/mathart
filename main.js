// Global runtime variables shared across all artwork modes.
let mode = 0;

let scrollPos = 0;
let transitionPulse = 0;
let reducedMotion = false;
let motionFactor = 1;

// Values pushed in by the scroll/controller layer.
window.setScrollProgress = function(p) {
  scrollPos = p;
};

window.setTransitionPulse = function(v) {
  transitionPulse = constrain(v, 0, 1);
};

window.setReducedMotion = function(v) {
  reducedMotion = !!v;
  motionFactor = reducedMotion ? 0.45 : 1;
};

// p5js setup(): create the canvas and expose mode switching.
function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent("canvas-container");
  changeMode(0);
  window.changeMode = changeMode;
}

// Rebuild active artwork when viewport changes size.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  if (mode === 1) initResonator();
  if (mode === 2) initMorphogenesis();
  if (mode === 3) initFractal();
  if (mode === 5) initDupin();
  if (mode === 6) initResonatorNew();
}

// p5 draw(): render exactly one active artwork each frame.
function draw() {
  if (mode === 0) {
    background(8);
  } else if (mode === 1) {
    drawResonator();
  } else if (mode === 2) {
    drawMorphogenesis();
  } else if (mode === 3) {
    drawFractal();
  } else if (mode === 4) {
    drawMaurerRose();
  } else if (mode === 5) {
    drawDupin();
  } else if (mode === 6) {
    drawResonatorNew();
  }

  drawTransitionOverlay();
}

// Post-processing glow used during mode transitions.
function drawTransitionOverlay() {
  if (transitionPulse <= 0.001) return;

  push();
  resetMatrix();

  const ctx = drawingContext;
  const cx = width * 0.5 + (mouseX - width * 0.5) * 0.15;
  const cy = height * 0.5 + (mouseY - height * 0.5) * 0.15;
  const maxRadius = max(width, height) * 0.7;

  const glow = ctx.createRadialGradient(cx, cy, maxRadius * 0.08, cx, cy, maxRadius);
  glow.addColorStop(0, `rgba(255, 255, 255, ${0.16 * transitionPulse})`);
  glow.addColorStop(0.45, `rgba(0, 220, 255, ${0.1 * transitionPulse})`);
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  pop();
}

// Central mode router: initialises artwork + updates caption text.
function changeMode(newMode) {
  mode = newMode;

  const event = new CustomEvent("modeChanged", { detail: { mode: newMode } });
  window.dispatchEvent(event);

  if (mode === 0) {
    background(8);
    setCaption("", "");
  } else if (mode === 1) {
    initResonator();
    setCaption(
      "1. Resonator.",
      "<b>Interact:</b> Mouse distance controls amplitude; click inverts rotation."
    );
  } else if (mode === 2) {
    background(8);
    initMorphogenesis();
    setCaption(
      "2. Morphogenesis.",
      "<b>Interact:</b> Move mouse to rotate. Click or press P to cycle palette."
    );
  } else if (mode === 3) {
    background(0);
    initFractal();
    setCaption(
      "3. Fractal.",
      "<b>Interact:</b> Use right-side controls for depth, rotation, hue, and gap."
    );
  } else if (mode === 4) {
    background(10);
    setCaption("4. Rose.", "<b>Interact:</b> Move mouse X (petals) and Y (angle).");
  } else if (mode === 5) {
    initDupin();
    setCaption("5. Dupin.", "<b>Interact:</b> Move mouse X to morph shape, Y to tilt.");
  } else if (mode === 6) {
    initResonatorNew();
    setCaption(
      "6. Resonator New.",
      "<b>Interact:</b> Mouse distance modulates amplitude; click inverts rotation, use controls to shift curve and palette."
    );
  }
}

// Updates the top-right card, or delegates to animated caption handler.
function setCaption(title, desc) {
  if (window.updateCaptionFx) {
    window.updateCaptionFx(title, desc);
    return;
  }

  const panelEl = document.getElementById("info-panel");
  const captionEl = document.getElementById("caption");
  const hasCaption = Boolean(title && title.trim()) || Boolean(desc && desc.trim());

  if (panelEl) {
    panelEl.style.display = hasCaption ? "block" : "none";
  }

  if (captionEl) {
    if (!hasCaption) {
      captionEl.innerHTML = "";
      return;
    }
    captionEl.innerHTML = `<span class='highlight'>${title}</span> <br>${desc}`;
  }
}

// Shared click interactions for artworks that react to clicks.
function mousePressed(event) {
  if (event && event.target && event.target.closest("#rose-controls, #fractal-controls, #resonator-controls, #resonator-new-controls, .regenerate-btn")) {
    return;
  } else if (mode === 1) {
    invertResonatorRotation();
  } else if (mode === 2) {
    cycleMorphoPalette();
  } else if (mode === 6) {
    invertResonatorNewRotation();
  }
}

// Keep p5 keyboard hook available
function keyPressed() {
  if (key === 's' || key === 'S') {
    if (mode === 1) {
      const btn = document.getElementById('save-resonator-screenshot');
      if (btn) btn.click();
    } else if (mode === 6) {
      const btn = document.getElementById('save-resonator-new-screenshot');
      if (btn) btn.click();
    }
  }
  if (key === 'p' || key === 'P') {
    if (mode === 2) cycleMorphoPalette();
    if (mode === 6) cycleResonatorNewPalette();
  }
  return true;
}

function keyReleased() {
  return true;
}
