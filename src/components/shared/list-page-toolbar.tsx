import type * as React from "react";

import { cn } from "@/lib/utils";

type ListPageToolbarProps = {
  children?: React.ReactNode;
  end?: React.ReactNode;
  sticky?: boolean;
  className?: string;
};

export function ListPageToolbar({
  children,
  end,
  sticky = false,
  className,
}: ListPageToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        sticky &&
          "sticky top-14 z-10 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 lg:-mx-6 lg:px-6",
        className,
      )}
    >
      {children ? (
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {children}
        </div>
      ) : null}
      {end ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{end}</div>
      ) : null}
    </div>
  );
}
