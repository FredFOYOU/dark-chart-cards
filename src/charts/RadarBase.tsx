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
import { chartColor } from "@/lib/colors";

export const RADAR_HEIGHT = 264;
/** Place réservée de chaque côté : sur une carte étroite, « September » ne doit pas être coupé. */
const AXIS_LABEL_ROOM = 56;

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
        fontSize={12}
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
        outerRadius="84%"
        margin={{ top: 8, right: AXIS_LABEL_ROOM, bottom: 8, left: AXIS_LABEL_ROOM }}
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
      <circle cx={cx} cy={cy} r={4} fill={color} stroke="var(--card-inner)" strokeWidth={2} />
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
  return data.points.map(({ month, desktop }) => ({
    label: month,
    value: desktop,
    color: chartColor.lime,
  }));
}
