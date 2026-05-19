import type * as React from "react";

import { CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const listCardHeaderClassName =
  "gap-3 border-b border-border py-4 items-center [&_[data-slot=card-action]]:self-center";

/** Header de list card: `CardTitle` y `CardAction` como hijos directos (grid del registry). */
export function ListCardHeader({
  className,
  ...props
}: React.ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader className={cn(listCardHeaderClassName, className)} {...props} />
  );
}
