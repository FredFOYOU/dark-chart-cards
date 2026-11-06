import type { ReactElement } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  RadarChart,
  ResponsiveContainer,
  type BaseTickContentProps,
} from "recharts";
import type { Headline, StatTile } from "@/components/ChartCard";
import { RechartsHoverSync } from "@/components/RechartsHoverSync";
import { radarData, sumBy, type RadarDataset, type RadarPeriod, type RadarPoint } from "@/data/radar";

export const RADAR_HEIGHT = 196;
const RADAR_RADIUS = 77;

export interface RadarFrameProps {
  points: readonly RadarPoint[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
  /** Séries `<Radar>` : enfants directs de `RadarChart`, tel que l'exige Recharts. */
  children: ReactElement | ReactElement[];
}

/** Grille hexagonale et axes communs aux deux radars. */
export function RadarFrame({ points, activeIndex, setActiveIndex, children }: RadarFrameProps) {
  const labels = points.map((point) => point.month);

  const renderTick = ({ x, y, textAnchor, payload }: BaseTickContentProps) => {
    const index = labels.indexOf(String(payload.value));
    const active = activeIndex === index;
    const dimmed = activeIndex !== null && !active;
    return (
      <text
        x={x}
        y={y}
        dy="0.35em"
        textAnchor={textAnchor}
        fontSize={11}
        fontWeight={active ? 500 : 400}
        className="chart-focusable"
        fill={active ? "var(--text)" : "var(--text-muted)"}
        style={{ opacity: dimmed ? 0.25 : 1 }}
      >
        {payload.value}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={RADAR_HEIGHT}>
      <RadarChart
        data={[...points]}
        accessibilityLayer={false}
        outerRadius={RADAR_RADIUS}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <RechartsHoverSync labels={labels} setActiveIndex={setActiveIndex} />
        <PolarGrid gridType="polygon" stroke="var(--grid)" />
        <PolarAngleAxis dataKey="month" tick={renderTick} tickLine={false} />
        {children}
      </RadarChart>
    </ResponsiveContainer>
  );
}

interface RadarDotProps {
  cx?: number;
  cy?: number;
  index?: number;
}

/** Point visible uniquement sur le sommet du mois survolé. */
export function radarDot(color: string, activeIndex: number | null) {
  const RadarVertex = ({ cx, cy, index }: RadarDotProps) =>
    index === activeIndex ? (
      <circle cx={cx} cy={cy} r={3.5} fill={color} stroke="var(--card-inner)" strokeWidth={1.5} />
    ) : (
      <g />
    );
  return RadarVertex;
}

export const getRadarData = (period: RadarPeriod): RadarDataset => radarData[period];

export function getRadarHeadline(data: RadarDataset, activeIndex: number | null): Headline {
  const point = activeIndex === null ? undefined : data.points[activeIndex];
  if (point) return { label: point.month, value: point.desktop };
  return { value: sumBy(data.points, "desktop"), delta: data.delta };
}

export function getRadarTiles(data: RadarDataset): StatTile[] {
  return data.points.map(({ month, desktop }) => ({ label: month, value: desktop }));
}
