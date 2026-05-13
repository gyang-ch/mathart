export function updateCaption(title, desc) {
  const panelEl = document.getElementById("info-panel");
  const captionEl = document.getElementById("caption");
  if (!panelEl || !captionEl) return;
  const hasCaption = Boolean(title && title.trim()) || Boolean(desc && desc.trim());

  if (!hasCaption) {
    gsap.to(panelEl, {
      opacity: 0, scale: 0.95, duration: 0.4, ease: "power2.inOut",
      onComplete: () => { panelEl.style.display = "none"; }
    });
    return;
  }

  panelEl.style.display = "block";
  gsap.to(captionEl, {
    opacity: 0, y: 8, duration: 0.25, ease: "power2.in",
    onComplete: () => {
      captionEl.innerHTML = `<span class='highlight'>${title}</span> <br>${desc}`;
      gsap.fromTo(captionEl,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }
      );
      gsap.to(panelEl, { opacity: 1, scale: 1, duration: 0.4 });
    }
  });
}
