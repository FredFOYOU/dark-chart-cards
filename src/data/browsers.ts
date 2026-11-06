import { chartColor, type ChartColor } from "@/lib/colors";

export const BROWSER_PERIODS = ["Last 7 days", "Last 30 days", "Last 90 days"] as const;
export type BrowserPeriod = (typeof BROWSER_PERIODS)[number];

export interface BrowserShare {
  name: string;
  value: number;
  color: ChartColor;
}

export interface BrowserDataset {
  delta: number;
  /** De l'anneau extérieur à l'anneau intérieur. */
  series: readonly BrowserShare[];
}

const withValues = (values: readonly number[]): BrowserShare[] =>
  [
    { name: "Chrome", color: chartColor.yellow },
    { name: "Safari", color: chartColor.pink },
    { name: "Firefox", color: chartColor.violet },
    { name: "Edge", color: chartColor.blue },
    { name: "Other", color: chartColor.lime },
  ].map((browser, index) => ({ ...browser, value: values[index] ?? 0 }));

export const browserData: Record<BrowserPeriod, BrowserDataset> = {
  "Last 7 days": { delta: 2.1, series: withValues([92, 71, 48, 54, 26]) },
  "Last 30 days": { delta: 5.2, series: withValues([275, 200, 187, 173, 90]) },
  "Last 90 days": { delta: 9.8, series: withValues([810, 655, 470, 512, 244]) },
};
