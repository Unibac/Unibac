"use client";

import type { ReactNode } from "react";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageCallout } from "@/components/shared/page-callout";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/modules/auth/hooks/use-profile";
import { isAdministrador } from "@/modules/auth/lib/profile-capabilities";

export function AdministracionAdminGate({ children }: { children: ReactNode }) {
  const profile = useProfile();

  if (profile.isPending) {
    return (
      <DashboardPage>
        <Skeleton className="h-48 w-full" />
      </DashboardPage>
    );
  }

  if (!profile.data || !isAdministrador(profile.data)) {
    return (
      <DashboardPage>
        <PageCallout variant="destructive" title="Acceso restringido">
          Solo usuarios con nivel administrador pueden acceder a esta sección.
        </PageCallout>
      </DashboardPage>
    );
  }

  return children;
}
