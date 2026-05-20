import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const pageCalloutVariants = cva("rounded-md border px-3 py-2 text-sm", {
  variants: {
    variant: {
      muted: "border-border bg-muted/40 text-muted-foreground",
      destructive: "border-destructive/50 bg-destructive/10 text-destructive",
      success: "border-success/40 bg-success/10 text-success-foreground",
    },
  },
  defaultVariants: {
    variant: "muted",
  },
});

type PageCalloutProps = React.ComponentProps<"p"> &
  VariantProps<typeof pageCalloutVariants>;

export function PageCallout({
  className,
  variant,
  ...props
}: PageCalloutProps) {
  return (
    <p
      role={variant === "destructive" ? "alert" : undefined}
      className={cn(pageCalloutVariants({ variant }), className)}
      {...props}
    />
  );
}
