import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, type BarShapeProps } from "recharts";
import { ChartCard, type Headline } from "@/components/ChartCard";
import { RechartsHoverSync } from "@/components/RechartsHoverSync";
import {
  EARNINGS_PERIODS,
  earningsData,
  type EarningsBar,
  type EarningsDataset,
  type EarningsPeriod,
} from "@/data/earnings";
import { axisProps, useRechartsMotion } from "@/hooks/useRechartsMotion";
import { chartColor } from "@/lib/colors";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

const CHART_HEIGHT = 196;
const AXIS_TICKS = [0, 3000, 5000, 10000];
/** Le rail monte au-dessus du dernier repère : la barre la plus haute dépasse $10K. */
const AXIS_MAX = 12000;
const BAR_RADIUS = 6;
const OUTLINE_GAP = 3;
const ACTIVE_BAR_OPACITY = 0.85;

export interface EarningsChartProps {
  bars: readonly EarningsBar[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}

export function EarningsChart({ bars, activeIndex, setActiveIndex }: EarningsChartProps) {
  const seriesMotion = useRechartsMotion();

  const renderBar = ({ x, y, width, height, index, background }: BarShapeProps) => {
    const barWidth = Number(width);
    const barHeight = Math.max(Number(height), 0);
    const active = activeIndex === index;
    return (
      <g>
        <rect
          x={Number(x)}
          y={Number(y)}
          width={barWidth}
          height={barHeight}
          rx={Math.min(BAR_RADIUS, barWidth / 2, barHeight / 2)}
          fill={chartColor.lime}
          className="chart-focusable"
          style={{ opacity: active ? ACTIVE_BAR_OPACITY : 1 }}
        />
        {active && background && (
          <rect
            x={Number(background.x) - OUTLINE_GAP}
            y={Number(background.y) - OUTLINE_GAP}
            width={Number(background.width) + OUTLINE_GAP * 2}
            height={Number(background.height) + OUTLINE_GAP * 2}
            rx={BAR_RADIUS + OUTLINE_GAP}
            fill="none"
            stroke="var(--border-hover)"
            strokeWidth={1}
          />
        )}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <BarChart
        data={[...bars]}
        accessibilityLayer={false}
        barCategoryGap="18%"
        margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
      >
        <RechartsHoverSync
          labels={bars.map((bar) => bar.label)}
          setActiveIndex={setActiveIndex}
        />
        <XAxis dataKey="label" {...axisProps} tickMargin={6} minTickGap={4} />
        <YAxis
          {...axisProps}
          width={44}
          ticks={AXIS_TICKS}
          interval={0}
          domain={[0, AXIS_MAX]}
          tickFormatter={formatCompactCurrency}
        />
        <Bar
          dataKey="value"
          background={{ fill: "var(--track)", radius: BAR_RADIUS }}
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

export function EarningsCard() {
  return (
    <ChartCard
      title="Earnings chart"
      description="Rounded bars over a track with a period switcher, count-up headline and hover outline."
      label="Earned so far"
      periods={EARNINGS_PERIODS}
      periodControl="tabs"
      stackHeaderWhenNarrow
      getData={getData}
      formatValue={formatCurrency}
      getHeadline={getHeadline}
      chartHeight={CHART_HEIGHT}
      chartLabel="Earnings per month, shown as rounded bars over a gray track"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <EarningsChart bars={data.bars} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      )}
    </ChartCard>
  );
}
