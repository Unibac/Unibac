"use client";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { AdministracionAdminGate } from "@/modules/administracion/components/administracion-admin-gate";
import { ModulosView } from "@/modules/administracion/components/modulos-view";

export default function AdministracionModulosPage() {
  return (
    <AdministracionAdminGate>
      <DashboardPage>
        <PageHeader
          title="Módulos RBAC"
          description="Áreas del sistema usadas en la matriz de permisos por rol."
        />
        <ModulosView />
      </DashboardPage>
    </AdministracionAdminGate>
  );
}
