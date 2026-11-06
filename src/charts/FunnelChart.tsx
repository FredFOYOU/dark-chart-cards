import { motion } from "motion/react";
import { ChartCard, type ChartRenderContext, type Headline, type StatTile } from "@/components/ChartCard";
import {
  FUNNEL_PERIODS,
  funnelData,
  type FunnelDataset,
  type FunnelPeriod,
  type FunnelStage,
} from "@/data/funnel";
import { useElementWidth } from "@/hooks/useElementSize";
import { useFadeIn } from "@/hooks/useFadeIn";
import { useTweenedValues } from "@/hooks/useTweenedValues";
import { formatNumber, formatPercent } from "@/lib/format";
import { focusableMark } from "@/lib/svg";

export type FunnelVariant = "curved" | "sharp";

const CHART_HEIGHT = 216;
const MAX_BAND_HEIGHT = 148;
const TRANSITION_RATIO = 0.5;
const END_RADIUS = 12;
const PILL_WIDTH = 46;
const PILL_HEIGHT = 24;

/** Le halo garde la forme de la bande, avec une marge fixe pour rester visible sur les petites étapes. */
const haloHeight = (height: number) => height * 1.16 + (height > 0 ? 20 : 0);

interface Point {
  x: number;
  y: number;
}

/** Morceau de bord : ligne droite, ou cubique si des points de contrôle sont présents. */
interface EdgePiece {
  from: Point;
  to: Point;
  c1?: Point;
  c2?: Point;
}

const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const round = (value: number) => Math.round(value * 100) / 100;
const pt = ({ x, y }: Point) => `${round(x)} ${round(y)}`;

/**
 * Raccord entre deux étapes, coupé au milieu (de Casteljau) : chaque étape possède sa moitié,
 * et le séparateur tombe exactement sur la jonction des couleurs.
 */
function transitionHalves(from: Point, to: Point, variant: FunnelVariant): [EdgePiece, EdgePiece] {
  const center = mid(from, to);
  if (variant === "sharp") {
    return [
      { from, to: center },
      { from: center, to },
    ];
  }
  const p1: Point = { x: center.x, y: from.y };
  const p2: Point = { x: center.x, y: to.y };
  const q0 = mid(from, p1);
  const q1 = mid(p1, p2);
  const q2 = mid(p2, to);
  const r0 = mid(q0, q1);
  const r1 = mid(q1, q2);
  return [
    { from, c1: q0, c2: r0, to: center },
    { from: center, c1: r1, c2: q2, to },
  ];
}

function drawForward(pieces: readonly EdgePiece[]): string {
  return pieces
    .map(({ c1, c2, to }) => (c1 && c2 ? `C ${pt(c1)} ${pt(c2)} ${pt(to)}` : `L ${pt(to)}`))
    .join(" ");
}

function drawBackward(pieces: readonly EdgePiece[]): string {
  return [...pieces]
    .reverse()
    .map(({ c1, c2, from }) => (c1 && c2 ? `C ${pt(c2)} ${pt(c1)} ${pt(from)}` : `L ${pt(from)}`))
    .join(" ");
}

/** Bord d'une étape, de gauche à droite. `side` vaut -1 pour le haut et 1 pour le bas. */
function stageEdge(
  index: number,
  heights: readonly number[],
  width: number,
  side: -1 | 1,
  variant: FunnelVariant,
): EdgePiece[] {
  const count = heights.length;
  const columnWidth = width / count;
  const transition = columnWidth * TRANSITION_RATIO;
  const center = CHART_HEIGHT / 2;
  const yAt = (stage: number) => center + (side * (heights[stage] ?? 0)) / 2;
  const left = index * columnWidth;
  const right = left + columnWidth;
  const y = yAt(index);
  const pieces: EdgePiece[] = [];

  const flatStart: Point = { x: index === 0 ? left : left + transition / 2, y };
  const flatEnd: Point = { x: index === count - 1 ? right : right - transition / 2, y };

  if (index > 0) {
    const [, half] = transitionHalves(
      { x: left - transition / 2, y: yAt(index - 1) },
      flatStart,
      variant,
    );
    pieces.push(half);
  }
  pieces.push({ from: flatStart, to: flatEnd });
  if (index < count - 1) {
    const [half] = transitionHalves(flatEnd, { x: right + transition / 2, y: yAt(index + 1) }, variant);
    pieces.push(half);
  }
  return pieces;
}

function stagePath(
  index: number,
  heights: readonly number[],
  width: number,
  variant: FunnelVariant,
): string {
  const top = stageEdge(index, heights, width, -1, variant);
  const bottom = stageEdge(index, heights, width, 1, variant);
  const topStart = top[0]?.from;
  const topEnd = top.at(-1)?.to;
  const bottomStart = bottom[0]?.from;
  const bottomEnd = bottom.at(-1)?.to;
  if (!topStart || !topEnd || !bottomStart || !bottomEnd) return "";

  const radius = Math.min(END_RADIUS, (heights[index] ?? 0) / 2);
  const isFirst = index === 0;
  const isLast = index === heights.length - 1;

  // Les extrémités extérieures du ruban sont arrondies, sauf aux jonctions entre étapes.
  const inset = (pieces: EdgePiece[], dx: number, atStart: boolean) => {
    const piece = atStart ? pieces[0] : pieces.at(-1);
    if (!piece) return;
    if (atStart) piece.from = { ...piece.from, x: piece.from.x + dx };
    else piece.to = { ...piece.to, x: piece.to.x + dx };
  };
  if (isFirst) {
    inset(top, radius, true);
    inset(bottom, radius, true);
  }
  if (isLast) {
    inset(top, -radius, false);
    inset(bottom, -radius, false);
  }

  const startX = isFirst ? topStart.x + radius : topStart.x;
  const parts = [`M ${pt({ x: startX, y: topStart.y })}`, drawForward(top)];
  if (isLast) {
    parts.push(
      `Q ${pt(topEnd)} ${pt({ x: topEnd.x, y: topEnd.y + radius })}`,
      `L ${pt({ x: bottomEnd.x, y: bottomEnd.y - radius })}`,
      `Q ${pt(bottomEnd)} ${pt({ x: bottomEnd.x - radius, y: bottomEnd.y })}`,
    );
  } else {
    parts.push(`L ${pt(bottomEnd)}`);
  }
  parts.push(drawBackward(bottom));
  if (isFirst) {
    parts.push(
      `Q ${pt(bottomStart)} ${pt({ x: bottomStart.x, y: bottomStart.y - radius })}`,
      `L ${pt({ x: topStart.x, y: topStart.y + radius })}`,
      `Q ${pt(topStart)} ${pt({ x: topStart.x + radius, y: topStart.y })}`,
    );
  }
  parts.push("Z");
  return parts.join(" ");
}

export interface FunnelChartProps {
  stages: readonly FunnelStage[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  variant?: FunnelVariant;
}

export function FunnelChart({
  stages,
  activeIndex,
  setActiveIndex,
  variant = "curved",
}: FunnelChartProps) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const pillFade = useFadeIn(0.3, 0.3);
  const firstValue = stages[0]?.value ?? 1;
  const heights = useTweenedValues(
    stages.map((stage) => (stage.value / firstValue) * MAX_BAND_HEIGHT),
  );
  const halos = heights.map(haloHeight);
  const columnWidth = width / stages.length;

  return (
    <div ref={containerRef} onMouseLeave={() => setActiveIndex(null)}>
      {width > 0 && (
        <svg width={width} height={CHART_HEIGHT} className="block overflow-visible">
          {stages.map((stage, index) => {
            const percent = (stage.value / firstValue) * 100;
            const dimmed = activeIndex !== null && activeIndex !== index;
            const centerX = columnWidth * (index + 0.5);
            return (
              <g
                key={stage.label}
                className="chart-focusable"
                style={{ opacity: dimmed ? 0.25 : 1 }}
                {...focusableMark(
                  index,
                  setActiveIndex,
                  `${stage.label}: ${formatNumber(stage.value)}, ${formatPercent(percent)} of ${stages[0]?.label ?? "total"}`,
                )}
              >
                {/* Cible de survol : toute la colonne, pas seulement la bande. */}
                <rect
                  x={columnWidth * index}
                  y={0}
                  width={columnWidth}
                  height={CHART_HEIGHT}
                  fill="transparent"
                />
                <path d={stagePath(index, halos, width, variant)} fill={stage.color} opacity={0.25} />
                <path d={stagePath(index, heights, width, variant)} fill={stage.color} />
                <motion.g {...pillFade}>
                  <rect
                    x={centerX - PILL_WIDTH / 2}
                    y={CHART_HEIGHT / 2 - PILL_HEIGHT / 2}
                    width={PILL_WIDTH}
                    height={PILL_HEIGHT}
                    rx={8}
                    fill="var(--pill)"
                  />
                  <text
                    x={centerX}
                    y={CHART_HEIGHT / 2}
                    dy="0.35em"
                    textAnchor="middle"
                    fill="var(--text)"
                    fontSize={12}
                    fontWeight={500}
                  >
                    {formatPercent(percent)}
                  </text>
                </motion.g>
              </g>
            );
          })}
          {stages.slice(1).map((stage, index) => (
            <line
              key={stage.label}
              x1={columnWidth * (index + 1)}
              x2={columnWidth * (index + 1)}
              y1={0}
              y2={CHART_HEIGHT}
              stroke="var(--card-inner)"
              strokeWidth={2}
              pointerEvents="none"
            />
          ))}
        </svg>
      )}
    </div>
  );
}

const getData = (period: FunnelPeriod): FunnelDataset => funnelData[period];

function getHeadline(data: FunnelDataset, activeIndex: number | null): Headline {
  const stage = activeIndex === null ? undefined : data.stages[activeIndex];
  if (stage) return { label: stage.label, value: stage.value, delta: stage.delta };
  return { value: data.stages[0]?.value ?? 0, delta: data.delta };
}

function getTiles(data: FunnelDataset): StatTile[] {
  return data.stages.map(({ label, value, color }) => ({
    label,
    value,
    color,
  }));
}

export function FunnelCard({ variant = "curved" }: { variant?: FunnelVariant }) {
  return (
    <ChartCard
      title="Funnel chart"
      description="Tapered stages with conversion pills, curved or sharp, and stat tiles under every column."
      label="Sign-up funnel"
      periods={FUNNEL_PERIODS}
      defaultPeriod="Last 30 days"
      getData={getData}
      formatValue={formatNumber}
      getHeadline={getHeadline}
      getTiles={getTiles}
      tileColumns={4}
      chartLabel="Sign-up funnel: four tapering stages from link opened to converted"
    >
      {({ data, activeIndex, setActiveIndex }: ChartRenderContext<FunnelDataset>) => (
        <FunnelChart
          stages={data.stages}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          variant={variant}
        />
      )}
    </ChartCard>
  );
}
