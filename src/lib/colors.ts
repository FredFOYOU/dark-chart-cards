/** Références aux tokens de graphique : aucune valeur de couleur hors de tokens.css. */
export const chartColor = {
  lime: "var(--chart-1)",
  blue: "var(--chart-2)",
  violet: "var(--chart-3)",
  pink: "var(--chart-4)",
  yellow: "var(--chart-5)",
  emerald: "var(--chart-6)",
} as const;

export type ChartColor = (typeof chartColor)[keyof typeof chartColor];
