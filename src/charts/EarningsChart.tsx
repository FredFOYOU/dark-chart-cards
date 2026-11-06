import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, type BarShapeProps } from "recharts";
import { ChartCard, type Headline, type StatTile } from "@/components/ChartCard";
import {
  EARNINGS_PERIODS,
  earningsData,
  type EarningsBar,
  type EarningsDataset,
  type EarningsPeriod,
} from "@/data/earnings";
import { RechartsHoverSync } from "@/components/RechartsHoverSync";
import { axisProps, useRechartsMotion } from "@/hooks/useRechartsMotion";
import { chartColor } from "@/lib/colors";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

const OUTLINE_GAP = 2;

export interface EarningsChartProps {
  bars: readonly EarningsBar[];
  ticks: readonly number[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}

export function EarningsChart({ bars, ticks, activeIndex, setActiveIndex }: EarningsChartProps) {
  const seriesMotion = useRechartsMotion();

  const renderBar = ({ x, y, width, height, index }: BarShapeProps) => {
    const barX = Number(x);
    const barY = Number(y);
    const barWidth = Number(width);
    const barHeight = Math.max(Number(height), 0);
    const radius = Math.min(barWidth, barHeight) / 2;
    const active = activeIndex === index;
    const dimmed = activeIndex !== null && !active;
    return (
      <g className="chart-focusable" style={{ opacity: dimmed ? 0.25 : 1 }}>
        <rect x={barX} y={barY} width={barWidth} height={barHeight} rx={radius} fill={chartColor.lime} />
        {active && (
          <rect
            x={barX - OUTLINE_GAP}
            y={barY - OUTLINE_GAP}
            width={barWidth + OUTLINE_GAP * 2}
            height={barHeight + OUTLINE_GAP * 2}
            rx={radius + OUTLINE_GAP}
            fill="none"
            stroke="var(--text)"
            strokeWidth={1}
          />
        )}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={216}>
      <BarChart
        data={[...bars]}
        accessibilityLayer={false}
        barCategoryGap="28%"
        margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
      >
        <RechartsHoverSync
          labels={bars.map((bar) => bar.label)}
          setActiveIndex={setActiveIndex}
        />
        <XAxis dataKey="label" {...axisProps} tickMargin={6} minTickGap={4} />
        <YAxis
          {...axisProps}
          width={42}
          ticks={[...ticks]}
          domain={[0, ticks.at(-1) ?? "auto"]}
          tickFormatter={formatCompactCurrency}
        />
        <Bar
          dataKey="value"
          background={{ fill: "var(--track)", radius: 999 }}
          shape={renderBar}
          {...seriesMotion}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

const getData = (period: EarningsPeriod): EarningsDataset => earningsData[period];

function getHeadline(data: EarningsDataset, activeIndex: number | null): Headline {
  const bar = activeIndex === null ? undefined : data.bars[activeIndex];
  if (bar) return { label: bar.fullLabel, value: bar.value };
  return { value: data.total, delta: data.delta };
}

function getTiles(data: EarningsDataset): StatTile[] {
  const values = data.bars.map((bar) => bar.value);
  const sum = values.reduce((total, value) => total + value, 0);
  return [
    { label: "Highest", value: Math.max(...values), color: chartColor.lime },
    { label: "Average", value: sum / values.length, color: chartColor.lime },
    { label: "Lowest", value: Math.min(...values), color: chartColor.lime },
  ];
}

export function EarningsCard() {
  return (
    <ChartCard
      title="Earnings chart"
      description="Rounded bars over a track with a period switcher, count-up headline and hover outline."
      label="Earned so far"
      periods={EARNINGS_PERIODS}
      defaultPeriod="Monthly"
      periodControl="tabs"
      stackHeaderWhenNarrow
      getData={getData}
      formatValue={formatCurrency}
      getHeadline={getHeadline}
      getTiles={getTiles}
      tileColumns={3}
      highlightActiveTile={false}
      chartLabel="Earnings per period, shown as rounded bars over a gray track"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <EarningsChart
          bars={data.bars}
          ticks={data.ticks}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />
      )}
    </ChartCard>
  );
}
