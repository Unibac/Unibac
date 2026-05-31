"use client";

import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function FilterPanel({
  title = "Filtros",
  children,
  defaultOpen = true,
  className,
}: FilterPanelProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={cn("rounded-md border border-border", className)}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-medium transition-colors duration-150 hover:bg-accent/50 [&[data-state=open]>svg]:rotate-180">
        {title}
        <ChevronDownIcon
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-150"
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border px-4 py-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
