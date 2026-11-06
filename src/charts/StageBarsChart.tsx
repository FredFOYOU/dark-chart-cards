import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type BarShapeProps,
  type BaseTickContentProps,
} from "recharts";
import { ChartCard, type Headline, type StatTile } from "@/components/ChartCard";
import { RechartsHoverSync } from "@/components/RechartsHoverSync";
import {
  STAGE_PERIODS,
  stageData,
  type Stage,
  type StageDataset,
  type StagePeriod,
} from "@/data/stages";
import { useRechartsMotion } from "@/hooks/useRechartsMotion";
import { formatNumber, formatPercent } from "@/lib/format";

const ROW_HEIGHT = 44;
const BAR_HEIGHT = 30;
const ICON_PADDING = 3;
const ICON_SIZE = 14;
const LABEL_WIDTH = 72;
const VALUE_WIDTH = 92;

export interface StageBarsChartProps {
  stages: readonly Stage[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}

export function StageBarsChart({ stages, activeIndex, setActiveIndex }: StageBarsChartProps) {
  const seriesMotion = useRechartsMotion();
  const firstValue = stages[0]?.value ?? 1;
  const isDimmed = (index: number) => activeIndex !== null && activeIndex !== index;

  const renderTick = ({ y, payload }: BaseTickContentProps) => {
    const index = stages.findIndex((stage) => stage.label === payload.value);
    return (
      <text
        x={0}
        y={y}
        dy="0.35em"
        fontSize={13}
        fill="var(--text)"
        className="chart-focusable"
        style={{ opacity: isDimmed(index) ? 0.25 : 1 }}
      >
        {payload.value}
      </text>
    );
  };

  const renderBar = ({ x, y, width, height, index, background }: BarShapeProps) => {
    const stage = stages[index];
    if (!stage) return <g />;
    const Icon = stage.icon;
    const barX = Number(x);
    const barY = Number(y);
    const barHeight = Number(height);
    // La pilule reste au moins aussi large que le cercle de son icône.
    const barWidth = Math.max(Number(width), barHeight);
    const radius = barHeight / 2;
    const trackEnd = Number(background?.x ?? barX) + Number(background?.width ?? barWidth);
    const percent = (stage.value / firstValue) * 100;
    return (
      <g className="chart-focusable" style={{ opacity: isDimmed(index) ? 0.25 : 1 }}>
        <rect x={barX} y={barY} width={barWidth} height={barHeight} rx={radius} fill={stage.color} />
        <circle cx={barX + radius} cy={barY + radius} r={radius - ICON_PADDING} fill="var(--pill)" />
        <Icon
          x={barX + radius - ICON_SIZE / 2}
          y={barY + radius - ICON_SIZE / 2}
          width={ICON_SIZE}
          height={ICON_SIZE}
          color="var(--text)"
          aria-hidden
        />
        <text
          x={trackEnd + VALUE_WIDTH}
          y={barY + radius}
          dy="0.35em"
          textAnchor="end"
          fontSize={13}
        >
          <tspan fill="var(--text)" fontWeight={500}>
            {formatNumber(stage.value)}
          </tspan>
          <tspan fill="var(--text-muted)" dx={6}>
            {formatPercent(percent)}
          </tspan>
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={ROW_HEIGHT * stages.length}>
      <BarChart
        data={[...stages]}
        layout="vertical"
        accessibilityLayer={false}
        barSize={BAR_HEIGHT}
        margin={{ top: 0, right: VALUE_WIDTH, bottom: 0, left: 0 }}
      >
        <RechartsHoverSync
          labels={stages.map((stage) => stage.label)}
          setActiveIndex={setActiveIndex}
        />
        <XAxis type="number" hide domain={[0, firstValue]} />
        <YAxis
          type="category"
          dataKey="label"
          width={LABEL_WIDTH}
          axisLine={false}
          tickLine={false}
          tick={renderTick}
        />
        <Bar
          dataKey="value"
          background={{ fill: "var(--track)", radius: BAR_HEIGHT / 2 }}
          shape={renderBar}
          {...seriesMotion}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

const getData = (period: StagePeriod): StageDataset => stageData[period];

function getHeadline(data: StageDataset, activeIndex: number | null): Headline {
  const stage = activeIndex === null ? undefined : data.stages[activeIndex];
  if (stage) return { label: stage.label, value: stage.value };
  return { value: data.stages[0]?.value ?? 0, delta: data.delta };
}

function getTiles(data: StageDataset): StatTile[] {
  return data.stages.map(({ label, value, color }) => ({ label, value, color }));
}

export function StageBarsCard() {
  return (
    <ChartCard
      title="Stage bars"
      description="Pill bars on a track with an icon, value and share on every row, for pipelines at a glance."
      label="Pipeline"
      periods={STAGE_PERIODS}
      getData={getData}
      formatValue={formatNumber}
      getHeadline={getHeadline}
      getTiles={getTiles}
      tileColumns={3}
      chartLabel="Pipeline stages from visits to enterprise, as horizontal pill bars"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <StageBarsChart
          stages={data.stages}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />
      )}
    </ChartCard>
  );
}
