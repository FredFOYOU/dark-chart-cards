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

export const earningsData: Record<EarningsPeriod, EarningsDataset> = {
  Weekly: {
    total: 7462,
    delta: 14.8,
    bars: monthly([3210, 7368, 9631, 7105, 3631, 2263, 3789, 5000, 6842, 4526, 11474, 8158]),
  },
  Monthly: {
    total: 32180,
    delta: 8.2,
    bars: monthly([5079, 6137, 7354, 8783, 9365, 10476, 10899, 9629, 8518, 7249, 6984, 8042]),
  },
  Yearly: {
    total: 389204,
    delta: 21.4,
    bars: monthly([4180, 4815, 5608, 6085, 6772, 7460, 8148, 8889, 9577, 10265, 10952, 11587]),
  },
};
