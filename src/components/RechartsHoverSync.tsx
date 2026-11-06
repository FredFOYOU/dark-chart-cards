import { useEffect, useRef } from "react";
import { useActiveTooltipLabel, useIsTooltipActive } from "recharts";

export interface RechartsHoverSyncProps {
  /** Libellés de l'axe de catégories, dans l'ordre des données. */
  labels: readonly string[];
  setActiveIndex: (index: number | null) => void;
}

/**
 * À placer dans un graphique Recharts : relie le survol à `activeIndex`, sans Tooltip.
 * On s'abonne à l'état du graphique plutôt qu'à `onMouseMove`, dont le callback peut précéder
 * la mise à jour de cet état et garder un mouvement de retard quand le pointeur s'arrête.
 */
export function RechartsHoverSync({ labels, setActiveIndex }: RechartsHoverSyncProps) {
  const label = useActiveTooltipLabel();
  const active = useIsTooltipActive();
  const latestLabels = useRef(labels);
  latestLabels.current = labels;

  useEffect(() => {
    const index = active && label !== undefined ? latestLabels.current.indexOf(String(label)) : -1;
    setActiveIndex(index >= 0 ? index : null);
  }, [active, label, setActiveIndex]);

  return null;
}
