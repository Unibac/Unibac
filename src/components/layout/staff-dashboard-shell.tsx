"use client";

import { Loader2Icon, LogOutIcon } from "lucide-react";
import type { ReactNode } from "react";

import { DashboardListLayoutToggle } from "@/components/shared/dashboard-list-layout-toggle";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardListLayoutProvider } from "@/components/layout/dashboard-list-layout";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type StaffDashboardShellProps = {
  children: ReactNode;
  usuario: string;
  onLogout: () => void;
  logoutPending: boolean;
};

export function StaffDashboardShell({
  children,
  usuario,
  onLogout,
  logoutPending,
}: StaffDashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-h-svh flex-col">
        <DashboardListLayoutProvider>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4 lg:px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-1 h-6" />
            <div className="flex flex-1 flex-col gap-0 overflow-hidden">
              <span className="truncate text-xs text-muted-foreground">
                Sesión iniciada
              </span>
              <span className="truncate text-sm font-medium">{usuario}</span>
            </div>
            <DashboardListLayoutToggle />
            <ModeToggle />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLogout}
              disabled={logoutPending}
            >
              {logoutPending ? (
                <Loader2Icon
                  className="size-4 shrink-0 animate-spin"
                  data-icon="inline-start"
                  aria-hidden
                />
              ) : (
                <LogOutIcon
                  className="size-4 shrink-0"
                  data-icon="inline-start"
                />
              )}
              Salir
            </Button>
          </header>
          <div className="layout-dashboard-main">{children}</div>
        </DashboardListLayoutProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
