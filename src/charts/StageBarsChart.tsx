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

const ROW_HEIGHT = 28;
const BAR_HEIGHT = 18;
const MIN_BAR_WIDTH = 14;
const ICON_SIZE = 12;
const ICON_INSET = 4;
const LABEL_WIDTH = 70;
const LABEL_GAP = 8;
/** Colonnes de droite : valeur, puis part, alignées à droite depuis la fin du rail. */
const VALUE_END = 46;
const SHARE_END = 81;

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
        x={LABEL_WIDTH - LABEL_GAP}
        y={y}
        dy="0.35em"
        textAnchor="end"
        fontSize={13}
        fill={activeIndex === index ? "var(--text)" : "var(--text-muted)"}
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
    const barWidth = Math.max(Number(width), MIN_BAR_WIDTH);
    const middleY = barY + barHeight / 2;
    const trackEnd = Number(background?.x ?? barX) + Number(background?.width ?? barWidth);
    const percent = (stage.value / firstValue) * 100;
    return (
      <g className="chart-focusable" style={{ opacity: isDimmed(index) ? 0.25 : 1 }}>
        <rect
          x={barX}
          y={barY}
          width={barWidth}
          height={barHeight}
          rx={Math.min(barHeight, barWidth) / 2}
          fill={stage.color}
        />
        {/* L'icône garde sa place au début de la barre, même si la barre est plus courte. */}
        <Icon
          x={barX + ICON_INSET}
          y={middleY - ICON_SIZE / 2}
          width={ICON_SIZE}
          height={ICON_SIZE}
          color="var(--pill)"
          aria-hidden
        />
        <text
          x={trackEnd + VALUE_END}
          y={middleY}
          dy="0.35em"
          textAnchor="end"
          fontSize={13}
          fontWeight={500}
          fill="var(--text)"
        >
          {formatNumber(stage.value)}
        </text>
        <text
          x={trackEnd + SHARE_END}
          y={middleY}
          dy="0.35em"
          textAnchor="end"
          fontSize={11}
          fill="var(--text-muted)"
        >
          {formatPercent(percent)}
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
        margin={{ top: 0, right: SHARE_END, bottom: 0, left: 0 }}
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
          interval={0}
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
      description="Funnel data as pill rows showing name, value and share, with a stat tile for each stage."
      label="Pipeline"
      periods={STAGE_PERIODS}
      getData={getData}
      formatValue={formatNumber}
      getHeadline={getHeadline}
      getTiles={getTiles}
      tileColumns={3}
      chartHeight={ROW_HEIGHT * 6}
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
