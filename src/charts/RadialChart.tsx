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
import { useElementWidth } from "@/hooks/useElementSize";
import { useFadeIn } from "@/hooks/useFadeIn";
import { useTweenedValues } from "@/hooks/useTweenedValues";
import { formatNumber } from "@/lib/format";
import { arcPath, focusableMark } from "@/lib/svg";

const CHART_HEIGHT = 268;
const RING_WIDTH = 18;
const RING_GAP = 4;
const OUTER_RADIUS = 130;
/** La plus grande série couvre cette part du cercle. */
const MAX_SWEEP = 0.85 * 2 * Math.PI;
const LABEL_OFFSET = 4;

export interface RadialChartProps {
  series: readonly BrowserShare[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}

export function RadialChart({ series, activeIndex, setActiveIndex }: RadialChartProps) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const pathPrefix = useId().replaceAll(":", "");
  const labelFade = useFadeIn(0.3, 0.3);
  const maxValue = Math.max(...series.map((item) => item.value));
  const sweeps = useTweenedValues(series.map((item) => (item.value / maxValue) * MAX_SWEEP));
  const cx = width / 2;
  const cy = CHART_HEIGHT / 2;

  return (
    <div ref={containerRef}>
      {width > 0 && (
        <svg width={width} height={CHART_HEIGHT} className="block">
          {series.map((item, index) => {
            const radius = OUTER_RADIUS - RING_WIDTH / 2 - index * (RING_WIDTH + RING_GAP);
            const sweep = sweeps[index] ?? 0;
            const dimmed = activeIndex !== null && activeIndex !== index;
            const pathId = `${pathPrefix}-ring-${index}`;
            const d = arcPath(cx, cy, radius, 0, sweep);
            return (
              <g
                key={item.name}
                className="chart-focusable"
                style={{ opacity: dimmed ? 0.25 : 1 }}
                {...focusableMark(index, setActiveIndex, `${item.name}: ${formatNumber(item.value)}`)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke="var(--track)"
                  strokeWidth={RING_WIDTH}
                />
                {sweep > 0.001 && (
                  <path
                    id={pathId}
                    d={d}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={RING_WIDTH}
                    strokeLinecap="round"
                  />
                )}
                <motion.text
                  {...labelFade}
                  fill="var(--pill)"
                  fontSize={10}
                  fontWeight={600}
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
      )}
    </div>
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
      description="Concentric rings over tracks with rounded caps and each series name written along its arc."
      label="Visitors"
      periods={BROWSER_PERIODS}
      defaultPeriod="Last 30 days"
      getData={getData}
      formatValue={formatNumber}
      getHeadline={getHeadline}
      getTiles={getTiles}
      tileColumns={3}
      chartLabel="Visitors per browser, as five concentric rings"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <RadialChart series={data.series} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      )}
    </ChartCard>
  );
}
