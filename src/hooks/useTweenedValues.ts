import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CHART_DURATION } from "@/lib/motion";

/**
 * Interpole une liste de nombres vers ses cibles (depuis 0 au montage).
 * Sert aux graphiques SVG custom pour l'entrée et le changement de période.
 */
export function useTweenedValues(
  targets: readonly number[],
  duration: number = CHART_DURATION,
): number[] {
  const reduced = useReducedMotion() ?? false;
  const [values, setValues] = useState<number[]>(() =>
    reduced ? [...targets] : targets.map(() => 0),
  );
  const current = useRef(values);
  const key = targets.join("|");

  useEffect(() => {
    const to = key.split("|").map(Number);
    if (reduced) {
      current.current = to;
      setValues(to);
      return;
    }
    const from = current.current;
    const controls = animate(0, 1, {
      duration,
      ease: "easeOut",
      onUpdate: (t) => {
        const next = to.map((target, i) => {
          const start = from[i] ?? 0;
          return start + (target - start) * t;
        });
        current.current = next;
        setValues(next);
      },
    });
    return () => controls.stop();
  }, [key, duration, reduced]);

  return values;
}
