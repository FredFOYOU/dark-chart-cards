import { chartColor, type ChartColor } from "@/lib/colors";

export const SANKEY_PERIODS = ["This week", "Last week", "Last 30 days"] as const;
export type SankeyPeriod = (typeof SANKEY_PERIODS)[number];

export interface SankeySource {
  name: string;
  hours: number;
  color: ChartColor;
}

export interface SankeyTarget {
  name: string;
  /** Part du temps suivi, en points de pourcentage. */
  share: number;
}

export interface SankeyFlow {
  /** Index dans `sources`. */
  source: number;
  /** Index dans `targets`. */
  target: number;
  hours: number;
}

export interface SankeyDataset {
  period: SankeyPeriod;
  totalHours: number;
  sources: readonly SankeySource[];
  targets: readonly SankeyTarget[];
  flows: readonly SankeyFlow[];
}

const SOURCES = [
  { name: "Focus", color: chartColor.emerald },
  { name: "Meetings", color: chartColor.violet },
  { name: "Breaks", color: chartColor.yellow },
  { name: "Admin", color: chartColor.blue },
  { name: "Learning", color: chartColor.pink },
] as const;

const TARGET_NAMES = [
  "Browsing",
  "Writing",
  "Messaging",
  "Productivity",
  "Email",
  "Video calls",
  "Everything else",
] as const;

/**
 * Répartition de référence : heures de chaque source (ligne) vers chaque cible (colonne), relevées
 * sur la vidéo. Le 0 signifie « pas de flux ». Elle sert de forme aux autres périodes.
 */
const REFERENCE_FLOWS: readonly (readonly number[])[] = [
  [10.4, 9.48, 3.2, 4.5, 4.42, 0, 0],
  [0, 3, 2.4, 0, 0, 9.6, 3],
  [4, 0, 0, 0, 0, 2.4, 5.6],
  [0, 3, 2.6, 5.8, 0, 0, 2.6],
  [4.5, 0, 3, 0, 2.5, 0, 0],
];

/**
 * Ajustement proportionnel itératif : répartit les heures pour que chaque ligne somme
 * aux heures de sa source et chaque colonne à la part de sa cible.
 */
function buildFlows(hours: readonly number[], shares: readonly number[]): SankeyFlow[] {
  const total = hours.reduce((sum, value) => sum + value, 0);
  const targetHours = shares.map((share) => (share / 100) * total);
  const matrix = REFERENCE_FLOWS.map((row) => [...row]);

  for (let iteration = 0; iteration < 200; iteration += 1) {
    matrix.forEach((row, rowIndex) => {
      const rowSum = row.reduce((sum, value) => sum + value, 0);
      const factor = (hours[rowIndex] ?? 0) / rowSum;
      row.forEach((value, column) => {
        row[column] = value * factor;
      });
    });
    targetHours.forEach((goal, column) => {
      const columnSum = matrix.reduce((sum, row) => sum + (row[column] ?? 0), 0);
      const factor = goal / columnSum;
      matrix.forEach((row) => {
        row[column] = (row[column] ?? 0) * factor;
      });
    });
  }

  return matrix.flatMap((row, source) =>
    row.flatMap((value, target) => (value > 0 ? [{ source, target, hours: value }] : [])),
  );
}

function dataset(
  period: SankeyPeriod,
  hours: readonly number[],
  shares: readonly number[],
): SankeyDataset {
  return {
    period,
    totalHours: hours.reduce((sum, value) => sum + value, 0),
    sources: SOURCES.map((source, index) => ({ ...source, hours: hours[index] ?? 0 })),
    targets: TARGET_NAMES.map((name, index) => ({ name, share: shares[index] ?? 0 })),
    flows: buildFlows(hours, shares),
  };
}

export const sankeyData: Record<SankeyPeriod, SankeyDataset> = {
  "This week": dataset("This week", [32, 18, 12, 14, 10], [22, 18, 13, 12, 8, 14, 13]),
  "Last week": dataset("Last week", [28, 21, 10, 16, 8], [24, 15, 14, 11, 9, 16, 11]),
  "Last 30 days": dataset("Last 30 days", [128, 84, 46, 62, 38], [21, 19, 12, 14, 8, 13, 13]),
};
