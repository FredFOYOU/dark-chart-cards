import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center whitespace-nowrap font-medium", {
  variants: {
    variant: {
      delta: "rounded-[6px] bg-delta-bg px-1.5 py-0.5 text-[13px] leading-[18px] text-delta",
      outline:
        "gap-1.5 rounded-[8px] border border-grid bg-track px-2 py-1 text-[12px] leading-4 text-text",
    },
  },
  defaultVariants: { variant: "delta" },
});

export type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
