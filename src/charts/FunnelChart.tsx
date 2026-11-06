import { motion } from "motion/react";
import { ChartCard, type Headline, type StatTile } from "@/components/ChartCard";
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

const CHART_HEIGHT = 140;
const MAX_BAND_HEIGHT = 118;
/** Le halo dépasse la bande d'une marge fixe, y compris sur les petites étapes. */
const HALO_EXTRA = 20;
/** Part de la colonne où la bande reste plate avant de rejoindre l'étape suivante. */
const FLAT_RATIO = 0.55;
const SEPARATOR_WIDTH = 2.5;
const PILL_WIDTH = 40;
const PILL_HEIGHT = 18;

const round = (value: number) => Math.round(value * 100) / 100;
const haloHeight = (height: number) => (height > 0 ? height + HALO_EXTRA : 0);

/**
 * Une étape reste plate, puis son raccord rejoint la hauteur de l'étape suivante
 * exactement sur le séparateur. La dernière étape reste plate jusqu'au bout.
 */
function stagePath(
  index: number,
  heights: readonly number[],
  width: number,
  variant: FunnelVariant,
): string {
  const columnWidth = width / heights.length;
  const center = CHART_HEIGHT / 2;
  const left = round(index * columnWidth);
  const right = round(left + columnWidth);
  const flatEnd = round(left + columnWidth * FLAT_RATIO);
  const controlX = round((flatEnd + right) / 2);
  const half = (heights[index] ?? 0) / 2;
  const nextHalf = (heights[index + 1] ?? heights[index] ?? 0) / 2;

  const topY = round(center - half);
  const nextTopY = round(center - nextHalf);
  const bottomY = round(center + half);
  const nextBottomY = round(center + nextHalf);

  const topJoin =
    variant === "curved"
      ? `C ${controlX} ${topY} ${controlX} ${nextTopY} ${right} ${nextTopY}`
      : `L ${right} ${nextTopY}`;
  const bottomJoin =
    variant === "curved"
      ? `C ${controlX} ${nextBottomY} ${controlX} ${bottomY} ${flatEnd} ${bottomY}`
      : `L ${flatEnd} ${bottomY}`;

  return [
    `M ${left} ${topY}`,
    `L ${flatEnd} ${topY}`,
    topJoin,
    `L ${right} ${nextBottomY}`,
    bottomJoin,
    `L ${left} ${bottomY}`,
    "Z",
  ].join(" ");
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
  const center = CHART_HEIGHT / 2;

  return (
    <div ref={containerRef}>
      {width > 0 && (
        <svg width={width} height={CHART_HEIGHT} className="block">
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
                    y={center - PILL_HEIGHT / 2}
                    width={PILL_WIDTH}
                    height={PILL_HEIGHT}
                    rx={PILL_HEIGHT / 2}
                    fill="var(--pill)"
                  />
                  <text
                    x={centerX}
                    y={center}
                    dy="0.35em"
                    textAnchor="middle"
                    fill="var(--text)"
                    fontSize={11}
                    fontWeight={500}
                  >
                    {formatPercent(percent)}
                  </text>
                </motion.g>
              </g>
            );
          })}
          {stages.slice(1).map((stage, index) => {
            const halfSpan = (halos[index + 1] ?? 0) / 2 + 1;
            return (
              <line
                key={stage.label}
                x1={columnWidth * (index + 1)}
                x2={columnWidth * (index + 1)}
                y1={center - halfSpan}
                y2={center + halfSpan}
                stroke="var(--pill)"
                strokeWidth={SEPARATOR_WIDTH}
                pointerEvents="none"
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}

const getData = (period: FunnelPeriod): FunnelDataset => funnelData[period];

function getHeadline(data: FunnelDataset, activeIndex: number | null): Headline {
  const stage = activeIndex === null ? undefined : data.stages[activeIndex];
  if (stage) return { label: stage.label, value: stage.value };
  return { value: data.stages[0]?.value ?? 0, delta: data.delta };
}

function getTiles(data: FunnelDataset): StatTile[] {
  return data.stages.map(({ label, value, color }) => ({ label, value, color }));
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
      chartHeight={CHART_HEIGHT}
      chartLabel="Sign-up funnel: four tapering stages from link opened to converted"
    >
      {({ data, activeIndex, setActiveIndex }) => (
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
