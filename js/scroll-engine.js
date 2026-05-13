export function getScrollMax() {
  const docMax = (document.documentElement.scrollHeight || 0) - window.innerHeight;
  const triggerMax = ScrollTrigger.maxScroll(window) || 0;
  return Math.max(1, docMax, triggerMax);
}

export function getSectionNavTargetTop(section) {
  if (!section) return 0;
  const anchorTop = section.offsetTop - window.innerHeight * 0.5;
  return gsap.utils.clamp(0, getScrollMax(), anchorTop);
}

export function initScrollEngine({
  sections,
  artSections,
  introSection,
  prefersReducedMotion,
  MOTION,
  onSectionActivate,
  onIntroActivate,
  onScrollProgress
}) {
  let activeMode = 0;
  let lastSectionSwitchAt = 0;
  let scrollStepLockUntil = 0;
  let navJumpTargetId = null;
  let navScrollTween = null;

  const SECTION_SWITCH_COOLDOWN_MS = 260;
  const SCROLL_STEP_LOCK_MS = 420;

  function getCurrentSectionIndex() {
    const activeIdx = sections.findIndex(s => s.classList.contains("active"));
    if (activeIdx >= 0) return activeIdx;
    let closestIdx = 0;
    let closestDist = Infinity;
    sections.forEach((section, idx) => {
      const dist = Math.abs(section.offsetTop - window.scrollY);
      if (dist < closestDist) { closestDist = dist; closestIdx = idx; }
    });
    return closestIdx;
  }

  function scrollToSectionIndex(index, targetId = null) {
    const bounded = gsap.utils.clamp(0, sections.length - 1, index);
    const targetTop = getSectionNavTargetTop(sections[bounded]);
    navJumpTargetId = targetId || (sections[bounded] ? sections[bounded].id : null) || null;
    if (navScrollTween) { navScrollTween.kill(); navScrollTween = null; }

    const onComplete = () => {
      const targetSection = sections[bounded];
      navJumpTargetId = null;
      if (targetSection?.dataset?.mode) activateSectionInternal(targetSection, { force: true, source: "nav" });
      navScrollTween = null;
    };
    const onInterrupt = () => {
      const fallback = sections[getCurrentSectionIndex()];
      if (fallback?.dataset?.mode) activateSectionInternal(fallback, { force: true, source: "interrupt" });
      navJumpTargetId = null;
      navScrollTween = null;
    };

    if (window.ScrollToPlugin) {
      navScrollTween = gsap.to(window, {
        scrollTo: { y: targetTop, autoKill: false },
        duration: prefersReducedMotion() ? 0.01 : 0.68,
        ease: "power2.inOut",
        onComplete,
        onInterrupt
      });
    } else {
      if (prefersReducedMotion()) {
        window.scrollTo({ top: targetTop, behavior: "auto" });
        const targetSection = sections[bounded];
        navJumpTargetId = null;
        if (targetSection?.dataset?.mode) activateSectionInternal(targetSection, { force: true, source: "nav" });
        return;
      }
      const positionProxy = { y: window.scrollY };
      navScrollTween = gsap.to(positionProxy, {
        y: targetTop,
        duration: 0.68,
        ease: "power2.inOut",
        onUpdate: () => window.scrollTo(0, positionProxy.y),
        onComplete,
        onInterrupt
      });
    }
  }

  function activateSectionInternal(section, options = {}) {
    const { force = false, source = "scroll" } = options;
    const now = performance.now();
    if (!force && source === "scroll" && now - lastSectionSwitchAt < SECTION_SWITCH_COOLDOWN_MS) return;
    if (!force && source === "scroll" && now < scrollStepLockUntil) return;

    const targetIdx = sections.findIndex(s => s === section);
    const activeIdx = sections.findIndex(s => Number(s.dataset.mode) === activeMode);

    if (!force && source === "scroll" && targetIdx >= 0 && activeIdx >= 0) {
      const delta = targetIdx - activeIdx;
      if (Math.abs(delta) > 1) {
        const steppedIdx = activeIdx + Math.sign(delta);
        scrollToSectionIndex(steppedIdx, sections[steppedIdx]?.id ?? null);
        return;
      }
    }

    const newMode = Number(section.dataset.mode);
    if (!Number.isNaN(newMode) && newMode !== activeMode) {
      activeMode = newMode;
      lastSectionSwitchAt = now;
      if (source === "scroll") scrollStepLockUntil = now + (prefersReducedMotion() ? 140 : SCROLL_STEP_LOCK_MS);
    }

    sections.forEach(s => s.classList.remove("active"));
    section.classList.add("active");
    onSectionActivate(section, options);
  }

  // Panel entrance animations
  sections.forEach((section, i) => {
    const panel = section.querySelector(".panel");
    if (!panel) return;
    const baseX = i % 2 === 0 ? -60 : 60;
    if (prefersReducedMotion()) {
      gsap.fromTo(panel,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: MOTION.fast, ease: MOTION.easeOut, scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none reverse" } }
      );
    } else {
      gsap.fromTo(panel,
        { autoAlpha: 0, x: baseX, y: 16, filter: "blur(8px)" },
        { autoAlpha: 1, x: 0, y: 0, filter: "blur(0px)", ease: MOTION.easeOut, scrollTrigger: { trigger: section, start: "top 80%", end: "top 45%", scrub: MOTION.medium } }
      );
    }
  });

  // Art section scroll triggers
  artSections.forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 35%",
      end: "bottom 65%",
      onEnter: () => {
        if (navJumpTargetId && navJumpTargetId !== section.id) return;
        activateSectionInternal(section, { source: "scroll" });
      },
      onEnterBack: () => {
        if (navJumpTargetId && navJumpTargetId !== section.id) return;
        activateSectionInternal(section, { source: "scroll" });
      }
    });
  });

  // Intro section trigger
  if (introSection) {
    ScrollTrigger.create({
      trigger: introSection,
      start: "top center",
      end: "bottom center",
      onEnter: () => { if (!navJumpTargetId) onIntroActivate(); },
      onEnterBack: () => { if (!navJumpTargetId) onIntroActivate(); }
    });
  }

  // Scroll progress tracking
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: () => onScrollProgress(window.scrollY)
  });

  // Section snapping
  if (!prefersReducedMotion()) {
    ScrollTrigger.create({
      snap: {
        snapTo: (value) => {
          if (navJumpTargetId) return value;
          const activeSectionIdx = sections.findIndex(s => Number(s.dataset.mode) === activeMode);
          const currentIdx = activeSectionIdx >= 0 ? activeSectionIdx : getCurrentSectionIndex();
          const rawIdx = Math.round(value * (sections.length - 1));
          const boundedIdx = gsap.utils.clamp(currentIdx - 1, currentIdx + 1, rawIdx);
          return boundedIdx / (sections.length - 1);
        },
        directional: true,
        inertia: false,
        delay: 0.08,
        duration: { min: 0.16, max: 0.32 },
        ease: "power2.out"
      }
    });
  }

  return { scrollToSectionIndex, getCurrentSectionIndex, activateSection: activateSectionInternal };
}
