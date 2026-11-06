import { Building2, Crown, Eye, UserPlus, Users, Zap, type LucideIcon } from "lucide-react";
import { chartColor, type ChartColor } from "@/lib/colors";

export const STAGE_PERIODS = ["Last 7 days", "Last 30 days", "Last 90 days"] as const;
export type StagePeriod = (typeof STAGE_PERIODS)[number];

export interface Stage {
  label: string;
  value: number;
  color: ChartColor;
  icon: LucideIcon;
}

export interface StageDataset {
  delta: number;
  stages: readonly Stage[];
}

const DEFINITIONS = [
  { label: "Visits", color: chartColor.lime, icon: Eye },
  { label: "Sign-up", color: chartColor.blue, icon: UserPlus },
  { label: "Active", color: chartColor.violet, icon: Zap },
  { label: "Pro", color: chartColor.pink, icon: Crown },
  { label: "Team", color: chartColor.yellow, icon: Users },
  { label: "Enterprise", color: chartColor.emerald, icon: Building2 },
] as const;

const withValues = (values: readonly number[]): Stage[] =>
  DEFINITIONS.map((definition, index) => ({ ...definition, value: values[index] ?? 0 }));

export const stageData: Record<StagePeriod, StageDataset> = {
  "Last 7 days": { delta: 2.4, stages: withValues([1180, 790, 460, 250, 120, 40]) },
  "Last 30 days": { delta: 6.3, stages: withValues([4920, 3050, 2010, 1180, 470, 190]) },
  "Last 90 days": { delta: 11.7, stages: withValues([13800, 9240, 5170, 2760, 1520, 610]) },
};
