export const RADAR_PERIODS = ["H2 2023", "H1 2024", "H2 2024"] as const;
export type RadarPeriod = (typeof RADAR_PERIODS)[number];

export interface RadarPoint {
  month: string;
  desktop: number;
  mobile: number;
}

export interface RadarDataset {
  delta: number;
  points: readonly RadarPoint[];
}

const zip = (
  months: readonly string[],
  desktop: readonly number[],
  mobile: readonly number[],
): RadarPoint[] =>
  months.map((month, index) => ({
    month,
    desktop: desktop[index] ?? 0,
    mobile: mobile[index] ?? 0,
  }));

const FIRST_HALF = ["January", "February", "March", "April", "May", "June"] as const;
const SECOND_HALF = ["July", "August", "September", "October", "November", "December"] as const;

export const radarData: Record<RadarPeriod, RadarDataset> = {
  "H2 2023": {
    delta: 3.1,
    points: zip(SECOND_HALF, [158, 241, 276, 198, 232, 171], [96, 150, 182, 110, 141, 88]),
  },
  "H1 2024": {
    delta: 5.2,
    points: zip(FIRST_HALF, [186, 305, 237, 273, 209, 214], [80, 200, 120, 190, 130, 140]),
  },
  "H2 2024": {
    delta: 7.6,
    points: zip(SECOND_HALF, [264, 212, 318, 289, 247, 301], [172, 118, 214, 201, 146, 193]),
  },
};

export const sumBy = (points: readonly RadarPoint[], key: "desktop" | "mobile"): number =>
  points.reduce((total, point) => total + point[key], 0);
