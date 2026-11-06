import {
  Bar,
  CartesianGrid,
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
import { axisProps, gridProps, useRechartsMotion } from "@/hooks/useRechartsMotion";
import { chartColor } from "@/lib/colors";
import {
  formatCompact,
  formatNumber,
  formatPercent,
  formatPercentOneDecimal,
} from "@/lib/format";

const CHART_HEIGHT = 172;
const SESSION_TICKS = [0, 3500, 7000, 10500];
const CONVERSION_TICKS = [0, 2, 4, 6];
const BAR_RADIUS = 6;
const LINE_WIDTH = 2;
/** Liseré sombre sous la ligne : elle reste lisible en passant sur les barres. */
const CASING_WIDTH = 6;

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
      style={{ opacity: isDimmed(index) ? 0.3 : 1 }}
    />
  );

  const renderDot = ({ cx, cy, index }: ConversionDotProps) => (
    <circle
      key={index}
      cx={cx}
      cy={cy}
      r={activeIndex === index ? 4 : 2.5}
      fill={chartColor.blue}
      stroke="var(--card-inner)"
      strokeWidth={1.5}
    />
  );

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <ComposedChart
        data={[...points]}
        accessibilityLayer={false}
        barCategoryGap="21%"
        margin={{ top: 6, right: 0, bottom: 0, left: 0 }}
      >
        <RechartsHoverSync
          labels={points.map((point) => point.month)}
          setActiveIndex={setActiveIndex}
        />
        <CartesianGrid yAxisId="sessions" {...gridProps} />
        <XAxis dataKey="month" {...axisProps} tickMargin={6} minTickGap={4} />
        <YAxis
          yAxisId="sessions"
          {...axisProps}
          width={38}
          domain={[0, SESSION_TICKS.at(-1) ?? "auto"]}
          ticks={SESSION_TICKS}
          tickFormatter={formatCompact}
        />
        <YAxis
          yAxisId="conversion"
          orientation="right"
          {...axisProps}
          width={30}
          domain={[0, CONVERSION_TICKS.at(-1) ?? "auto"]}
          ticks={CONVERSION_TICKS}
          tickFormatter={formatPercent}
        />
        <Bar yAxisId="sessions" dataKey="sessions" shape={renderBar} {...seriesMotion} />
        <Line
          yAxisId="conversion"
          dataKey="conversion"
          type="monotone"
          stroke="var(--card-inner)"
          strokeWidth={CASING_WIDTH}
          dot={false}
          activeDot={false}
          legendType="none"
          {...seriesMotion}
        />
        <Line
          yAxisId="conversion"
          dataKey="conversion"
          type="monotone"
          stroke={chartColor.blue}
          strokeWidth={LINE_WIDTH}
          dot={renderDot}
          activeDot={false}
          {...seriesMotion}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

const getData = (period: SessionPeriod): SessionDataset => sessionData[period];

const totalSessions = (data: SessionDataset) =>
  data.points.reduce((total, { sessions }) => total + sessions, 0);

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
    value: totalSessions(data),
    delta: data.delta,
  };
}

function getTiles(data: SessionDataset, activeIndex: number | null): StatTile[] {
  const point = activeIndex === null ? undefined : data.points[activeIndex];
  return [
    {
      label: "Sessions · total",
      value: point ? point.sessions : totalSessions(data),
      color: chartColor.lime,
    },
    {
      label: "Conversion · average",
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
      description="Bars and a cased line on separate axes, so volume and rate read together in one chart."
      label="Sessions"
      periods={SESSION_PERIODS}
      stackHeaderWhenNarrow
      getData={getData}
      formatValue={formatNumber}
      getHeadline={getHeadline}
      getTiles={getTiles}
      tileColumns={2}
      highlightActiveTile={false}
      chartHeight={CHART_HEIGHT}
      chartLabel="Monthly sessions as bars, with the conversion rate as a line"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <ComboChart points={data.points} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      )}
    </ChartCard>
  );
}
