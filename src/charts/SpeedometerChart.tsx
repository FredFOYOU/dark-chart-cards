import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ChartCard, type Headline, type StatTile } from "@/components/ChartCard";
import {
  DEVICE_PERIODS,
  deviceData,
  type DeviceDataset,
  type DevicePeriod,
  type DeviceShare,
} from "@/data/devices";
import { useTweenedValues } from "@/hooks/useTweenedValues";
import { formatNumber, formatPercent } from "@/lib/format";
import { arcPath, focusableMark } from "@/lib/svg";

const RADIUS = 96;
const STROKE_WIDTH = 28;
const SEGMENT_GAP = 2;
const GAUGE_WIDTH = (RADIUS + STROKE_WIDTH / 2) * 2;
const GAUGE_HEIGHT = RADIUS + STROKE_WIDTH / 2;
/** Plage de la jauge, de 9 h à 3 h en passant par 12 h. */
const GAUGE_START = -Math.PI / 2;
const GAUGE_SPAN = Math.PI;
/** Chaque extrémité arrondie déborde : l'arc est réduit d'autant dans sa part de jauge. */
const CAP_ANGLE = (STROKE_WIDTH / 2 + SEGMENT_GAP / 2) / RADIUS;
const MIN_VISIBLE_SWEEP = 0.01;
const MIN_ARC = 0.001;

export interface SpeedometerChartProps {
  devices: readonly DeviceShare[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}

export function SpeedometerChart({ devices, activeIndex, setActiveIndex }: SpeedometerChartProps) {
  const values = useTweenedValues(devices.map((device) => device.value));
  const total = devices.reduce((sum, device) => sum + device.value, 0);
  const cx = GAUGE_WIDTH / 2;
  const cy = GAUGE_HEIGHT;

  let cursor = GAUGE_START;
  const segments = devices.map((device, index) => {
    const sweep = ((values[index] ?? 0) / total) * GAUGE_SPAN;
    const start = cursor;
    cursor += sweep;
    return { device, index, start, sweep };
  });

  const featured = (activeIndex === null ? devices[0] : devices[activeIndex]) ?? devices[0];

  return (
    <div className="relative mx-auto" style={{ width: GAUGE_WIDTH, height: GAUGE_HEIGHT }}>
      <svg width={GAUGE_WIDTH} height={GAUGE_HEIGHT} className="block overflow-visible">
        <path
          d={arcPath(cx, cy, RADIUS, GAUGE_START + CAP_ANGLE, GAUGE_START + GAUGE_SPAN - CAP_ANGLE)}
          fill="none"
          stroke="var(--track)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />
        {segments.map(({ device, index, start, sweep }) => {
          if (sweep < MIN_VISIBLE_SWEEP) return null;
          const dimmed = activeIndex !== null && activeIndex !== index;
          const arcStart = start + CAP_ANGLE;
          const arcEnd = Math.max(start + sweep - CAP_ANGLE, arcStart + MIN_ARC);
          return (
            <g
              key={device.name}
              className="chart-focusable"
              style={{ opacity: dimmed ? 0.3 : 1 }}
              {...focusableMark(
                index,
                setActiveIndex,
                `${device.name}: ${formatNumber(device.value)}, ${formatPercent((device.value / total) * 100)}`,
              )}
            >
              <path
                d={arcPath(cx, cy, RADIUS, arcStart, arcEnd)}
                fill="none"
                stroke={device.color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>
      {featured && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
          <AnimatedNumber
            value={Math.round((featured.value / total) * 100)}
            format={formatPercent}
            className="text-[28px] leading-8 font-medium tracking-tight text-text"
          />
          <span className="text-[11px] leading-[14px] text-muted">{featured.name}</span>
        </div>
      )}
    </div>
  );
}

const getData = (period: DevicePeriod): DeviceDataset => deviceData[period];

function getHeadline(data: DeviceDataset, activeIndex: number | null): Headline {
  const device = activeIndex === null ? undefined : data.devices[activeIndex];
  if (device) return { label: device.name, value: device.value };
  return {
    value: data.devices.reduce((total, { value }) => total + value, 0),
    delta: data.delta,
  };
}

function getTiles(data: DeviceDataset): StatTile[] {
  return data.devices.map(({ name, value, color }) => ({ label: name, value, color }));
}

export function SpeedometerCard() {
  return (
    <ChartCard
      title="Speedometer"
      description="A half gauge of rounded segments showing the leading share at its center, with stat tiles underneath."
      label="Visitors"
      periods={DEVICE_PERIODS}
      getData={getData}
      formatValue={formatNumber}
      getHeadline={getHeadline}
      getTiles={getTiles}
      tileColumns={3}
      chartHeight={GAUGE_HEIGHT}
      chartLabel="Visitors per device, as a half gauge of four segments"
    >
      {({ data, activeIndex, setActiveIndex }) => (
        <SpeedometerChart
          devices={data.devices}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />
      )}
    </ChartCard>
  );
}
