import type * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** `Card` para listados con imagen superior (`ListCardThumbnail`). */
export const listCardWithMediaClassName =
  "gap-0 overflow-hidden py-0 transition-colors duration-150";

export function ListCardWithMedia({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card className={cn(listCardWithMediaClassName, className)} {...props} />
  );
}
