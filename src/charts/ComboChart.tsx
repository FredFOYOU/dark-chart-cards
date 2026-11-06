import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type BarShapeProps,
} from "recharts";
import { ChartCard, type Headline, type StatTile } from "@/components/ChartCard";
import { RechartsHoverSync } from "@/components/RechartsHoverSync";
import {
  SESSION_PERIODS,
  sessionData,
  type SessionDataset,
  type SessionPeriod,
  type SessionPoint,
} from "@/data/sessions";
import { axisProps, useRechartsMotion } from "@/hooks/useRechartsMotion";
import { chartColor } from "@/lib/colors";
import {
  formatCompact,
  formatNumber,
  formatPercent,
  formatPercentOneDecimal,
} from "@/lib/format";

const SESSION_TICKS = [3500, 7000, 10500];
const CONVERSION_TICKS = [2, 4, 6];
const BAR_RADIUS = 6;

export interface ComboChartProps {
  points: readonly SessionPoint[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}

interface ConversionDotProps {
  cx?: number;
  cy?: number;
  index?: number;
}

export function ComboChart({ points, activeIndex, setActiveIndex }: ComboChartProps) {
  const seriesMotion = useRechartsMotion();
  const isDimmed = (index: number) => activeIndex !== null && activeIndex !== index;

  const renderBar = ({ x, y, width, height, index }: BarShapeProps) => (
    <rect
      x={Number(x)}
      y={Number(y)}
      width={Number(width)}
      height={Math.max(Number(height), 0)}
      rx={Math.min(BAR_RADIUS, Number(width) / 2, Math.max(Number(height), 0) / 2)}
      fill={chartColor.lime}
      className="chart-focusable"
      style={{ opacity: isDimmed(index) ? 0.25 : 1 }}
    />
  );

  const renderDot = ({ cx, cy, index }: ConversionDotProps) => (
    <circle
      key={index}
      cx={cx}
      cy={cy}
      r={activeIndex === index ? 5 : 3}
      fill={chartColor.blue}
      stroke="var(--card-inner)"
      strokeWidth={2}
    />
  );

  return (
    <ResponsiveContainer width="100%" height={232}>
      <ComposedChart
        data={[...points]}
        accessibilityLayer={false}
        barCategoryGap="24%"
        margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
      >
        <RechartsHoverSync
          labels={points.map((point) => point.month)}
          setActiveIndex={setActiveIndex}
        />
        <XAxis dataKey="month" {...axisProps} tickMargin={6} minTickGap={4} />
        <YAxis
          yAxisId="sessions"
          {...axisProps}
          width={40}
          domain={[SESSION_TICKS[0] ?? 0, SESSION_TICKS.at(-1) ?? "auto"]}
          ticks={SESSION_TICKS}
          tickFormatter={formatCompact}
        />
        <YAxis
          yAxisId="conversion"
          orientation="right"
          {...axisProps}
          width={32}
          domain={[CONVERSION_TICKS[0] ?? 0, CONVERSION_TICKS.at(-1) ?? "auto"]}
          ticks={CONVERSION_TICKS}
          tickFormatter={formatPercent}
        />
        <Bar yAxisId="sessions" dataKey="sessions" shape={renderBar} {...seriesMotion} />
        <Line
          yAxisId="conversion"
          dataKey="conversion"
          type="monotone"
          stroke={chartColor.blue}
          strokeWidth={2}
          dot={renderDot}
          activeDot={false}
          {...seriesMotion}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

const getData = (period: SessionPeriod): SessionDataset => sessionData[period];

function getHeadline(data: SessionDataset, activeIndex: number | null): Headline {
  const point = activeIndex === null ? undefined : data.points[activeIndex];
  if (point) {
    return {
      label: `${point.month} · Conversion ${formatPercentOneDecimal(point.conversion)}`,
      value: point.sessions,
    };
  }
  return {
    label: `Sessions · Conversion ${formatPercentOneDecimal(data.conversion)}`,
    value: data.points.reduce((total, { sessions }) => total + sessions, 0),
    delta: data.delta,
  };
}

function getTiles(data: SessionDataset, activeIndex: number | null): StatTile[] {
  const point = activeIndex === null ? undefined : data.points[activeIndex];
  return [
    {
      label: "Sessions",
      value: point ? point.sessions : data.points.reduce((total, { sessions }) => total + sessions, 0),
      color: chartColor.lime,
    },
    {
      label: "Conversion",
      value: point ? point.conversion : data.conversion,
      color: chartColor.blue,
      format: formatPercentOneDecimal,
    },
  ];
}

export function ComboCard() {
  return (
    <ChartCard
      title="Combo chart"
      description="Rounded bars and a dotted line on two axes, with the headline following the hovered month."
      label="Sessions"
      periods={SESSION_PERIODS}
      stackHeaderWhenNarrow
      getData={getData}
      formatValue={formatNumber}
      getHeadline={getHeadline}
      getTiles={getTiles}
      tileColumns={2}
      highlightActiveTile={false}
      chartLabel="Monthly sessions as bars, with the conversion rate as a line"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <ComboChart points={data.points} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      )}
    </ChartCard>
  );
}
