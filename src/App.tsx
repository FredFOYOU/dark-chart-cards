import { BarChart3 } from "lucide-react";
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
          <Badge variant="outline">Included with Pro</Badge>
          <h1 className="mt-5 text-[32px] leading-[1.15] font-semibold tracking-tight text-text sm:text-[40px]">
            Charts that make your data worth reading
          </h1>
          <p className="mt-3 max-w-[560px] text-[16px] leading-6 text-muted">
            Dark, focused chart cards with count-up headlines, synchronized hover and stat tiles that
            keep every number one glance away.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-primary px-4 text-[14px] font-medium text-on-primary transition-colors duration-200 ease-out hover:bg-primary-hover"
            >
              <BarChart3 className="size-4" aria-hidden />
              Get every chart with Pro
            </button>
            <a
              href="#charts"
              className="inline-flex h-10 items-center rounded-[10px] border border-line bg-tile px-4 text-[14px] font-medium text-text transition-colors duration-200 ease-out hover:bg-tile-active"
            >
              Browse all charts
            </a>
          </div>
        </header>

        <section
          id="charts"
          aria-label="Chart gallery"
          className="mx-auto mt-12 grid max-w-[1100px] grid-cols-1 gap-4 md:grid-cols-2"
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
