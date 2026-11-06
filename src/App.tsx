import { Box, ChartPie } from "lucide-react";
import { AreaCard } from "@/charts/AreaChart";
import { ComboCard } from "@/charts/ComboChart";
import { EarningsCard } from "@/charts/EarningsChart";
import { FunnelCard } from "@/charts/FunnelChart";
import { RadialCard } from "@/charts/RadialChart";
import { RadarCard } from "@/charts/RadarChart";
import { RadarComparisonCard } from "@/charts/RadarComparisonChart";
import { SankeyCard } from "@/charts/SankeyChart";
import { SpeedometerCard } from "@/charts/SpeedometerChart";
import { StageBarsCard } from "@/charts/StageBarsChart";
import { Badge } from "@/components/ui/badge";

export default function App() {
  return (
    <main className="min-h-screen bg-bg p-2 sm:p-4">
      <div className="mx-auto max-w-[1180px] rounded-[28px] bg-shell px-4 py-12 sm:px-8 sm:py-16">
        <header className="mx-auto flex max-w-[720px] flex-col items-center text-center">
          <Badge variant="outline">
            <span
              aria-hidden
              className="flex size-4 items-center justify-center rounded-[4px] bg-text text-[var(--pill)]"
            >
              <Box className="size-3" />
            </span>
            Included with Pro
          </Badge>
          <h1 className="mt-3.5 max-w-[460px] text-[32px] leading-[1.15] font-medium tracking-tight text-text sm:text-[40px]">
            Charts that make your data worth reading
          </h1>
          <p className="mt-3 max-w-[500px] text-[14px] leading-5 text-muted">
            Funnels, radars, Sankeys and more, built on Recharts with period switchers, hover focus
            and stat tiles that all share one set of tokens.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] bg-primary px-3 text-[13px] font-medium text-on-primary transition-colors duration-200 ease-out hover:bg-primary-hover"
            >
              <ChartPie className="size-4" aria-hidden />
              Get every chart with Pro
            </button>
            <a
              href="#charts"
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] border border-grid bg-track px-3 text-[13px] font-medium text-text transition-colors duration-200 ease-out hover:bg-tile-active"
            >
              <Box className="size-4" aria-hidden />
              Browse all charts
            </a>
          </div>
        </header>

        <section
          id="charts"
          aria-label="Chart gallery"
          className="mx-auto mt-9 grid max-w-[1100px] grid-cols-1 gap-6 md:grid-cols-2"
        >
          <FunnelCard />
          <EarningsCard />
          <RadarCard />
          <RadarComparisonCard />
          <SankeyCard />
          <StageBarsCard />
          <RadialCard />
          <SpeedometerCard />
          <AreaCard />
          <ComboCard />
        </section>
      </div>
    </main>
  );
}
