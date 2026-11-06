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
  /** De l'anneau intérieur à l'anneau extérieur, comme les tuiles. */
  series: readonly BrowserShare[];
}

const withValues = (values: readonly number[]): BrowserShare[] =>
  [
    { name: "Other", color: chartColor.lime },
    { name: "Edge", color: chartColor.blue },
    { name: "Firefox", color: chartColor.violet },
    { name: "Safari", color: chartColor.pink },
    { name: "Chrome", color: chartColor.yellow },
  ].map((browser, index) => ({ ...browser, value: values[index] ?? 0 }));

export const browserData: Record<BrowserPeriod, BrowserDataset> = {
  "Last 7 days": { delta: 5.2, series: withValues([90, 173, 187, 200, 275]) },
  "Last 30 days": { delta: 6.4, series: withValues([310, 640, 598, 720, 1105]) },
  "Last 90 days": { delta: 9.8, series: withValues([910, 1830, 1790, 2240, 3380]) },
};
