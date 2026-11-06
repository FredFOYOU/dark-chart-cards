import { chartColor, type ChartColor } from "@/lib/colors";

export const FUNNEL_PERIODS = ["Last 7 days", "Last 30 days", "Last 90 days"] as const;
export type FunnelPeriod = (typeof FUNNEL_PERIODS)[number];

export interface FunnelStage {
  label: string;
  value: number;
  color: ChartColor;
}

export interface FunnelDataset {
  /** Variation globale sur la période, en points de pourcentage. */
  delta: number;
  stages: readonly FunnelStage[];
}

const withValues = (values: readonly number[]): FunnelStage[] =>
  [
    { label: "Link opened", color: chartColor.lime },
    { label: "Started", color: chartColor.blue },
    { label: "Completed", color: chartColor.violet },
    { label: "Converted", color: chartColor.pink },
  ].map((stage, index) => ({ ...stage, value: values[index] ?? 0 }));

export const funnelData: Record<FunnelPeriod, FunnelDataset> = {
  "Last 7 days": { delta: 5.2, stages: withValues([197, 110, 77, 38]) },
  "Last 30 days": { delta: 3.4, stages: withValues([842, 463, 301, 152]) },
  "Last 90 days": { delta: 7.9, stages: withValues([2614, 1516, 837, 497]) },
};
