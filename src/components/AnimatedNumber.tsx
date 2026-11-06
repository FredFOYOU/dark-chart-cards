import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { ValueFormatter } from "@/lib/format";
import { COUNTER_DURATION, EASE_OUT_EXPO } from "@/lib/motion";

const COUNTING_OPACITY = 0.55;

export interface AnimatedNumberProps {
  value: number;
  format: ValueFormatter;
  className?: string;
  /** Atténue le chiffre pendant qu'il compte (en-têtes de carte). */
  dimWhileCounting?: boolean;
}

/**
 * Compteur animé. Le texte est écrit directement dans le DOM à chaque frame :
 * la carte n'est pas re-rendue pendant l'animation. Il part de 0 au montage.
 */
export function AnimatedNumber({
  value,
  format,
  className,
  dimWhileCounting = false,
}: AnimatedNumberProps) {
  const reduced = useReducedMotion() ?? false;
  const nodeRef = useRef<HTMLSpanElement>(null);
  const displayed = useRef(reduced ? value : 0);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    if (reduced) {
      displayed.current = value;
      node.textContent = format(value);
      return;
    }
    node.textContent = format(displayed.current);
    const counter = animate(displayed.current, value, {
      duration: COUNTER_DURATION,
      ease: EASE_OUT_EXPO,
      onUpdate: (latest) => {
        displayed.current = latest;
        node.textContent = format(latest);
      },
    });
    const fade =
      dimWhileCounting && displayed.current !== value
        ? animate(node, { opacity: [COUNTING_OPACITY, 1] }, { duration: COUNTER_DURATION, ease: "easeIn" })
        : undefined;
    return () => {
      counter.stop();
      fade?.stop();
    };
  }, [value, format, reduced, dimWhileCounting]);

  return (
    <span className={className}>
      <span ref={nodeRef} aria-hidden />
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}
