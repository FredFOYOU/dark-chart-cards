import { useReducedMotion } from "motion/react";

/**
 * Props d'un fondu d'entrée pour un composant `motion`. `MotionConfig` ne coupe pas les animations
 * d'opacité en mode réduit : le fondu est donc retiré ici.
 */
export function useFadeIn(duration: number, delay = 0) {
  const reduced = useReducedMotion() ?? false;
  return {
    initial: reduced ? false : { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration, delay, ease: "easeOut" },
  } as const;
}
