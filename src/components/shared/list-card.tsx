import type * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Estilos base de cards en grillas de listado (alineado con registry product-grid). */
export const listCardClassName =
  "gap-0 overflow-hidden py-0 transition-colors duration-150 hover:border-border/80";

export function ListCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return <Card className={cn(listCardClassName, className)} {...props} />;
}
