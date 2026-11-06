import { chartColor, type ChartColor } from "@/lib/colors";

export const FUNNEL_PERIODS = ["Last 7 days", "Last 30 days", "Last 90 days"] as const;
export type FunnelPeriod = (typeof FUNNEL_PERIODS)[number];

export interface FunnelStage {
  label: string;
  value: number;
  /** Variation de l'étape sur la période, en points de pourcentage. */
  delta: number;
  color: ChartColor;
}

export interface FunnelDataset {
  /** Variation globale sur la période, en points de pourcentage. */
  delta: number;
  stages: readonly FunnelStage[];
}

function stages(
  linkOpened: readonly [number, number],
  started: readonly [number, number],
  completed: readonly [number, number],
  converted: readonly [number, number],
): readonly FunnelStage[] {
  return [
    { label: "Link opened", value: linkOpened[0], delta: linkOpened[1], color: chartColor.lime },
    { label: "Started", value: started[0], delta: started[1], color: chartColor.blue },
    { label: "Completed", value: completed[0], delta: completed[1], color: chartColor.violet },
    { label: "Converted", value: converted[0], delta: converted[1], color: chartColor.pink },
  ];
}

export const funnelData: Record<FunnelPeriod, FunnelDataset> = {
  "Last 7 days": {
    delta: 1.8,
    stages: stages([214, 1.8], [129, 2.3], [71, 1.1], [41, 3.2]),
  },
  "Last 30 days": {
    delta: 3.4,
    stages: stages([842, 3.4], [463, 2.9], [301, 4.1], [152, 5.6]),
  },
  "Last 90 days": {
    delta: 7.9,
    stages: stages([2614, 7.9], [1516, 6.4], [837, 8.8], [497, 11.2]),
  },
};
