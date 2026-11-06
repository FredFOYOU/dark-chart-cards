import { useReducedMotion } from "motion/react";

/** Réglages d'animation communs aux séries Recharts, coupés si l'utilisateur réduit les animations. */
export function useRechartsMotion() {
  const reduced = useReducedMotion() ?? false;
  return {
    isAnimationActive: !reduced,
    animationDuration: 600,
    animationEasing: "ease-out",
  } as const;
}

/** Style discret des axes, partagé par les graphiques cartésiens. */
export const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fill: "var(--text-muted)", fontSize: 11 },
} as const;

/** Repères horizontaux pointillés des graphiques à axes. */
export const gridProps = {
  vertical: false,
  stroke: "var(--track)",
  strokeDasharray: "3 3",
} as const;
