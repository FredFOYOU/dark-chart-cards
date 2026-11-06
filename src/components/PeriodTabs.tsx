import { motion } from "motion/react";
import { useId } from "react";
import type { PeriodSelectProps } from "@/components/PeriodSelect";

/** Sélecteur de période en pills segmentées ; la pastille active glisse d'une option à l'autre. */
export function PeriodTabs<TPeriod extends string>({
  periods,
  value,
  onChange,
  chartName,
}: PeriodSelectProps<TPeriod>) {
  const pillId = useId();

  return (
    <div
      role="group"
      aria-label={`${chartName} period`}
      className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-[8px] border border-line bg-tile p-0.5"
    >
      {periods.map((period) => {
        const selected = period === value;
        return (
          <button
            key={period}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(period)}
            className={`relative h-full rounded-[6px] px-2 text-[13px] transition-colors duration-200 ease-out ${
              selected ? "text-text" : "text-muted hover:text-text"
            }`}
          >
            {selected && (
              <motion.span
                layoutId={pillId}
                aria-hidden
                className="absolute inset-0 rounded-[6px] bg-tile-active"
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            )}
            <span className="relative">{period}</span>
          </button>
        );
      })}
    </div>
  );
}
