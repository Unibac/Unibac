"use client";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { AdministracionAdminGate } from "@/modules/administracion/components/administracion-admin-gate";
import { RolesView } from "@/modules/administracion/components/roles-view";

export default function AdministracionRolesPage() {
  return (
    <AdministracionAdminGate>
      <DashboardPage>
        <PageHeader
          title="Catálogo de roles"
          description="Roles del sistema, usuarios asignados y acceso a la matriz de permisos."
        />
        <RolesView />
      </DashboardPage>
    </AdministracionAdminGate>
  );
}
