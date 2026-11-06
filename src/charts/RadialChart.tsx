import { motion } from "motion/react";
import { useId } from "react";
import { ChartCard, type Headline, type StatTile } from "@/components/ChartCard";
import {
  BROWSER_PERIODS,
  browserData,
  type BrowserDataset,
  type BrowserPeriod,
  type BrowserShare,
} from "@/data/browsers";
import { useFadeIn } from "@/hooks/useFadeIn";
import { useTweenedValues } from "@/hooks/useTweenedValues";
import { formatNumber } from "@/lib/format";
import { arcPath, focusableMark } from "@/lib/svg";

const CHART_SIZE = 184;
const RING_WIDTH = 12;
const RING_PITCH = 14;
const INNER_RADIUS = 28;
/** La plus grande série couvre cette part du cercle. */
const MAX_SWEEP = 0.9 * 2 * Math.PI;
const LABEL_OFFSET = 4;

export interface RadialChartProps {
  series: readonly BrowserShare[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}

export function RadialChart({ series, activeIndex, setActiveIndex }: RadialChartProps) {
  const pathPrefix = useId().replaceAll(":", "");
  const labelFade = useFadeIn(0.3, 0.3);
  const maxValue = Math.max(...series.map((item) => item.value));
  const sweeps = useTweenedValues(series.map((item) => (item.value / maxValue) * MAX_SWEEP));
  const center = CHART_SIZE / 2;

  return (
    <svg width={CHART_SIZE} height={CHART_SIZE} className="mx-auto block">
      {series.map((item, index) => {
        const radius = INNER_RADIUS + index * RING_PITCH;
        const sweep = sweeps[index] ?? 0;
        const dimmed = activeIndex !== null && activeIndex !== index;
        const pathId = `${pathPrefix}-ring-${index}`;
        return (
          <g
            key={item.name}
            className="chart-focusable"
            style={{ opacity: dimmed ? 0.25 : 1 }}
            {...focusableMark(index, setActiveIndex, `${item.name}: ${formatNumber(item.value)}`)}
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="var(--track)"
              strokeWidth={RING_WIDTH}
            />
            {sweep > 0.001 && (
              <path
                id={pathId}
                d={arcPath(center, center, radius, 0, sweep)}
                fill="none"
                stroke={item.color}
                strokeWidth={RING_WIDTH}
                strokeLinecap="round"
              />
            )}
            <motion.text
              {...labelFade}
              fill="var(--pill)"
              fontSize={8.5}
              fontWeight={500}
              dominantBaseline="central"
              pointerEvents="none"
            >
              <textPath href={`#${pathId}`} startOffset={LABEL_OFFSET}>
                {item.name}
              </textPath>
            </motion.text>
          </g>
        );
      })}
    </svg>
  );
}

const getData = (period: BrowserPeriod): BrowserDataset => browserData[period];

function getHeadline(data: BrowserDataset, activeIndex: number | null): Headline {
  const item = activeIndex === null ? undefined : data.series[activeIndex];
  if (item) return { label: item.name, value: item.value };
  return {
    value: data.series.reduce((total, { value }) => total + value, 0),
    delta: data.delta,
  };
}

function getTiles(data: BrowserDataset): StatTile[] {
  return data.series.map(({ name, value, color }) => ({ label: name, value, color }));
}

export function RadialCard() {
  return (
    <ChartCard
      title="Radial chart"
      description="Concentric rings on a shared track, each labeled along its arc. Hover one to fade the others and sync the headline and tile."
      label="Visitors"
      periods={BROWSER_PERIODS}
      getData={getData}
      formatValue={formatNumber}
      getHeadline={getHeadline}
      getTiles={getTiles}
      tileColumns={3}
      chartHeight={CHART_SIZE}
      chartLabel="Visitors per browser, as five concentric rings"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <RadialChart series={data.series} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      )}
    </ChartCard>
  );
}
