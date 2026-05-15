"use client";

import { Loader2Icon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { DashboardListLayoutToggle } from "@/components/shared/dashboard-list-layout-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLogout } from "@/modules/auth/hooks/use-logout";
import { useProfile } from "@/modules/auth/hooks/use-profile";

import { AppSidebar } from "./app-sidebar";
import { DashboardListLayoutProvider } from "./dashboard-list-layout";
import { ModeToggle } from "./mode-toggle";

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const profile = useProfile();
  const logout = useLogout();

  useEffect(() => {
    if (profile.isError) {
      router.replace("/login");
    }
  }, [profile.isError, router]);

  async function handleLogout() {
    try {
      await logout.mutateAsync();
    } catch {
      /* cookie puede estar ya inválida; seguir saliendo */
    }
    router.replace("/login");
    router.refresh();
  }

  if (profile.isPending) {
    return (
      <div className="flex min-h-svh flex-col gap-6 bg-background px-4 py-6 lg:px-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full flex-1" />
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return null;
  }

  return (
    <TooltipProvider>
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
                <span className="truncate text-sm font-medium">
                  {profile.data.usuario}
                </span>
              </div>
              <DashboardListLayoutToggle />
              <ModeToggle />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleLogout()}
                disabled={logout.isPending}
              >
                {logout.isPending ? (
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
    </TooltipProvider>
  );
}
