import type * as React from "react";

import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const listCardContentClassName =
  "flex flex-col gap-2 pt-4 pb-6 text-sm";

export function ListCardContent({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      className={cn(listCardContentClassName, className)}
      {...props}
    />
  );
}
