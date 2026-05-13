import { getSectionNavTargetTop, getScrollMax } from './scroll-engine.js';

let navLinks = [];
let introTitleChars = [];
let introTitleFloatTween = null;

export function getNavProgressFromScroll(scrollY) {
  return gsap.utils.clamp(0, 1, (Number(scrollY) || 0) / getScrollMax());
}

function setConstellationProgress(percent) {
  const bounded = gsap.utils.clamp(0, 1, percent);
  const navIndicator = document.querySelector("#progress-nav .nav-indicator");
  if (!navIndicator) return;
  gsap.to(navIndicator, { height: `${bounded * 100}%`, duration: 0.2, ease: "power2.out", overwrite: true });
}

function pingStar(star) {
  if (!star) return;
  gsap.to(star, {
    scale: 1.15, duration: 0.4, ease: "power2.out", overwrite: true,
    textShadow: "0px 0px 8px rgba(255,255,255,0.6)",
    transformOrigin: "left center"
  });
}

export function setActiveNav(id) {
  navLinks.forEach((link) => {
    const targetId = (link.getAttribute("href") || "").replace("#", "");
    const isActive = Boolean(id) && targetId === id;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "true");
      pingStar(link);
    } else {
      link.removeAttribute("aria-current");
      gsap.to(link, { scale: 1, duration: 0.35, ease: "power2.out", overwrite: true, textShadow: "0px 0px 0px rgba(255,255,255,0)" });
    }
  });
}

export function setReachedDots(percent) {
  navLinks.forEach((link) => {
    const targetId = (link.getAttribute("href") || "").replace("#", "");
    const targetSection = targetId ? document.getElementById(targetId) : null;
    if (!targetSection) return;
    const stop = getNavProgressFromScroll(getSectionNavTargetTop(targetSection));
    link.classList.toggle("reached", percent >= stop);
  });
  setConstellationProgress(percent);
}

function setupNavSheen(prefersReducedMotion) {
  gsap.utils.toArray("#progress-nav .nav-labels a").forEach((link) => {
    let sheen = link.querySelector(".nav-sheen");
    if (!sheen) {
      sheen = document.createElement("span");
      sheen.classList.add("nav-sheen");
      const content = link.querySelector(".glow-btn-content");
      (content || link).appendChild(sheen);
    }
    gsap.set(sheen, { xPercent: -150, opacity: 0, skewX: -18 });
    if (link.dataset.navSheenReady === "true") return;
    link.dataset.navSheenReady = "true";
    link.addEventListener("pointerenter", () => {
      if (prefersReducedMotion()) return;
      gsap.killTweensOf(sheen);
      gsap.fromTo(sheen,
        { xPercent: -220, opacity: 0, skewX: -18 },
        {
          xPercent: 240, skewX: -18, duration: 1.05, ease: "power2.out",
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

function buildConstellationNav(sections, scrollToFn, activateFn) {
  navLinks.length = 0;
  gsap.utils.toArray("#progress-nav .nav-labels a").forEach((link) => {
    navLinks.push(link);
    if (link.dataset.boundNavClick === "true") return;
    link.dataset.boundNavClick = "true";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = (link.getAttribute("href") || "").replace("#", "");
      if (!targetId) return;
      const targetSection = document.getElementById(targetId);
      if (targetSection?.dataset?.mode) activateFn(targetSection, { force: true, source: "nav" });
      setActiveNav(targetId);
      const sectionIndex = sections.findIndex(s => s.id === targetId);
      if (sectionIndex >= 0) scrollToFn(sectionIndex, targetId);
    });
  });
  setConstellationProgress(getNavProgressFromScroll(window.scrollY));
}

function splitIntroTitleChars(introTitle) {
  if (!introTitle || introTitle.dataset.splitReady === "true") return;
  const lines = introTitle.innerHTML.split(/<br\s*\/?>/i).map(l => l.trim()).filter(Boolean);
  const splitMarkup = lines.map(line => {
    const chars = Array.from(line).map(char => {
      if (char === " ") return `<span class="title-char title-char-space" aria-hidden="true">&nbsp;</span>`;
      return `<span class="title-char" data-char="${char}" aria-hidden="true">${char}</span>`;
    }).join("");
    return `<span class="title-line">${chars}</span>`;
  }).join("");
  introTitle.setAttribute("aria-label", lines.join(" "));
  introTitle.innerHTML = splitMarkup;
  introTitle.dataset.splitReady = "true";
  introTitleChars = gsap.utils.toArray("#intro-title .title-char");
}

function animateIntroTitle(introTitle, prefersReducedMotion) {
  if (!introTitle || introTitleChars.length === 0) return;
  if (introTitleFloatTween) { introTitleFloatTween.kill(); introTitleFloatTween = null; }
  introTitle.classList.add("title-fx-ink");

  if (prefersReducedMotion()) {
    gsap.set(introTitleChars, { opacity: 1, yPercent: 0, x: 0, y: 0, rotateX: 0, rotateZ: 0, filter: "none", "--ink-reveal": "0%" });
    gsap.set(introTitle, { yPercent: 0, autoAlpha: 1, filter: "none" });
    return;
  }

  gsap.set(introTitleChars, { clearProps: "transform,filter,opacity", "--ink-reveal": "100%", transformOrigin: "50% 100%" });
  gsap.set(introTitle, { yPercent: 0, autoAlpha: 1, filter: "none" });
  gsap.set(introTitleChars, { "--ink-reveal": "100%", opacity: 1, yPercent: 0, rotateX: 0 });
  gsap.timeline().fromTo(
    introTitleChars,
    { "--ink-reveal": "100%", yPercent: 24, filter: "blur(2px)" },
    { "--ink-reveal": "0%", yPercent: 0, filter: "blur(0px)", duration: 0.72, ease: "power2.out", stagger: 0.04 }
  );

  if (introTitle.dataset.glitchBound !== "true") {
    introTitle.addEventListener("mouseenter", () => {
      gsap.to(introTitleChars, {
        x: () => (Math.random() - 0.5) * 10,
        y: () => (Math.random() - 0.5) * 10,
        duration: 0.1, repeat: 3, yoyo: true, ease: "none",
        onComplete: () => gsap.to(introTitleChars, { x: 0, y: 0, duration: 0.2 })
      });
    });
    introTitle.dataset.glitchBound = "true";
  }

  introTitleFloatTween = gsap.to(introTitle, { yPercent: -2, duration: 2.6, ease: "sine.inOut", repeat: -1, yoyo: true });
}

export function refreshNavAnimation(prefersReducedMotion) {
  if (prefersReducedMotion()) gsap.set(".nav-sheen", { opacity: 0, xPercent: -150, skewX: -18 });
  animateIntroTitle(document.getElementById("intro-title"), prefersReducedMotion);
  setConstellationProgress(getNavProgressFromScroll(window.scrollY));
}

export function initNav({ sections, introTitle, navContainer, prefersReducedMotion, scrollToFn, activateFn }) {
  splitIntroTitleChars(introTitle);
  animateIntroTitle(introTitle, prefersReducedMotion);
  setupNavSheen(prefersReducedMotion);
  buildConstellationNav(sections, scrollToFn, activateFn);

  // Mouse parallax for panels and intro title
  const introSection = document.getElementById("intro");
  window.addEventListener("mousemove", (e) => {
    if (prefersReducedMotion()) return;
    const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
    const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;
    gsap.to(".active .panel", { x: xPercent * 15, y: yPercent * 15, rotateY: xPercent * 2, rotateX: -yPercent * 2, duration: 0.8, ease: "power2.out" });
    if (introSection?.classList.contains("active")) {
      gsap.to(introTitle, { x: xPercent * 20, y: yPercent * 20, rotateY: xPercent * 5, rotateX: -yPercent * 5, duration: 1, ease: "power2.out" });
    }
  });

  return { setActiveNav, setReachedDots, getNavProgressFromScroll };
}
