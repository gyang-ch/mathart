if (window.ScrollToPlugin) {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
} else {
  gsap.registerPlugin(ScrollTrigger);
}

const sections = gsap.utils.toArray("section");
const artSections = gsap.utils.toArray("section[data-mode]");
const navContainer = document.getElementById("progress-nav");
const navIndicator = navContainer ? navContainer.querySelector(".nav-indicator") : null;
const glow = document.getElementById("transition-glow");
const roseControls = document.getElementById("rose-controls");
const dupinControls = document.getElementById("dupin-controls");
const fractalControls = document.getElementById("fractal-controls");
const resonatorControls = document.getElementById("resonator-controls");
const resonatorNewControls = document.getElementById("resonator-new-controls");
const invertResonatorRotationBtn = document.getElementById("invert-resonator-rotation");
const resetResonatorControlsBtn = document.getElementById("reset-resonator-controls");
const saveResonatorScreenshotBtn = document.getElementById("save-resonator-screenshot");
const resonatorCurveRadios = resonatorControls
  ? Array.from(resonatorControls.querySelectorAll('input[name="resonator-curve"]'))
  : [];
const resonatorCurveSections = resonatorControls
  ? Array.from(resonatorControls.querySelectorAll('[data-curve-section]'))
  : [];
const resonatorHueInput = document.getElementById("resonator-hue");
const resonatorConfigInputs = resonatorControls
  ? Array.from(resonatorControls.querySelectorAll("[data-resonator-key]"))
  : [];
const changeResonatorNewCurveBtn = document.getElementById("change-resonator-new-curve");
const cycleResonatorNewPaletteBtn = document.getElementById("cycle-resonator-new-palette");
const saveResonatorNewScreenshotBtn = document.getElementById("save-resonator-new-screenshot");
const resonatorNewCurveName = document.getElementById("resonator-new-curve-name");
const roseCoolHueInput = document.getElementById("rose-cool-hue");
const roseWarmHueInput = document.getElementById("rose-warm-hue");
const dupinHueInput = document.getElementById("dupin-hue");
const roseCoolHueValue = document.getElementById("rose-cool-hue-value");
const roseWarmHueValue = document.getElementById("rose-warm-hue-value");
const dupinHueValue = document.getElementById("dupin-hue-value");
const introSection = document.getElementById("intro");
const introTitle = document.getElementById("intro-title");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

window.addEventListener("mousemove", (e) => {
  if (prefersReducedMotion()) return;
  const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
  const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;

  gsap.to(".active .panel", {
    x: xPercent * 15,
    y: yPercent * 15,
    rotateY: xPercent * 2,
    rotateX: -yPercent * 2,
    duration: 0.8,
    ease: "power2.out"
  });
});

window.updateCaptionFx = (title, desc) => {
  const panelEl = document.getElementById("info-panel");
  const captionEl = document.getElementById("caption");
  const hasCaption = Boolean(title && title.trim()) || Boolean(desc && desc.trim());

  if (!hasCaption) {
    gsap.to(panelEl, { opacity: 0, scale: 0.95, duration: 0.4, ease: "power2.inOut", onComplete: () => { panelEl.style.display = "none"; } });
    return;
  }

  panelEl.style.display = "block";
  gsap.to(captionEl, {
    opacity: 0,
    y: 8,
    duration: 0.25,
    ease: "power2.in",
    onComplete: () => {
      captionEl.innerHTML = `<span class='highlight'>${title}</span> <br>${desc}`;
      gsap.fromTo(captionEl,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }
      );
      gsap.to(panelEl, { opacity: 1, scale: 1, duration: 0.4 });
    }
  });
};

window.addEventListener("mousemove", (e) => {
  if (prefersReducedMotion()) return;
  const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
  const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;

  if (introSection.classList.contains("active")) {
    gsap.to(introTitle, {
      x: xPercent * 20,
      y: yPercent * 20,
      rotateY: xPercent * 5,
      rotateX: -yPercent * 5,
      duration: 1,
      ease: "power2.out"
    });
  }
});

let activeMode = 0;
let introTitleFloatTween = null;
let navScrollTween = null;
let navJumpTargetId = null;
let lastSectionSwitchAt = 0;
let scrollStepLockUntil = 0;
let introTitleChars = [];
const navLinks = [];
const SECTION_SWITCH_COOLDOWN_MS = 260;
const SCROLL_STEP_LOCK_MS = 420;
const prefersReducedMotion = () => reducedMotionQuery.matches;
const transitionPulseState = { value: 0 };
const MOTION = {
  fast: prefersReducedMotion() ? 0.12 : 0.3,
  medium: prefersReducedMotion() ? 0.2 : 0.65,
  slow: prefersReducedMotion() ? 0.25 : 1.05,
  easeOut: "power2.out",
  easeInOut: "power2.inOut"
};
if (window.setReducedMotion) {
  window.setReducedMotion(prefersReducedMotion());
}

function splitIntroTitleChars() {
  if (!introTitle || introTitle.dataset.splitReady === "true") return;
  const lines = introTitle.innerHTML
    .split(/<br\s*\/?>/i)
    .map(line => line.trim())
    .filter(Boolean);

  const splitMarkup = lines.map(line => {
    const chars = Array.from(line).map(char => {
      if (char === " ") {
        return "<span class=\"title-char title-char-space\" aria-hidden=\"true\">&nbsp;</span>";
      }
      return `<span class="title-char" data-char="${char}" aria-hidden="true">${char}</span>`;
    }).join("");
    return `<span class="title-line">${chars}</span>`;
  }).join("");

  introTitle.setAttribute("aria-label", lines.join(" "));
  introTitle.innerHTML = splitMarkup;
  introTitle.dataset.splitReady = "true";
  introTitleChars = gsap.utils.toArray("#intro-title .title-char");
}

function animateIntroTitle() {
  if (!introTitle || introTitleChars.length === 0) return;
  if (introTitleFloatTween) {
    introTitleFloatTween.kill();
    introTitleFloatTween = null;
  }
  introTitle.classList.add("title-fx-ink");

  if (prefersReducedMotion()) {
    gsap.set(introTitleChars, {
      opacity: 1,
      yPercent: 0,
      x: 0,
      y: 0,
      rotateX: 0,
      rotateZ: 0,
      filter: "none",
      "--ink-reveal": "0%"
    });
    gsap.set(introTitle, { yPercent: 0, autoAlpha: 1, filter: "none" });
    return;
  }

  gsap.set(introTitleChars, {
    clearProps: "transform,filter,opacity",
    "--ink-reveal": "100%",
    transformOrigin: "50% 100%"
  });
  gsap.set(introTitle, { yPercent: 0, autoAlpha: 1, filter: "none" });
  gsap.set(introTitleChars, { "--ink-reveal": "100%", opacity: 1, yPercent: 0, rotateX: 0 });
  gsap.timeline()
    .fromTo(
      introTitleChars,
      { "--ink-reveal": "100%", yPercent: 24, filter: "blur(2px)" },
      {
        "--ink-reveal": "0%",
        yPercent: 0,
        filter: "blur(0px)",
        duration: 0.72,
        ease: "power2.out",
        stagger: 0.04
      }
    );

  if (introTitle.dataset.glitchBound !== "true") {
    // Shake effect for the title.
    introTitle.addEventListener("mouseenter", () => {
      gsap.to(introTitleChars, {
        x: () => (Math.random() - 0.5) * 10,
        y: () => (Math.random() - 0.5) * 10,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: "none",
        onComplete: () => gsap.to(introTitleChars, { x: 0, y: 0, duration: 0.2 })
      });
    });
    introTitle.dataset.glitchBound = "true";
  }

  introTitleFloatTween = gsap.to(introTitle, {
    yPercent: -2,
    duration: 2.6,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true
  });
}

function setupNavSheen() {
  const links = gsap.utils.toArray("#progress-nav .nav-labels a");
  if (!links.length) return;

  links.forEach((link) => {
    let sheen = link.querySelector(".nav-sheen");
    if (!sheen) {
      sheen = document.createElement("span");
      sheen.classList.add("nav-sheen");
      const content = link.querySelector(".glow-btn-content");
      if (content) {
        content.appendChild(sheen);
      } else {
        link.appendChild(sheen);
      }
    }
    gsap.set(sheen, { xPercent: -150, opacity: 0, skewX: -18 });

    if (link.dataset.navSheenReady === "true") return;
    link.dataset.navSheenReady = "true";

    link.addEventListener("pointerenter", () => {
      if (prefersReducedMotion()) return;
      gsap.killTweensOf(sheen);
      gsap.fromTo(
        sheen,
        { xPercent: -220, opacity: 0, skewX: -18 },
        {
          xPercent: 240,
          skewX: -18,
          duration: 1.05,
          ease: "power2.out",
          keyframes: [
            { opacity: 0.0, duration: 0.0 },
            { opacity: 1, duration: 0.28, ease: "power2.out" },
            { opacity: 0.0, duration: 0.77, ease: "power2.out" }
          ]
        }
      );
    });

    link.addEventListener("pointerleave", () => {
      gsap.killTweensOf(sheen);
      gsap.to(sheen, { opacity: 0, duration: 0.14, ease: "power2.out" });
    });
  });
}


function getScrollMax() {
  const docMax = (document.documentElement.scrollHeight || 0) - window.innerHeight;
  const triggerMax = ScrollTrigger.maxScroll(window) || 0;
  return Math.max(1, docMax, triggerMax);
}

function getSectionNavTargetTop(section) {
  if (!section) return 0;
  const maxScroll = getScrollMax();
  const anchorTop = section.offsetTop - window.innerHeight * 0.5;
  return gsap.utils.clamp(0, maxScroll, anchorTop);
}

function getNavProgressFromScroll(scrollY) {
  if (!artSections.length) return 0;
  const y = Number(scrollY) || 0;
  const maxScroll = getScrollMax();
  return gsap.utils.clamp(0, 1, y / maxScroll);
}

function setConstellationProgress(percent) {
  const bounded = gsap.utils.clamp(0, 1, percent);
  if (!navIndicator) return;
  if (prefersReducedMotion()) {
    gsap.set(navIndicator, { height: `${bounded * 100}%` });
    return;
  }
  gsap.to(navIndicator, {
    height: `${bounded * 100}%`,
    duration: 0.2,
    ease: "power2.out",
    overwrite: true
  });
}

function pingStar(star) {
  if (!star || prefersReducedMotion()) return;
  gsap.to(
    star,
    {
      scale: 1.15,
      duration: 0.4,
      ease: "power2.out",
      overwrite: true,
      textShadow: "0px 0px 8px rgba(255,255,255,0.6)",
      transformOrigin: "left center"
    }
  );
}

function buildConstellationNav() {
  if (!navContainer) return;
  navLinks.length = 0;
  const links = gsap.utils.toArray("#progress-nav .nav-labels a");
  links.forEach((link) => {
    navLinks.push(link);
    if (link.dataset.boundNavClick === "true") return;
    link.dataset.boundNavClick = "true";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = (link.getAttribute("href") || "").replace("#", "");
      if (!targetId) return;
      const targetSection = document.getElementById(targetId);
      if (targetSection && targetSection.dataset && targetSection.dataset.mode) {
        activateSection(targetSection, { force: true, source: "nav" });
      }
      setActiveNav(targetId);
      const sectionIndex = sections.findIndex((section) => section.id === targetId);
      if (sectionIndex < 0) return;
      scrollToSectionIndex(sectionIndex, targetId);
    });
  });
  setConstellationProgress(getNavProgressFromScroll(window.scrollY));
}

function setArtworkContrastMode(modeNumber) {
  document.body.classList.toggle("light-artwork", false);
}

function hideInfoPanelForIntro() {
  if (window.updateCaptionFx) {
    window.updateCaptionFx("", "");
  }
}

function setActiveNav(id) {
  navLinks.forEach((link) => {
    const targetId = (link.getAttribute("href") || "").replace("#", "");
    const isActive = Boolean(id) && targetId === id;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "true");
      pingStar(link);
    } else {
      link.removeAttribute("aria-current");
      gsap.to(link, {
        scale: 1,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
        textShadow: "0px 0px 0px rgba(255,255,255,0)"
      });
    }
  });
}

function setReachedDots(percent) {
  navLinks.forEach((link) => {
    const targetId = (link.getAttribute("href") || "").replace("#", "");
    const targetSection = targetId ? document.getElementById(targetId) : null;
    if (!targetSection) return;
    const stop = getNavProgressFromScroll(getSectionNavTargetTop(targetSection));
    link.classList.toggle("reached", percent >= stop);
  });
  setConstellationProgress(percent);
}

function runModeTransitionFx() {
  const reduced = prefersReducedMotion();
  const tl = gsap.timeline();

  if (window.setTransitionPulse) {
    gsap.killTweensOf(transitionPulseState);
    transitionPulseState.value = reduced ? 0.55 : 1;
    window.setTransitionPulse(transitionPulseState.value);
    gsap.to(transitionPulseState, {
      value: 0,
      duration: reduced ? 0.2 : 0.55,
      ease: "power2.out",
      onUpdate: () => window.setTransitionPulse(transitionPulseState.value)
    });
  }

  tl.fromTo(
    "#canvas-container",
    reduced
      ? { scale: 1, filter: "none" }
      : {
          scale: 1.08,
          filter: "blur(15px) saturate(1.5) contrast(1.1)",
          skewX: 1
        },
    {
      scale: 1,
      filter: "none",
      skewX: 0,
      duration: MOTION.slow,
      ease: "expo.out"
    }
  );

  // Flash effect
  tl.fromTo(glow,
    { opacity: 0.8, scale: 1.2 },
    { opacity: 0, scale: 1, duration: MOTION.medium, ease: "power2.out" },
    0
  );
}

function syncRoseControlLabels() {
  if (!roseCoolHueInput || !roseWarmHueInput) return;
  if (roseCoolHueValue) {
    roseCoolHueValue.textContent = roseCoolHueInput.value;
  }
  if (roseWarmHueValue) {
    roseWarmHueValue.textContent = roseWarmHueInput.value;
  }
}

function applyRoseControlValues() {
  if (!roseCoolHueInput || !roseWarmHueInput) return;
  if (!window.setRosePalette) return;
  window.setRosePalette({
    coolHue: Number(roseCoolHueInput.value),
    warmHue: Number(roseWarmHueInput.value)
  });
}

function syncDupinHueLabel() {
  if (!dupinHueInput || !dupinHueValue) return;
  dupinHueValue.textContent = dupinHueInput.value;
}

function applyDupinHueValue() {
  if (!dupinHueInput) return;
  if (!window.setDupinHue) return;
  window.setDupinHue(Number(dupinHueInput.value));
}

function syncResonatorCurveSelection() {
  if (!resonatorCurveRadios.length) return;
  if (!window.getResonatorConfig) return;
  const config = window.getResonatorConfig();
  const currentMode = config.curveMode ?? 0;
  resonatorCurveRadios.forEach((radio) => {
    radio.checked = Number(radio.value) === currentMode;
  });
}

function showResonatorCurveSection(index, animate) {
  resonatorCurveSections.forEach((section) => {
    gsap.killTweensOf(section);
    if (Number(section.dataset.curveSection) === index) {
      section.open = true;
      if (animate) {
        gsap.set(section, { display: "block" });
        gsap.fromTo(section, { opacity: 0, y: 7 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" });
      } else {
        gsap.set(section, { display: "block", opacity: 1, y: 0 });
      }
    } else {
      if (animate) {
        gsap.to(section, {
          opacity: 0, duration: 0.16, ease: "power2.in",
          onComplete: () => gsap.set(section, { display: "none", y: 0 })
        });
      } else {
        gsap.set(section, { display: "none", opacity: 0 });
      }
    }
  });
}

function syncResonatorConfigControls() {
  if (!resonatorConfigInputs.length) return;
  if (!window.getResonatorConfig) return;

  const config = window.getResonatorConfig();
  if (!config) return;

  resonatorConfigInputs.forEach((input) => {
    const key = input.dataset.resonatorKey;
    if (!key || !(key in config)) return;
    const nextValue = String(config[key]);
    if (document.activeElement === input) return;
    if (input.value !== nextValue) {
      input.value = nextValue;
    }
  });
}

function applyResonatorConfigValue(input) {
  if (!input) return;
  if (!window.setResonatorConfig) return;

  const key = input.dataset.resonatorKey;
  if (!key) return;

  const nextValue = Number(input.value);
  if (!Number.isFinite(nextValue)) return;

  const config = window.setResonatorConfig({ [key]: nextValue });
  if (!config) return;

  resonatorConfigInputs.forEach((peer) => {
    if (peer.dataset.resonatorKey !== key) return;
    if (peer === input) return;
    if (!(key in config)) return;
    peer.value = String(config[key]);
  });
}

function syncResonatorNewCurveLabel() {
  if (!resonatorNewCurveName) return;
  if (!window.getResonatorNewCurveLabel) return;
  resonatorNewCurveName.textContent = window.getResonatorNewCurveLabel();
}

function playButtonShine(btn, event) {
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
  const maxDistanceToCorner = Math.max(
    Math.hypot(clampedX, clampedY),
    Math.hypot(rect.width - clampedX, clampedY),
    Math.hypot(clampedX, rect.height - clampedY),
    Math.hypot(rect.width - clampedX, rect.height - clampedY)
  );
  const fullCoverScale = Math.max(1.2, (maxDistanceToCorner * 2 * 1.1) / shineBaseSize);

  gsap.set(shine, {
    xPercent: -50,
    yPercent: -50,
    scale: 0.08,
    opacity: 0
  });

  if (prefersReducedMotion()) {
    gsap.to(shine, {
      opacity: 0,
      duration: 0.18,
      ease: "power1.out",
      onStart: () => gsap.set(shine, { opacity: 0.22 }),
      onComplete: () => shine.remove()
    });
    return;
  }

  gsap.to(shine, {
    scale: fullCoverScale,
    duration: 0.45,
    ease: "power2.out",
    keyframes: [
      { opacity: 0.58, duration: 0.08, ease: "power2.out" },
      { opacity: 0, duration: 0.37, ease: "power2.out" }
    ],
    overwrite: "auto",
    onComplete: () => shine.remove()
  });
}

function activateSection(section, options = {}) {
  const { force = false, source = "scroll" } = options;
  const now = performance.now();
  if (!force && source === "scroll" && now - lastSectionSwitchAt < SECTION_SWITCH_COOLDOWN_MS) {
    return;
  }
  if (!force && source === "scroll" && now < scrollStepLockUntil) {
    return;
  }

  const targetSectionIndex = sections.findIndex((s) => s === section);
  const activeSectionIndex = sections.findIndex((s) => Number(s.dataset.mode) === activeMode);
  if (
    !force &&
    source === "scroll" &&
    targetSectionIndex >= 0 &&
    activeSectionIndex >= 0
  ) {
    const delta = targetSectionIndex - activeSectionIndex;
    if (Math.abs(delta) > 1) {
      const steppedIndex = activeSectionIndex + Math.sign(delta);
      scrollToSectionIndex(steppedIndex, sections[steppedIndex] ? sections[steppedIndex].id : null);
      return;
    }
  }

  const newMode = Number(section.dataset.mode);

  if (!Number.isNaN(newMode) && newMode !== activeMode) {
    changeMode(newMode);
    activeMode = newMode;
    lastSectionSwitchAt = now;
    if (source === "scroll") {
      scrollStepLockUntil = now + (prefersReducedMotion() ? 140 : SCROLL_STEP_LOCK_MS);
    }
    setArtworkContrastMode(activeMode);
    runModeTransitionFx();
  }

  sections.forEach(s => s.classList.remove("active"));
  section.classList.add("active");
  setActiveNav(section.id);
  
  if (resonatorControls) {
    resonatorControls.classList.toggle("visible", section.id === "s1");
    if (section.id === "s1") {
      syncResonatorCurveSelection();
    }
  }
  if (fractalControls) {
    fractalControls.classList.toggle("visible", section.id === "s3");
  }
  if (roseControls) {
    roseControls.classList.toggle("visible", section.id === "s4");
  }
  if (dupinControls) {
    dupinControls.classList.toggle("visible", section.id === "s5");
  }
  if (resonatorNewControls) {
    resonatorNewControls.classList.toggle("visible", section.id === "s6");
    if (section.id === "s6") {
      syncResonatorNewCurveLabel();
    }
  }
}

function getCurrentSectionIndex() {
  const activeIdx = sections.findIndex(section => section.classList.contains("active"));
  if (activeIdx >= 0) return activeIdx;

  let closestIdx = 0;
  let closestDist = Infinity;
  const y = window.scrollY;
  sections.forEach((section, idx) => {
    const dist = Math.abs(section.offsetTop - y);
    if (dist < closestDist) {
      closestDist = dist;
      closestIdx = idx;
    }
  });
  return closestIdx;
}

function scrollToSectionIndex(index, targetId = null) {
  const bounded = gsap.utils.clamp(0, sections.length - 1, index);
  const targetTop = getSectionNavTargetTop(sections[bounded]);
  navJumpTargetId = targetId || sections[bounded].id || null;
  if (navScrollTween) {
    navScrollTween.kill();
    navScrollTween = null;
  }
  if (window.ScrollToPlugin) {
    navScrollTween = gsap.to(window, {
      scrollTo: { y: targetTop, autoKill: false },
      duration: prefersReducedMotion() ? 0.01 : 0.68,
      ease: "power2.inOut",
      onComplete: () => {
        const targetSection = sections[bounded];
        navJumpTargetId = null;
        if (targetSection && targetSection.dataset && targetSection.dataset.mode) {
          activateSection(targetSection, { force: true, source: "nav" });
        }
        navScrollTween = null;
      },
      onInterrupt: () => {
        const fallbackSection = sections[getCurrentSectionIndex()];
        if (fallbackSection && fallbackSection.dataset && fallbackSection.dataset.mode) {
          activateSection(fallbackSection, { force: true, source: "interrupt" });
        }
        navJumpTargetId = null;
        navScrollTween = null;
      }
    });
  } else {
    if (prefersReducedMotion()) {
      window.scrollTo({ top: targetTop, behavior: "auto" });
      const targetSection = sections[bounded];
      navJumpTargetId = null;
      if (targetSection && targetSection.dataset && targetSection.dataset.mode) {
        activateSection(targetSection, { force: true, source: "nav" });
      }
      return;
    }
    const positionProxy = { y: window.scrollY };
    navScrollTween = gsap.to(positionProxy, {
      y: targetTop,
      duration: 0.68,
      ease: "power2.inOut",
      onUpdate: () => {
        window.scrollTo(0, positionProxy.y);
      },
      onComplete: () => {
        const targetSection = sections[bounded];
        navJumpTargetId = null;
        if (targetSection && targetSection.dataset && targetSection.dataset.mode) {
          activateSection(targetSection, { force: true, source: "nav" });
        }
        navScrollTween = null;
      },
      onInterrupt: () => {
        const fallbackSection = sections[getCurrentSectionIndex()];
        if (fallbackSection && fallbackSection.dataset && fallbackSection.dataset.mode) {
          activateSection(fallbackSection, { force: true, source: "interrupt" });
        }
        navJumpTargetId = null;
        navScrollTween = null;
      }
    });
  }
}

sections.forEach((section, i) => {
  const panel = section.querySelector(".panel");
  if (!panel) return;

  const baseX = i % 2 === 0 ? -60 : 60;
  if (prefersReducedMotion()) {
    gsap.fromTo(
      panel,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: MOTION.fast,
        ease: MOTION.easeOut,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );
  } else {
    gsap.fromTo(
      panel,
      { autoAlpha: 0, x: baseX, y: 16, filter: "blur(8px)" },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        ease: MOTION.easeOut,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 45%",
          scrub: MOTION.medium
        }
      }
    );
  }
});

artSections.forEach(section => {
  ScrollTrigger.create({
    trigger: section,
    start: "top 35%",
    end: "bottom 65%",
    onEnter: () => {
      if (navJumpTargetId && navJumpTargetId !== section.id) return;
      activateSection(section, { source: "scroll" });
    },
    onEnterBack: () => {
      if (navJumpTargetId && navJumpTargetId !== section.id) return;
      activateSection(section, { source: "scroll" });
    }
  });
});

if (introSection) {
  ScrollTrigger.create({
    trigger: introSection,
    start: "top center",
    end: "bottom center",
    onEnter: () => {
      if (navJumpTargetId) return;
      sections.forEach(s => s.classList.remove("active"));
      introSection.classList.add("active");
      setActiveNav("");
      hideInfoPanelForIntro();
      if (roseControls) roseControls.classList.remove("visible");
      if (fractalControls) fractalControls.classList.remove("visible");
      if (resonatorControls) resonatorControls.classList.remove("visible");
      if (dupinControls) dupinControls.classList.remove("visible");
      if (resonatorNewControls) resonatorNewControls.classList.remove("visible");
      if (activeMode !== 0) {
        changeMode(0);
        activeMode = 0;
        setArtworkContrastMode(activeMode);
        runModeTransitionFx();
      }
    },
    onEnterBack: () => {
      if (navJumpTargetId) return;
      sections.forEach(s => s.classList.remove("active"));
      introSection.classList.add("active");
      setActiveNav("");
      hideInfoPanelForIntro();
      if (roseControls) roseControls.classList.remove("visible");
      if (fractalControls) fractalControls.classList.remove("visible");
      if (resonatorControls) resonatorControls.classList.remove("visible");
      if (dupinControls) dupinControls.classList.remove("visible");
      if (resonatorNewControls) resonatorNewControls.classList.remove("visible");
      if (activeMode !== 0) {
        changeMode(0);
        activeMode = 0;
        setArtworkContrastMode(activeMode);
        runModeTransitionFx();
      }
    }
  });
}

ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate: () => {
    const percent = getNavProgressFromScroll(window.scrollY);
    setReachedDots(percent);
    if (window.setScrollProgress) {
      window.setScrollProgress(percent);
    }
  }
});

if (!prefersReducedMotion()) {
  ScrollTrigger.create({
    snap: {
      snapTo: (value) => {
        if (navJumpTargetId) return value;
        const activeSectionIndex = sections.findIndex((section) => Number(section.dataset.mode) === activeMode);
        const currentIdx = activeSectionIndex >= 0 ? activeSectionIndex : getCurrentSectionIndex();
        const rawIdx = Math.round(value * (sections.length - 1));
        const boundedIdx = gsap.utils.clamp(currentIdx - 1, currentIdx + 1, rawIdx);
        const steps = sections.length - 1;
        return boundedIdx / steps;
      },
      directional: true,
      inertia: false,
      delay: 0.08,
      duration: { min: 0.16, max: 0.32 },
      ease: "power2.out"
    }
  });
}

reducedMotionQuery.addEventListener("change", (event) => {
  if (window.setReducedMotion) {
    window.setReducedMotion(event.matches);
  }
  if (event.matches) {
    gsap.set(".nav-sheen", { opacity: 0, xPercent: -150, skewX: -18 });
  }
  animateIntroTitle();
  setConstellationProgress(getNavProgressFromScroll(window.scrollY));
  ScrollTrigger.refresh();
});

buildConstellationNav();
splitIntroTitleChars();
animateIntroTitle();
setActiveNav("");
setReachedDots(0);
setupNavSheen();

if (roseControls && roseCoolHueInput && roseWarmHueInput) {
  roseControls.classList.remove("visible");
  if (window.getRosePalette) {
    const initial = window.getRosePalette();
    roseCoolHueInput.value = String(Math.round(initial.coolHue ?? 196));
    roseWarmHueInput.value = String(Math.round(initial.warmHue ?? 338));
  }
  syncRoseControlLabels();
  [roseCoolHueInput, roseWarmHueInput].forEach((input) => {
    input.addEventListener("input", () => {
      syncRoseControlLabels();
      applyRoseControlValues();
    });
  });
  applyRoseControlValues();
}

if (resonatorControls) {
  resonatorControls.classList.remove("visible");
  syncResonatorCurveSelection();
  syncResonatorConfigControls();
  const initialMode = window.getResonatorConfig ? (window.getResonatorConfig().curveMode ?? 0) : 0;
  showResonatorCurveSection(initialMode, false);
  resonatorCurveRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      if (!window.selectResonatorCurve) return;
      const modeIndex = Number(radio.value);
      window.selectResonatorCurve(modeIndex);
      showResonatorCurveSection(modeIndex, true);
    });
  });
}

if (resonatorControls && invertResonatorRotationBtn) {
  invertResonatorRotationBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    playButtonShine(invertResonatorRotationBtn, event);
    if (!window.invertResonatorRotation) return;
    window.invertResonatorRotation();
  });
}

if (resonatorControls && resetResonatorControlsBtn) {
  resetResonatorControlsBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    playButtonShine(resetResonatorControlsBtn, event);
    if (!window.resetResonatorConfig) return;
    window.resetResonatorConfig();
    syncResonatorCurveSelection();
    syncResonatorConfigControls();
  });
}

if (resonatorNewControls && changeResonatorNewCurveBtn) {
  resonatorNewControls.classList.remove("visible");
  syncResonatorNewCurveLabel();
  changeResonatorNewCurveBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    playButtonShine(changeResonatorNewCurveBtn, event);
    if (!window.cycleResonatorNewCurve) return;
    window.cycleResonatorNewCurve();
    syncResonatorNewCurveLabel();
  });
}

if (resonatorNewControls && cycleResonatorNewPaletteBtn) {
  cycleResonatorNewPaletteBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    playButtonShine(cycleResonatorNewPaletteBtn, event);
    if (!window.cycleResonatorNewPalette) return;
    window.cycleResonatorNewPalette();
  });
}

if (resonatorNewControls && saveResonatorNewScreenshotBtn) {
  saveResonatorNewScreenshotBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    playButtonShine(saveResonatorNewScreenshotBtn, event);
    saveCanvas("resonator-new-moment", "png");
  });
}

if (resonatorControls && saveResonatorScreenshotBtn) {
  saveResonatorScreenshotBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    playButtonShine(saveResonatorScreenshotBtn, event);
    saveCanvas('resonator-moment', 'png');
  });
}

if (resonatorControls && resonatorConfigInputs.length) {
  syncResonatorConfigControls();
  resonatorConfigInputs.forEach((input) => {
    input.addEventListener("input", () => {
      applyResonatorConfigValue(input);
    });
    input.addEventListener("change", () => {
      applyResonatorConfigValue(input);
      syncResonatorConfigControls();
    });
  });
}

if (dupinControls && dupinHueInput) {
  if (window.getDupinHue) {
    dupinHueInput.value = String(Math.round(window.getDupinHue()));
  }
  syncDupinHueLabel();
  dupinHueInput.addEventListener("input", () => {
    syncDupinHueLabel();
    applyDupinHueValue();
  });
  applyDupinHueValue();
}

changeMode(0);
setArtworkContrastMode(0);
runModeTransitionFx();
