"use client";

import { LayoutGridIcon, Table2Icon } from "lucide-react";

import { useDashboardListLayout } from "@/components/layout/dashboard-list-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardListLayoutToggle() {
  const { layout, setLayout } = useDashboardListLayout();

  return (
    <fieldset className="m-0 flex shrink-0 items-center gap-0.5 rounded-md border border-border p-0.5">
      <legend className="sr-only">Vista de listados del panel</legend>
      <Button
        type="button"
        variant={layout === "cards" ? "secondary" : "ghost"}
        size="sm"
        className={cn("h-8 px-2", layout === "cards" && "shadow-none")}
        aria-pressed={layout === "cards"}
        onClick={() => setLayout("cards")}
      >
        <LayoutGridIcon data-icon="inline-start" aria-hidden />
        <span className="sr-only">Vista en cards</span>
      </Button>
      <Button
        type="button"
        variant={layout === "table" ? "secondary" : "ghost"}
        size="sm"
        className={cn("h-8 px-2", layout === "table" && "shadow-none")}
        aria-pressed={layout === "table"}
        onClick={() => setLayout("table")}
      >
        <Table2Icon data-icon="inline-start" aria-hidden />
        <span className="sr-only">Vista en tabla</span>
      </Button>
    </fieldset>
  );
}
