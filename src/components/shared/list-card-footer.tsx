import type * as React from "react";

import { CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const listCardFooterClassName = "border-t border-border py-4";

export function ListCardFooter({
  className,
  ...props
}: React.ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter className={cn(listCardFooterClassName, className)} {...props} />
  );
}
