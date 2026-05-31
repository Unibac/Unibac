import type * as React from "react";

import { cn } from "@/lib/utils";

type ListCardGridEmptyProps = {
  children: React.ReactNode;
  className?: string;
};

export function ListCardGridEmpty({
  children,
  className,
}: ListCardGridEmptyProps) {
  return (
    <p
      className={cn(
        "rounded-md border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground transition-colors duration-150",
        className,
      )}
    >
      {children}
    </p>
  );
}
