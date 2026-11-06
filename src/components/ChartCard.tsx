import { useMemo, useState, type ReactNode } from "react";
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
}

export interface StatTile {
  label: string;
  value: number;
  color: string;
  /** Format propre à la tuile ; par défaut, `formatValue` de la carte. */
  format?: ValueFormatter;
}

export type TileColumns = 2 | 3 | 4;

/** Requêtes de conteneur : les tuiles suivent la largeur de la carte, pas celle de l'écran. */
const TILE_GRID: Record<TileColumns, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 @sm:grid-cols-3",
  4: "grid-cols-2 @md:grid-cols-4",
};

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
  getTiles: (data: TData, activeIndex: number | null) => StatTile[];
  tileColumns: TileColumns;
  /** Désactivé quand `activeIndex` ne désigne pas une tuile (un mois, par exemple). */
  highlightActiveTile?: boolean;
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
  tileColumns,
  highlightActiveTile = true,
  chartLabel,
  children,
}: ChartCardProps<TData, TPeriod>) {
  const [period, setPeriod] = useState<TPeriod | undefined>(defaultPeriod ?? periods[0]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (period === undefined) {
    throw new Error(`ChartCard "${title}" needs at least one period.`);
  }

  const data = useMemo(() => getData(period), [getData, period]);
  const headline = getHeadline(data, activeIndex);
  const tiles = getTiles(data, activeIndex);
  const PeriodControl = periodControl === "tabs" ? PeriodTabs : PeriodSelect;

  return (
    <Card className="@container flex flex-col">
      <div className="flex flex-1 flex-col rounded-inner bg-card-inner">
        <header
          className={cn(
            "flex items-start justify-between gap-3 p-4 pb-3",
            stackHeaderWhenNarrow && "@max-sm:flex-col",
          )}
        >
          <div className="max-w-full min-w-0">
            <p className="truncate text-[14px] leading-5 text-muted">{headline.label ?? label}</p>
            <div className="mt-1 flex items-center gap-2">
              <AnimatedNumber
                value={headline.value}
                format={formatValue}
                className="text-[28px] leading-9 font-semibold tracking-tight text-text"
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
          role="group"
          aria-label={chartLabel}
          className="flex flex-1 flex-col justify-center px-4 pb-3"
        >
          {children({ data, activeIndex, setActiveIndex })}
        </div>

        <ul className={cn("grid gap-1.5 p-1.5 pt-0", TILE_GRID[tileColumns])}>
          {tiles.map((tile, index) => {
            const active = highlightActiveTile && index === activeIndex;
            // Une ligne incomplète : la dernière tuile la comble, sur 2 comme sur 3 colonnes.
            const isLast = index === tiles.length - 1;
            const fillsTwoColumnRow = tileColumns === 3 && isLast && tiles.length % 2 === 1;
            const fillsThreeColumnRow = tileColumns === 3 && isLast && tiles.length % 3 === 2;
            return (
              <li
                key={index}
                data-active={active}
                className={cn(
                  "min-w-0 rounded-[10px] bg-tile px-3 py-2.5 transition-colors duration-200 ease-out data-[active=true]:bg-tile-active",
                  fillsTwoColumnRow && "col-span-2",
                  fillsTwoColumnRow && !fillsThreeColumnRow && "@sm:col-span-1",
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: tile.color }}
                  />
                  {/* Sur la tuile active, le libellé passe en blanc pour rester au-dessus de 4.5:1. */}
                  <span
                    className={cn(
                      "truncate text-[13px] leading-[18px] transition-colors duration-200 ease-out",
                      active ? "text-text" : "text-muted",
                    )}
                  >
                    {tile.label}
                  </span>
                </div>
                <AnimatedNumber
                  value={tile.value}
                  format={tile.format ?? formatValue}
                  className="mt-1 block text-[14px] leading-5 font-medium text-text"
                />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="px-3 pt-3 pb-2.5">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-0.5">{description}</CardDescription>
      </div>
    </Card>
  );
}
