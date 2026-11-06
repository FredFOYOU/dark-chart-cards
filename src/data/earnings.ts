export const EARNINGS_PERIODS = ["Weekly", "Monthly", "Yearly"] as const;
export type EarningsPeriod = (typeof EARNINGS_PERIODS)[number];

export interface EarningsBar {
  /** Libellé court de l'axe X. */
  label: string;
  /** Libellé complet de l'en-tête au survol. */
  fullLabel: string;
  value: number;
}

export interface EarningsDataset {
  total: number;
  delta: number;
  ticks: readonly number[];
  bars: readonly EarningsBar[];
}

const MONTHS = [
  ["Jan", "January"],
  ["Feb", "February"],
  ["Mar", "March"],
  ["Apr", "April"],
  ["May", "May"],
  ["Jun", "June"],
  ["Jul", "July"],
  ["Aug", "August"],
  ["Sep", "September"],
  ["Oct", "October"],
  ["Nov", "November"],
  ["Dec", "December"],
] as const;

const monthly = (values: readonly number[]): EarningsBar[] =>
  MONTHS.map(([label, fullLabel], index) => ({
    label,
    fullLabel,
    value: values[index] ?? 0,
  }));

const weekly = (values: readonly number[]): EarningsBar[] =>
  values.map((value, index) => ({
    label: `W${index + 1}`,
    fullLabel: `Week ${index + 1}`,
    value,
  }));

export const earningsData: Record<EarningsPeriod, EarningsDataset> = {
  Weekly: {
    total: 1894,
    delta: 6.1,
    ticks: [0, 300, 500, 1000],
    bars: weekly([420, 610, 340, 760, 520, 880, 450, 690, 380, 940, 570, 720]),
  },
  Monthly: {
    total: 7462,
    delta: 14.8,
    ticks: [0, 3000, 5000, 10000],
    bars: monthly([4100, 6200, 3300, 7462, 5200, 8300, 4600, 6900, 3900, 9100, 5600, 7200]),
  },
  Yearly: {
    total: 389204,
    delta: 22.5,
    ticks: [0, 20000, 40000, 60000],
    bars: monthly([
      14200, 17600, 20900, 23400, 26800, 29500, 32700, 35100, 38400, 42300, 50100, 58204,
    ]),
  },
};
