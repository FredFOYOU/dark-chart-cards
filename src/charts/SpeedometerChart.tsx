import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ChartCard, type Headline, type StatTile } from "@/components/ChartCard";
import {
  DEVICE_PERIODS,
  deviceData,
  type DeviceDataset,
  type DevicePeriod,
  type DeviceShare,
} from "@/data/devices";
import { useElementWidth } from "@/hooks/useElementSize";
import { useTweenedValues } from "@/hooks/useTweenedValues";
import { formatNumber, formatPercent } from "@/lib/format";
import { arcPath, focusableMark } from "@/lib/svg";

const MAX_RADIUS = 170;
const STROKE_WIDTH = 24;
/** Espace visible entre deux segments, en plus de leurs extrémités arrondies. */
const SEGMENT_GAP = 5;
const BOTTOM_MARGIN = 6;
/** Plage de la jauge, de 9 h à 3 h en passant par 12 h. */
const GAUGE_START = -Math.PI / 2;
const GAUGE_END = Math.PI / 2;
const MIN_VISIBLE_SWEEP = 0.001;

export interface SpeedometerChartProps {
  devices: readonly DeviceShare[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}

export function SpeedometerChart({ devices, activeIndex, setActiveIndex }: SpeedometerChartProps) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const values = useTweenedValues(devices.map((device) => device.value));
  const total = devices.reduce((sum, device) => sum + device.value, 0);

  const radius = Math.min(MAX_RADIUS, Math.max(width / 2 - STROKE_WIDTH / 2, 1));
  const height = radius + STROKE_WIDTH + BOTTOM_MARGIN;
  const cx = width / 2;
  const cy = radius + STROKE_WIDTH / 2;

  // Les extrémités arrondies débordent de l'arc : l'angle utile les retire pour ne pas se chevaucher.
  const capAngle = STROKE_WIDTH / 2 / radius;
  const gapAngle = (STROKE_WIDTH + SEGMENT_GAP) / radius;
  const usableAngle =
    GAUGE_END - GAUGE_START - capAngle * 2 - gapAngle * Math.max(devices.length - 1, 0);

  let cursor = GAUGE_START + capAngle;
  const segments = devices.map((device, index) => {
    const sweep = ((values[index] ?? 0) / total) * usableAngle;
    const start = cursor;
    cursor += sweep + gapAngle;
    return { device, index, start, sweep };
  });

  const featured = (activeIndex === null ? devices[0] : devices[activeIndex]) ?? devices[0];

  return (
    <div ref={containerRef} className="relative mx-auto w-full" style={{ maxWidth: MAX_RADIUS * 2 + STROKE_WIDTH }}>
      {width > 0 && (
        <svg width={width} height={height} className="block">
          {segments.map(({ device, index, start, sweep }) => {
            const dimmed = activeIndex !== null && activeIndex !== index;
            if (sweep < MIN_VISIBLE_SWEEP) return null;
            const d = arcPath(cx, cy, radius, start, start + sweep);
            return (
              <g
                key={device.name}
                className="chart-focusable"
                style={{ opacity: dimmed ? 0.25 : 1 }}
                {...focusableMark(
                  index,
                  setActiveIndex,
                  `${device.name}: ${formatNumber(device.value)}, ${formatPercent((device.value / total) * 100)}`,
                )}
              >
                <path
                  d={d}
                  fill="none"
                  stroke={device.color}
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>
      )}
      {featured && (
        <div className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center">
          <AnimatedNumber
            value={Math.round((featured.value / total) * 100)}
            format={formatPercent}
            className="text-[32px] leading-10 font-semibold tracking-tight text-text"
          />
          <span className="text-[13px] leading-[18px] text-muted">{featured.name}</span>
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
      description="A half gauge of rounded segments, with the leading share at its center until you hover another."
      label="Visitors"
      periods={DEVICE_PERIODS}
      defaultPeriod="Last 30 days"
      getData={getData}
      formatValue={formatNumber}
      getHeadline={getHeadline}
      getTiles={getTiles}
      tileColumns={4}
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
