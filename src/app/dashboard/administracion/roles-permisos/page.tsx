"use client";

import { Suspense } from "react";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { AdministracionAdminGate } from "@/modules/administracion/components/administracion-admin-gate";
import { RolesPermisosView } from "@/modules/administracion/components/roles-permisos-view";

export default function RolesPermisosPage() {
  return (
    <AdministracionAdminGate>
      <DashboardPage>
        <PageHeader
          title="Matriz de permisos"
          description="Asigná qué acciones puede realizar cada rol en cada módulo."
        />
        <Suspense fallback={<Skeleton className="h-72 w-full" />}>
          <RolesPermisosView />
        </Suspense>
      </DashboardPage>
    </AdministracionAdminGate>
  );
}
