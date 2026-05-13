export let motionFactor = 1;
export let reducedMotion = false;
export const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
export const prefersReducedMotion = () => reducedMotionQuery.matches;

export function setReducedMotion(v) {
  reducedMotion = !!v;
  motionFactor = reducedMotion ? 0.45 : 1;
}
