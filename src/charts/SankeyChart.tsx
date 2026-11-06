import { motion } from "motion/react";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  Sankey,
  type SankeyData,
  type SankeyLinkProps,
  type SankeyNodeProps,
} from "recharts";
import { ChartCard, type Headline, type StatTile } from "@/components/ChartCard";
import {
  SANKEY_PERIODS,
  sankeyData,
  type SankeyDataset,
  type SankeyPeriod,
} from "@/data/sankey";
import { useFadeIn } from "@/hooks/useFadeIn";
import { CHART_DURATION } from "@/lib/motion";
import { formatHours, formatPercent } from "@/lib/format";

const CHART_HEIGHT = 300;
const NODE_WIDTH = 8;
const LABEL_GAP = 8;
const TARGET_LABEL_WIDTH = 132;

const LINK_OPACITY = { idle: 0.35, active: 0.7, isolated: 0.08 } as const;

export interface SankeyChartProps {
  data: SankeyDataset;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}

export function SankeyChart({ data, activeIndex, setActiveIndex }: SankeyChartProps) {
  const { sources, targets, flows } = data;
  const fadeIn = useFadeIn(CHART_DURATION);

  const chartData = useMemo<SankeyData>(
    () => ({
      nodes: [...sources, ...targets].map(({ name }) => ({ name })),
      links: flows.map(({ source, target, hours }) => ({
        source,
        target: sources.length + target,
        value: hours,
      })),
    }),
    [sources, targets, flows],
  );

  const renderNode = ({ x, y, width, height, index }: SankeyNodeProps) => {
    const source = sources[index];
    const middleY = y + height / 2;

    if (source) {
      const dimmed = activeIndex !== null && activeIndex !== index;
      return (
        <g
          className="chart-focusable"
          style={{ opacity: dimmed ? 0.25 : 1 }}
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <rect x={x} y={y} width={width} height={height} rx={width / 2} fill={source.color} />
          <text x={x + width + LABEL_GAP} y={middleY} dy="0.35em" fontSize={12}>
            <tspan fill="var(--text)">{source.name}</tspan>
            <tspan fill="var(--text)" dx={4} fontWeight={500}>
              {formatHours(source.hours)}
            </tspan>
          </text>
        </g>
      );
    }

    const target = targets[index - sources.length];
    if (!target) return null;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} rx={width / 2} fill="var(--text-muted)" />
        <text x={x + width + LABEL_GAP} y={middleY} dy="0.35em" fontSize={12}>
          <tspan fill="var(--text)">{target.name}</tspan>
          <tspan fill="var(--text-muted)" dx={4}>
            {formatPercent(target.share)}
          </tspan>
        </text>
      </g>
    );
  };

  const renderLink = ({
    sourceX,
    sourceY,
    sourceControlX,
    targetX,
    targetY,
    targetControlX,
    linkWidth,
    index,
  }: SankeyLinkProps) => {
    const flow = flows[index];
    if (!flow) return <path />;
    const source = sources[flow.source];
    let opacity: number = LINK_OPACITY.idle;
    if (activeIndex !== null) {
      opacity = activeIndex === flow.source ? LINK_OPACITY.active : LINK_OPACITY.isolated;
    }
    return (
      <path
        d={`M ${sourceX} ${sourceY} C ${sourceControlX} ${sourceY} ${targetControlX} ${targetY} ${targetX} ${targetY}`}
        fill="none"
        stroke={source?.color}
        strokeWidth={linkWidth}
        className="chart-focusable"
        style={{ opacity }}
        onMouseEnter={() => setActiveIndex(flow.source)}
        onMouseLeave={() => setActiveIndex(null)}
      />
    );
  };

  return (
    <div onMouseLeave={() => setActiveIndex(null)}>
      {/* Pas d'animation native sur le Sankey de Recharts : les flux apparaissent en fondu. */}
      <motion.div key={data.period} {...fadeIn}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <Sankey
            data={chartData}
            node={renderNode}
            link={renderLink}
            nodeWidth={NODE_WIDTH}
            nodePadding={12}
            linkCurvature={0.5}
            iterations={32}
            sort={false}
            margin={{ top: 2, right: TARGET_LABEL_WIDTH, bottom: 2, left: 0 }}
          />
        </ResponsiveContainer>
      </motion.div>
      <div className="mt-2 flex justify-between text-[12px] leading-4 text-muted">
        <span>Tracked time</span>
        <span>Share of tracked time</span>
      </div>
    </div>
  );
}

const getData = (period: SankeyPeriod): SankeyDataset => sankeyData[period];

function getHeadline(data: SankeyDataset, activeIndex: number | null): Headline {
  const source = activeIndex === null ? undefined : data.sources[activeIndex];
  if (source) return { label: source.name, value: source.hours };
  return { value: data.totalHours };
}

function getTiles(data: SankeyDataset): StatTile[] {
  return data.sources.map(({ name, hours, color }) => ({ label: name, value: hours, color }));
}

export function SankeyCard() {
  return (
    <ChartCard
      title="Sankey chart"
      description="Colored flows from sources to destinations, where hovering a source isolates its paths."
      label="Tracked time"
      periods={SANKEY_PERIODS}
      getData={getData}
      formatValue={formatHours}
      getHeadline={getHeadline}
      getTiles={getTiles}
      tileColumns={3}
      chartLabel="Tracked hours flowing from five activities to seven kinds of work"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <SankeyChart data={data} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      )}
    </ChartCard>
  );
}
