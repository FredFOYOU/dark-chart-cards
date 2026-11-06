import { useId } from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard, type Headline, type StatTile } from "@/components/ChartCard";
import { RechartsHoverSync } from "@/components/RechartsHoverSync";
import {
  TRAFFIC_PERIODS,
  sumSeries,
  trafficData,
  type TrafficDataset,
  type TrafficPeriod,
  type TrafficPoint,
  type TrafficSeries,
} from "@/data/traffic";
import { axisProps, gridProps, useRechartsMotion } from "@/hooks/useRechartsMotion";
import { chartColor, type ChartColor } from "@/lib/colors";
import { formatCompact, formatNumber } from "@/lib/format";

const CHART_HEIGHT = 172;
const AXIS_TICKS = [0, 4500, 9000, 13500];

/** Du bas vers le haut de la pile. */
const SERIES: readonly { key: TrafficSeries; label: string; color: ChartColor }[] = [
  { key: "organic", label: "Organic", color: chartColor.lime },
  { key: "referral", label: "Referral", color: chartColor.blue },
  { key: "paid", label: "Paid", color: chartColor.violet },
];

export interface AreaChartProps {
  points: readonly TrafficPoint[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}

export function AreaChart({ points, activeIndex, setActiveIndex }: AreaChartProps) {
  const seriesMotion = useRechartsMotion();
  const gradientPrefix = useId().replaceAll(":", "");
  const activePoint = activeIndex === null ? undefined : points[activeIndex];

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <RechartsAreaChart
        data={[...points]}
        accessibilityLayer={false}
        margin={{ top: 6, right: 4, bottom: 0, left: 0 }}
      >
        <defs>
          {SERIES.map(({ key, color }) => (
            <linearGradient key={key} id={`${gradientPrefix}-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <RechartsHoverSync
          labels={points.map((point) => point.month)}
          setActiveIndex={setActiveIndex}
        />
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" {...axisProps} tickMargin={6} minTickGap={2} />
        <YAxis
          {...axisProps}
          width={38}
          ticks={AXIS_TICKS}
          domain={[0, AXIS_TICKS.at(-1) ?? "auto"]}
          tickFormatter={formatCompact}
        />
        {activePoint && (
          <ReferenceLine
            x={activePoint.month}
            stroke="var(--text-muted)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
        {SERIES.map(({ key, color }) => (
          <Area
            key={key}
            dataKey={key}
            stackId="traffic"
            type="monotone"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientPrefix}-${key})`}
            activeDot={{ r: 3.5, fill: color, stroke: "var(--card-inner)", strokeWidth: 1.5 }}
            {...seriesMotion}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}

const getData = (period: TrafficPeriod): TrafficDataset => trafficData[period];

function getHeadline(data: TrafficDataset, activeIndex: number | null): Headline {
  const point = activeIndex === null ? undefined : data.points[activeIndex];
  if (point) {
    return { label: point.month, value: point.organic + point.referral + point.paid };
  }
  return {
    value: SERIES.reduce((total, { key }) => total + sumSeries(data.points, key), 0),
    delta: data.delta,
  };
}

function getTiles(data: TrafficDataset, activeIndex: number | null): StatTile[] {
  const point = activeIndex === null ? undefined : data.points[activeIndex];
  return SERIES.map(({ key, label, color }) => ({
    label,
    value: point ? point[key] : sumSeries(data.points, key),
    color,
  }));
}

export function AreaCard() {
  return (
    <ChartCard
      title="Area chart"
      description="Stacked gradient series. Hover any month to update the headline and the tiles underneath."
      label="Visitors"
      periods={TRAFFIC_PERIODS}
      getData={getData}
      formatValue={formatNumber}
      getHeadline={getHeadline}
      getTiles={getTiles}
      tileColumns={3}
      highlightActiveTile={false}
      chartHeight={CHART_HEIGHT}
      chartLabel="Monthly visitors by channel, as stacked areas"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <AreaChart points={data.points} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      )}
    </ChartCard>
  );
}
