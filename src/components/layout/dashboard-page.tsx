import type * as React from "react";

import { cn } from "@/lib/utils";

type DashboardPageProps = {
  children: React.ReactNode;
  className?: string;
};

/** Contenedor estándar de páginas del panel (ancho máximo + gap entre bloques). */
export function DashboardPage({ children, className }: DashboardPageProps) {
  return <div className={cn("layout-page", className)}>{children}</div>;
}
