import { Radar } from "recharts";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ChartCard } from "@/components/ChartCard";
import { RADAR_PERIODS, sumBy, type RadarDataset } from "@/data/radar";
import { useRechartsMotion } from "@/hooks/useRechartsMotion";
import { chartColor } from "@/lib/colors";
import { formatNumber } from "@/lib/format";
import {
  getRadarData,
  getRadarHeadline,
  getRadarTiles,
  RADAR_HEIGHT,
  RadarFrame,
  radarDot,
} from "./RadarBase";

const LEGEND_HEIGHT = 24;

const SERIES = [
  { key: "desktop", label: "Desktop", color: chartColor.lime },
  { key: "mobile", label: "Mobile", color: chartColor.blue },
] as const;

function RadarLegend({ data, activeIndex }: { data: RadarDataset; activeIndex: number | null }) {
  const point = activeIndex === null ? undefined : data.points[activeIndex];
  return (
    <ul
      className="flex items-end justify-center gap-4 text-[13px] leading-[18px]"
      style={{ height: LEGEND_HEIGHT }}
    >
      {SERIES.map(({ key, label, color }) => (
        <li key={key} className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
          <span className="text-muted">{label}</span>
          <AnimatedNumber
            value={point ? point[key] : sumBy(data.points, key)}
            format={formatNumber}
            className="font-medium text-text"
          />
        </li>
      ))}
    </ul>
  );
}

export function RadarComparisonCard() {
  const seriesMotion = useRechartsMotion();

  return (
    <ChartCard
      title="Radar comparison"
      description="Two outlined series share one grid, and the legend updates live so you can compare them month by month."
      label="Visitors"
      periods={RADAR_PERIODS}
      defaultPeriod="H1 2024"
      getData={getRadarData}
      formatValue={formatNumber}
      getHeadline={getRadarHeadline}
      getTiles={getRadarTiles}
      tileColumns={3}
      chartHeight={RADAR_HEIGHT + LEGEND_HEIGHT}
      chartLabel="Desktop and mobile visitors per month, compared on a six-axis radar"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <>
          <RadarFrame points={data.points} activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
            {SERIES.map(({ key, color }) => (
              <Radar
                key={key}
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                fill="none"
                dot={radarDot(color, activeIndex)}
                {...seriesMotion}
              />
            ))}
          </RadarFrame>
          <RadarLegend data={data} activeIndex={activeIndex} />
        </>
      )}
    </ChartCard>
  );
}
