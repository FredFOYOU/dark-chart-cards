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

const THIS_YEAR_ORGANIC = [3100, 3400, 3700, 3900, 4100, 4300, 4500, 4600, 4700, 4800, 4700, 4700];
const THIS_YEAR_REFERRAL = [1800, 1900, 2000, 2100, 2150, 2200, 2250, 2300, 2350, 2387, 2300, 2163];
const THIS_YEAR_PAID = [1200, 1300, 1350, 1400, 1450, 1550, 1650, 1700, 1750, 1400, 1800, 1750];

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
      [2600, 2500, 2900, 3300, 3100, 3500, 3700, 3600, 3900, 4200, 4100, 4300],
      [1500, 1650, 1600, 1800, 1950, 1900, 2100, 2050, 2000, 2200, 2150, 2250],
      [1400, 1250, 1100, 1300, 1200, 1350, 1250, 1400, 1500, 1350, 1600, 1450],
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
