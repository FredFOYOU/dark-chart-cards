import { Radar } from "recharts";
import { ChartCard } from "@/components/ChartCard";
import { RADAR_PERIODS } from "@/data/radar";
import { useRechartsMotion } from "@/hooks/useRechartsMotion";
import { chartColor } from "@/lib/colors";
import { formatNumber } from "@/lib/format";
import { getRadarData, getRadarHeadline, getRadarTiles, RadarFrame, radarDot } from "./RadarBase";

export function RadarCard() {
  const seriesMotion = useRechartsMotion();

  return (
    <ChartCard
      title="Radar chart"
      description="A filled hexagon that tracks one series across six axes, with the headline following the hovered month."
      label="Visitors"
      periods={RADAR_PERIODS}
      defaultPeriod="H1 2024"
      getData={getRadarData}
      formatValue={formatNumber}
      getHeadline={getRadarHeadline}
      getTiles={getRadarTiles}
      tileColumns={3}
      chartLabel="Visitors per month on a six-axis radar"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <RadarFrame points={data.points} activeIndex={activeIndex} setActiveIndex={setActiveIndex}>
          <Radar
            dataKey="desktop"
            stroke={chartColor.lime}
            strokeWidth={2}
            fill={chartColor.lime}
            fillOpacity={0.6}
            dot={radarDot(chartColor.lime, activeIndex)}
            {...seriesMotion}
          />
        </RadarFrame>
      )}
    </ChartCard>
  );
}
