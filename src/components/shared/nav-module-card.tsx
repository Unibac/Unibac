import type * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Card enlazable del home del dashboard (hover registry). */
export const navModuleCardClassName =
  "transition-colors duration-150 hover:border-border/80 hover:bg-accent/50";

export function NavModuleCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return <Card className={cn(navModuleCardClassName, className)} {...props} />;
}
