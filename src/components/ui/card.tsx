import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"article">) {
  return (
    <article
      className={cn(
        "rounded-card border border-line bg-card p-2 text-text transition-colors duration-200 ease-out hover:border-line-hover",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("text-[16px] leading-6 font-medium text-text", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("line-clamp-2 text-[14px] leading-5 text-muted", className)} {...props} />;
}
