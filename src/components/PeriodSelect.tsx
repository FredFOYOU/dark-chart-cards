import { Calendar, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PeriodSelectProps<TPeriod extends string> {
  periods: readonly TPeriod[];
  value: TPeriod;
  onChange: (period: TPeriod) => void;
  /** Nom du graphique, pour le libellé accessible du sélecteur. */
  chartName: string;
}

export function PeriodSelect<TPeriod extends string>({
  periods,
  value,
  onChange,
  chartName,
}: PeriodSelectProps<TPeriod>) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={`${chartName} period: ${value}`}
        className="group inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] border border-line bg-tile px-2.5 text-[13px] text-text transition-colors duration-200 ease-out hover:bg-tile-active data-[state=open]:bg-tile-active"
      >
        <Calendar className="size-3.5 text-muted" aria-hidden />
        <span className="whitespace-nowrap">{value}</span>
        <ChevronDown
          className="size-3.5 text-muted transition-transform duration-150 ease-out group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => {
            const period = periods.find((candidate) => candidate === next);
            if (period) onChange(period);
          }}
        >
          {periods.map((period) => (
            <DropdownMenuRadioItem key={period} value={period}>
              {period}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
