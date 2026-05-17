"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { DashboardListLayoutProvider } from "@/components/layout/dashboard-list-layout";
import { PortalDashboardShell } from "@/components/layout/portal/portal-dashboard-shell";
import { StaffDashboardShell } from "@/components/layout/staff-dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useLogout } from "@/modules/auth/hooks/use-logout";
import { useProfile } from "@/modules/auth/hooks/use-profile";
import { isPortalExternoUx } from "@/modules/auth/lib/portal-ux";

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const profile = useProfile();
  const logout = useLogout();

  useEffect(() => {
    if (profile.isError) {
      router.replace("/login");
    }
  }, [profile.isError, router]);

  function handleLogout() {
    void (async () => {
      try {
        await logout.mutateAsync();
      } catch {
        /* cookie puede estar ya inválida; seguir saliendo */
      }
      router.replace("/login");
      router.refresh();
    })();
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

  const logoutPending = logout.isPending;
  const onLogout = handleLogout;

  if (isPortalExternoUx(profile.data)) {
    return (
      <TooltipProvider>
        <DashboardListLayoutProvider>
          <PortalDashboardShell
            onLogout={onLogout}
            logoutPending={logoutPending}
          >
            {children}
          </PortalDashboardShell>
        </DashboardListLayoutProvider>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <StaffDashboardShell
        usuario={profile.data.usuario}
        onLogout={onLogout}
        logoutPending={logoutPending}
      >
        {children}
      </StaffDashboardShell>
    </TooltipProvider>
  );
}
