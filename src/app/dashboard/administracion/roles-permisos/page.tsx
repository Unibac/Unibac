"use client";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { AdministracionAdminGate } from "@/modules/administracion/components/administracion-admin-gate";
import { RolesPermisosView } from "@/modules/administracion/components/roles-permisos-view";

export default function RolesPermisosPage() {
  return (
    <AdministracionAdminGate>
      <DashboardPage>
        <PageHeader
          title="Roles y permisos"
          description="Asigná qué acciones puede realizar cada rol en cada módulo."
        />
        <RolesPermisosView />
      </DashboardPage>
    </AdministracionAdminGate>
  );
}
