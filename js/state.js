export let motionFactor = 1;
export let reducedMotion = false;
export const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
export const prefersReducedMotion = () => reducedMotionQuery.matches;

export function setReducedMotion(v) {
  reducedMotion = !!v;
  motionFactor = reducedMotion ? 0.45 : 1;
}

// ── URL hash deep-linking ────────────────────────────────────────────────────
// Sections s1..s5 are the only addressable, artwork-bearing states; the intro
// has no hash. Kept as a validated allowlist rather than trusting the hash
// directly, since it flows into DOM lookups and history.replaceState.
const VALID_SECTION_IDS = ["s1", "s2", "s3", "s4", "s5"];

export function getInitialSectionIdFromHash() {
  const id = location.hash.replace("#", "");
  return VALID_SECTION_IDS.includes(id) ? id : null;
}

// Uses replaceState (not location.hash =) so the URL stays shareable without
// triggering the browser's native jump-to-anchor, which would fight the
// GSAP-driven scroll engine.
export function syncSectionHash(id) {
  const hash = id && VALID_SECTION_IDS.includes(id) ? `#${id}` : "";
  history.replaceState(null, "", location.pathname + location.search + hash);
}
