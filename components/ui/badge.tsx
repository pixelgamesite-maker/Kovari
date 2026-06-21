import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        chain: "border-border bg-panel text-muted-text",
        live: "border-accent-blue/30 bg-accent-blue/10 text-accent-blue",
        upcoming: "border-border bg-panel text-muted-text",
        soldout: "border-accent-red/30 bg-accent-red/10 text-accent-red",
        ended: "border-border bg-panel text-muted-text",
      },
    },
    defaultVariants: {
      variant: "chain",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
  }
