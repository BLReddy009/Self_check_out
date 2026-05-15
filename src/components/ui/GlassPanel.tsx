import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function GlassPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-white/15 bg-white/[0.09] shadow-glass backdrop-blur-2xl ring-1 ring-white/[0.03]",
        className
      )}
      {...props}
    />
  );
}
