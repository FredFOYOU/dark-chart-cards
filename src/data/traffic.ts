export const TRAFFIC_PERIODS = ["This year", "Last year", "Last 6 months"] as const;
export type TrafficPeriod = (typeof TRAFFIC_PERIODS)[number];

export interface TrafficPoint {
  month: string;
  organic: number;
  referral: number;
  paid: number;
}

export interface TrafficDataset {
  delta: number;
  points: readonly TrafficPoint[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const THIS_YEAR_ORGANIC = [2400, 2800, 3200, 3000, 3700, 4200, 4500, 4400, 5100, 5600, 5400, 6200];
const THIS_YEAR_REFERRAL = [1200, 1400, 1500, 1900, 1900, 1900, 2300, 2400, 2400, 2900, 2900, 3200];
const THIS_YEAR_PAID = [900, 800, 1200, 1300, 1300, 1400, 1400, 1700, 2000, 1900, 2000, 2400];

const zip = (
  months: readonly string[],
  organic: readonly number[],
  referral: readonly number[],
  paid: readonly number[],
): TrafficPoint[] =>
  months.map((month, index) => ({
    month,
    organic: organic[index] ?? 0,
    referral: referral[index] ?? 0,
    paid: paid[index] ?? 0,
  }));

export const trafficData: Record<TrafficPeriod, TrafficDataset> = {
  "This year": {
    delta: 8.2,
    points: zip(MONTHS, THIS_YEAR_ORGANIC, THIS_YEAR_REFERRAL, THIS_YEAR_PAID),
  },
  "Last year": {
    delta: 4.6,
    points: zip(
      MONTHS,
      [2000, 2300, 2500, 2700, 3000, 3300, 3400, 3700, 4100, 4300, 4600, 5000],
      [1000, 1100, 1300, 1400, 1500, 1700, 1700, 2000, 2100, 2200, 2500, 2700],
      [700, 700, 900, 1000, 1100, 1100, 1300, 1400, 1500, 1700, 1700, 2000],
    ),
  },
  "Last 6 months": {
    delta: 6.9,
    points: zip(
      MONTHS.slice(6),
      THIS_YEAR_ORGANIC.slice(6),
      THIS_YEAR_REFERRAL.slice(6),
      THIS_YEAR_PAID.slice(6),
    ),
  },
};

export type TrafficSeries = "organic" | "referral" | "paid";

export const sumSeries = (points: readonly TrafficPoint[], key: TrafficSeries): number =>
  points.reduce((total, point) => total + point[key], 0);
