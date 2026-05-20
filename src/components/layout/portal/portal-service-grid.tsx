"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  NavModuleCard,
  navModuleCardClassName,
} from "@/components/shared/nav-module-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DashboardNavItemData } from "@/modules/auth/lib/dashboard-nav-items";

const TILE_BG_CLASSES = [
  "bg-primary text-primary-foreground",
  "bg-success text-success-foreground",
  "bg-info text-info-foreground",
  "bg-warning text-warning-foreground",
  "bg-chart-3 text-primary-foreground",
] as const;

type PortalServiceGridProps = {
  items: DashboardNavItemData[];
};

export function PortalServiceGrid({ items }: PortalServiceGridProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <section className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-xl">
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Busca tu servicio"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 rounded-full pl-10 text-sm"
            aria-label="Buscar servicio"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {items.length === 0
            ? "No hay servicios disponibles para tu cuenta."
            : "Ningún servicio coincide con la búsqueda."}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item, index) => {
            const Icon = item.icon;
            const tileBg = TILE_BG_CLASSES[index % TILE_BG_CLASSES.length];
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Ir a ${item.label}`}
                >
                  <NavModuleCard
                    className={cn(
                      "flex h-full flex-col items-center gap-3 border-0 bg-transparent p-4 shadow-none",
                      navModuleCardClassName,
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-20 items-center justify-center rounded-2xl transition-shadow duration-150 group-hover:shadow-sm sm:size-24",
                        tileBg,
                      )}
                    >
                      <Icon className="size-8 shrink-0 sm:size-9" aria-hidden />
                    </span>
                    <span className="text-center text-sm font-medium leading-snug">
                      {item.label}
                    </span>
                  </NavModuleCard>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
