import type * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Card de panel (login, registro, placeholders) — composición registry sin theme Nature. */
export const panelCardClassName =
  "w-full max-w-md border-border shadow-sm transition-colors duration-150";

export function PanelCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return <Card className={cn(panelCardClassName, className)} {...props} />;
}
