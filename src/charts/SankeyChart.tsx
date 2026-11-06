import { motion } from "motion/react";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  Sankey,
  type SankeyData,
  type SankeyLinkProps,
  type SankeyNodeProps,
} from "recharts";
import { ChartCard, type Headline } from "@/components/ChartCard";
import {
  SANKEY_PERIODS,
  sankeyData,
  type SankeyDataset,
  type SankeyPeriod,
} from "@/data/sankey";
import { useElementWidth } from "@/hooks/useElementSize";
import { useFadeIn } from "@/hooks/useFadeIn";
import { formatHours, formatHoursOneDecimal, formatPercent } from "@/lib/format";
import { CHART_DURATION } from "@/lib/motion";

const FLOW_HEIGHT = 250;
const AXIS_LABELS_HEIGHT = 24;
const NODE_WIDTH = 10;
const NODE_RADIUS = 3;
const NODE_PADDING = 13;
const LABEL_GAP = 8;
/** Sous cette hauteur de nœud, seul le nom de la source tient sur la barre. */
const MIN_HEIGHT_FOR_HOURS = 22;
const LINE_OFFSET = 7;
const NARROW_WIDTH = 400;

const LAYOUT = {
  wide: { left: 74, right: 142, fontSize: 12 },
  narrow: { left: 58, right: 124, fontSize: 11 },
} as const;

const LINK_OPACITY = { idle: 0.35, lit: 0.8, isolated: 0.08 } as const;
const DIMMED_SOURCE_OPACITY = 0.4;
const DIMMED_TARGET_OPACITY = 0.45;

/**
 * `activeIndex` désigne une source, une cible ou un flux, dans cet ordre.
 * Cela garde le contrat numérique de `ChartCard` tout en isolant chaque type d'élément.
 */
type SankeyFocus =
  | { kind: "source"; index: number }
  | { kind: "target"; index: number }
  | { kind: "flow"; index: number };

function decodeFocus(activeIndex: number | null, data: SankeyDataset): SankeyFocus | null {
  if (activeIndex === null) return null;
  const sourceCount = data.sources.length;
  const targetCount = data.targets.length;
  if (activeIndex < sourceCount) return { kind: "source", index: activeIndex };
  if (activeIndex < sourceCount + targetCount) {
    return { kind: "target", index: activeIndex - sourceCount };
  }
  return { kind: "flow", index: activeIndex - sourceCount - targetCount };
}

export interface SankeyChartProps {
  data: SankeyDataset;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}

export function SankeyChart({ data, activeIndex, setActiveIndex }: SankeyChartProps) {
  const { sources, targets, flows } = data;
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const fadeIn = useFadeIn(CHART_DURATION);
  const layout = width > 0 && width < NARROW_WIDTH ? LAYOUT.narrow : LAYOUT.wide;

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

  const focus = decodeFocus(activeIndex, data);

  const litFlows = useMemo(() => {
    if (!focus) return null;
    const lit = new Set<number>();
    flows.forEach((flow, index) => {
      const matches =
        (focus.kind === "source" && flow.source === focus.index) ||
        (focus.kind === "target" && flow.target === focus.index) ||
        (focus.kind === "flow" && index === focus.index);
      if (matches) lit.add(index);
    });
    return lit;
  }, [focus?.kind, focus?.index, flows]);

  const isSourceLit = (index: number) =>
    !litFlows || [...litFlows].some((flowIndex) => flows[flowIndex]?.source === index);
  const isTargetLit = (index: number) =>
    !litFlows || [...litFlows].some((flowIndex) => flows[flowIndex]?.target === index);

  // Les nœuds ont la même échelle : la colonne des sources, plus courte, s'aligne en bas.
  const sourceOffset = (targets.length - sources.length) * NODE_PADDING;

  const renderNode = ({ x, y, width: nodeWidth, height, index }: SankeyNodeProps) => {
    const source = sources[index];

    if (source) {
      const lit = isSourceLit(index);
      const top = y + sourceOffset;
      const middle = top + height / 2;
      const showHours = height >= MIN_HEIGHT_FOR_HOURS;
      return (
        <g
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {/* Cible de survol : le nœud et son libellé. */}
          <rect
            x={x - layout.left}
            y={top}
            width={layout.left + nodeWidth}
            height={height}
            fill="transparent"
          />
          <rect
            x={x}
            y={top}
            width={nodeWidth}
            height={height}
            rx={NODE_RADIUS}
            fill={source.color}
            className="chart-focusable"
            style={{ opacity: lit ? 1 : DIMMED_SOURCE_OPACITY }}
          />
          <text
            x={x - LABEL_GAP}
            y={showHours ? middle - LINE_OFFSET : middle}
            dy="0.35em"
            textAnchor="end"
            fontSize={layout.fontSize}
            fontWeight={focus && lit ? 500 : 400}
            fill={lit ? "var(--text)" : "var(--text-muted)"}
          >
            {source.name}
          </text>
          {showHours && (
            <text
              x={x - LABEL_GAP}
              y={middle + LINE_OFFSET}
              dy="0.35em"
              textAnchor="end"
              fontSize={layout.fontSize - 1}
              fill="var(--text-muted)"
              className="chart-focusable"
              style={{ opacity: lit ? 1 : 0.5 }}
            >
              {formatHours(source.hours)}
            </text>
          )}
        </g>
      );
    }

    const targetIndex = index - sources.length;
    const target = targets[targetIndex];
    if (!target) return null;
    const lit = isTargetLit(targetIndex);
    return (
      <g
        onMouseEnter={() => setActiveIndex(sources.length + targetIndex)}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <rect
          x={x}
          y={y}
          width={nodeWidth + layout.right}
          height={height}
          fill="transparent"
        />
        <rect
          x={x}
          y={y}
          width={nodeWidth}
          height={height}
          rx={NODE_RADIUS}
          fill={focus && lit ? "var(--text)" : "var(--sink)"}
          className="chart-focusable"
          style={{ opacity: lit ? 1 : DIMMED_TARGET_OPACITY }}
        />
        <text x={x + nodeWidth + LABEL_GAP} y={y + height / 2} dy="0.35em" fontSize={layout.fontSize}>
          <tspan fill={lit ? "var(--text)" : "var(--text-muted)"} fontWeight={focus && lit ? 500 : 400}>
            {target.name}
          </tspan>
          <tspan fill="var(--text-muted)" dx={4}>
            · {formatPercent(target.share)}
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
    const startY = sourceY + sourceOffset;
    let opacity: number = LINK_OPACITY.idle;
    if (litFlows) opacity = litFlows.has(index) ? LINK_OPACITY.lit : LINK_OPACITY.isolated;
    return (
      <path
        d={`M ${sourceX} ${startY} C ${sourceControlX} ${startY} ${targetControlX} ${targetY} ${targetX} ${targetY}`}
        fill="none"
        stroke={sources[flow.source]?.color}
        strokeWidth={linkWidth}
        className="chart-focusable"
        style={{ opacity }}
        onMouseEnter={() => setActiveIndex(sources.length + targets.length + index)}
        onMouseLeave={() => setActiveIndex(null)}
      />
    );
  };

  return (
    <div ref={containerRef} onMouseLeave={() => setActiveIndex(null)}>
      {/* Pas d'animation native sur le Sankey de Recharts : les flux apparaissent en fondu. */}
      <motion.div key={data.period} {...fadeIn}>
        <ResponsiveContainer width="100%" height={FLOW_HEIGHT}>
          <Sankey
            data={chartData}
            node={renderNode}
            link={renderLink}
            nodeWidth={NODE_WIDTH}
            nodePadding={NODE_PADDING}
            linkCurvature={0.5}
            iterations={0}
            sort={false}
            verticalAlign="top"
            margin={{ top: 0, right: layout.right, bottom: 0, left: layout.left }}
          />
        </ResponsiveContainer>
      </motion.div>
      <div
        className="flex items-end justify-between text-[11px] leading-4 text-muted"
        style={{ height: AXIS_LABELS_HEIGHT }}
      >
        <span>Tracked time</span>
        <span>Share of tracked time</span>
      </div>
    </div>
  );
}

const getData = (period: SankeyPeriod): SankeyDataset => sankeyData[period];

function getHeadline(data: SankeyDataset, activeIndex: number | null): Headline {
  const focus = decodeFocus(activeIndex, data);
  if (focus?.kind === "source") {
    const source = data.sources[focus.index];
    if (source) return { label: source.name, value: source.hours };
  }
  if (focus?.kind === "target") {
    const target = data.targets[focus.index];
    if (target) return { label: target.name, value: (target.share / 100) * data.totalHours };
  }
  if (focus?.kind === "flow") {
    const flow = data.flows[focus.index];
    const source = flow && data.sources[flow.source];
    const target = flow && data.targets[flow.target];
    if (flow && source && target) {
      return {
        label: `${source.name} → ${target.name}`,
        value: flow.hours,
        format: formatHoursOneDecimal,
      };
    }
  }
  return { value: data.totalHours };
}

export function SankeyCard() {
  return (
    <ChartCard
      title="Sankey chart"
      description="Source-colored flows with shares on each destination; hovering any part isolates its paths."
      label="Tracked time"
      periods={SANKEY_PERIODS}
      getData={getData}
      formatValue={formatHours}
      getHeadline={getHeadline}
      chartHeight={FLOW_HEIGHT + AXIS_LABELS_HEIGHT}
      chartLabel="Tracked hours flowing from five activities to seven kinds of work"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <SankeyChart data={data} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      )}
    </ChartCard>
  );
}
