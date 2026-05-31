"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardListLayoutToggle } from "@/components/shared/dashboard-list-layout-toggle";
import { Button } from "@/components/ui/button";
import { PortalTopBar } from "@/components/layout/portal/portal-top-bar";
import { ModeToggle } from "@/components/layout/mode-toggle";

type PortalDashboardShellProps = {
  children: ReactNode;
  onLogout: () => void;
  logoutPending: boolean;
};

export function PortalDashboardShell({
  children,
  onLogout,
  logoutPending,
}: PortalDashboardShellProps) {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard";

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PortalTopBar onLogout={onLogout} logoutPending={logoutPending} />
      {!isHome ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2 lg:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeftIcon
                className="size-4 shrink-0"
                data-icon="inline-start"
                aria-hidden
              />
              Volver al inicio
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <DashboardListLayoutToggle />
            <ModeToggle />
          </div>
        </div>
      ) : null}
      <main
        className={
          isHome
            ? "flex flex-1 flex-col"
            : "layout-dashboard-main flex flex-1 flex-col"
        }
      >
        {children}
      </main>
    </div>
  );
}
