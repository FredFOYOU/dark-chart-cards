import { useInView } from "motion/react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { PeriodSelect } from "@/components/PeriodSelect";
import { PeriodTabs } from "@/components/PeriodTabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatDelta, type ValueFormatter } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ChartRenderContext<TData> {
  data: TData;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}

export interface Headline {
  /** Remplace le libellé de la carte, par exemple « January » au survol. */
  label?: string;
  value: number;
  /** Variation en points de pourcentage. */
  delta?: number;
  /** Format propre à cette valeur ; par défaut, `formatValue` de la carte. */
  format?: ValueFormatter;
}

export interface StatTile {
  label: string;
  value: number;
  /** Pastille de couleur ; absente quand la tuile ne désigne pas une série. */
  color?: string;
  /** Format propre à la tuile ; par défaut, `formatValue` de la carte. */
  format?: ValueFormatter;
}

export type TileColumns = 2 | 3 | 4;

const TILE_GAP = 6;
/** Sur une carte étroite, 3 ou 4 colonnes passent à 2 pour ne pas tronquer les libellés. */
const TILE_COLUMN_CLASS: Record<TileColumns, string> = {
  2: "[--tile-cols:2]",
  3: "[--tile-cols:2] @sm:[--tile-cols:3]",
  4: "[--tile-cols:2] @md:[--tile-cols:4]",
};
/** La largeur de base fixe les colonnes ; `flex-grow` étire les tuiles d'une ligne incomplète. */
const TILE_FLEX = `1 1 calc((100% - (var(--tile-cols) - 1) * ${TILE_GAP}px) / var(--tile-cols) - 0.1px)`;

export interface ChartCardProps<TData, TPeriod extends string> {
  title: string;
  description: string;
  label: string;
  periods: readonly TPeriod[];
  defaultPeriod?: TPeriod;
  /** `tabs` affiche des pills segmentées à la place du menu déroulant. */
  periodControl?: "menu" | "tabs";
  /** Sur une carte étroite, place le sélecteur sous le chiffre (libellé long ou pills larges). */
  stackHeaderWhenNarrow?: boolean;
  getData: (period: TPeriod) => TData;
  formatValue: ValueFormatter;
  getHeadline: (data: TData, activeIndex: number | null) => Headline;
  /** Certaines cartes n'ont pas de tuiles (Earnings, Sankey). */
  getTiles?: (data: TData, activeIndex: number | null) => StatTile[];
  tileColumns?: TileColumns;
  /** Désactivé quand `activeIndex` ne désigne pas une tuile (un mois, par exemple). */
  highlightActiveTile?: boolean;
  /** Hauteur réservée : le graphique n'est monté, donc animé, qu'une fois visible à l'écran. */
  chartHeight: number;
  /** Description du graphique pour les technologies d'assistance. */
  chartLabel: string;
  children: (context: ChartRenderContext<TData>) => ReactNode;
}

export function ChartCard<TData, TPeriod extends string>({
  title,
  description,
  label,
  periods,
  defaultPeriod,
  periodControl = "menu",
  stackHeaderWhenNarrow = false,
  getData,
  formatValue,
  getHeadline,
  getTiles,
  tileColumns = 3,
  highlightActiveTile = true,
  chartHeight,
  chartLabel,
  children,
}: ChartCardProps<TData, TPeriod>) {
  const [period, setPeriod] = useState<TPeriod | undefined>(defaultPeriod ?? periods[0]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartVisible = useInView(chartRef, { once: true, amount: 0.15 });

  if (period === undefined) {
    throw new Error(`ChartCard "${title}" needs at least one period.`);
  }

  const data = useMemo(() => getData(period), [getData, period]);
  const headline = getHeadline(data, activeIndex);
  const tiles = getTiles?.(data, activeIndex);
  const PeriodControl = periodControl === "tabs" ? PeriodTabs : PeriodSelect;
  const tilesInFocus = highlightActiveTile && activeIndex !== null;

  return (
    <Card className="@container flex flex-col">
      <div className="flex flex-1 flex-col rounded-inner bg-card-inner">
        <header
          className={cn(
            "flex items-start justify-between gap-3 p-3.5 pb-2.5",
            stackHeaderWhenNarrow && "@max-sm:flex-col",
          )}
        >
          <div className="max-w-full min-w-0">
            <p className="truncate text-[13px] leading-[18px] text-muted">
              {headline.label ?? label}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <AnimatedNumber
                value={headline.value}
                format={headline.format ?? formatValue}
                dimWhileCounting
                className="text-[22px] leading-7 font-medium tracking-tight text-text"
              />
              {headline.delta !== undefined && <Badge>{formatDelta(headline.delta)}</Badge>}
            </div>
          </div>
          <PeriodControl
            periods={periods}
            value={period}
            onChange={setPeriod}
            chartName={title}
          />
        </header>

        <div
          ref={chartRef}
          role="group"
          aria-label={chartLabel}
          className="flex flex-1 flex-col justify-center px-3.5 pb-3"
          style={{ minHeight: chartHeight }}
        >
          {chartVisible && children({ data, activeIndex, setActiveIndex })}
        </div>

        {tiles && (
          <ul
            className={cn("flex flex-wrap p-1.5 pt-0", TILE_COLUMN_CLASS[tileColumns])}
            style={{ gap: TILE_GAP }}
          >
            {tiles.map((tile, index) => {
              const active = tilesInFocus && index === activeIndex;
              return (
                <li
                  key={index}
                  data-active={active}
                  data-dimmed={tilesInFocus && !active}
                  className="min-w-0 rounded-[9px] bg-tile px-2.5 py-2 transition-[background-color,opacity] duration-200 ease-out data-[active=true]:bg-tile-active data-[dimmed=true]:opacity-50"
                  style={{ flex: TILE_FLEX }}
                >
                  <div className="flex items-center gap-1.5">
                    {tile.color && (
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0 rounded-[3px]"
                        style={{ backgroundColor: tile.color }}
                      />
                    )}
                    {/* Sur la tuile active, le libellé passe en blanc pour rester au-dessus de 4.5:1. */}
                    <span
                      className={cn(
                        "truncate text-[13px] leading-4 transition-colors duration-200 ease-out",
                        active ? "text-text" : "text-muted",
                      )}
                    >
                      {tile.label}
                    </span>
                  </div>
                  <AnimatedNumber
                    value={tile.value}
                    format={tile.format ?? formatValue}
                    className="mt-0.5 block text-[13px] leading-4 font-medium text-text"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="px-1 pt-3 pb-0.5">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-1">{description}</CardDescription>
      </div>
    </Card>
  );
}
