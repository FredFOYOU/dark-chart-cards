import { chartColor, type ChartColor } from "@/lib/colors";

export const DEVICE_PERIODS = ["Last 7 days", "Last 30 days", "Last 90 days"] as const;
export type DevicePeriod = (typeof DEVICE_PERIODS)[number];

export interface DeviceShare {
  name: string;
  value: number;
  color: ChartColor;
}

export interface DeviceDataset {
  delta: number;
  devices: readonly DeviceShare[];
}

const withValues = (values: readonly number[]): DeviceShare[] =>
  [
    { name: "Desktop", color: chartColor.lime },
    { name: "Mobile", color: chartColor.blue },
    { name: "Tablet", color: chartColor.violet },
    { name: "TV", color: chartColor.pink },
  ].map((device, index) => ({ ...device, value: values[index] ?? 0 }));

export const deviceData: Record<DevicePeriod, DeviceDataset> = {
  "Last 7 days": { delta: 1.9, devices: withValues([310, 240, 92, 58]) },
  "Last 30 days": { delta: 5.2, devices: withValues([1180, 620, 380, 320]) },
  "Last 90 days": { delta: 8.7, devices: withValues([3120, 2260, 870, 650]) },
};
