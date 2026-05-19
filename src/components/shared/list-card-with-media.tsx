import type * as React from "react";

import { ListCard } from "@/components/shared/list-card";
import { cn } from "@/lib/utils";

/** `ListCard` para listados con imagen superior (`ListCardThumbnail`). */
export function ListCardWithMedia({
  className,
  ...props
}: React.ComponentProps<typeof ListCard>) {
  return <ListCard className={className} {...props} />;
}
