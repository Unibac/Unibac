"use client";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { AdministracionAdminGate } from "@/modules/administracion/components/administracion-admin-gate";
import { AdministracionHubView } from "@/modules/administracion/components/administracion-hub-view";

export default function AdministracionPage() {
  return (
    <AdministracionAdminGate>
      <DashboardPage>
        <PageHeader
          title="Administración del sistema"
          description="Padrones de registro, permisos por rol y configuración de cuentas."
        />
        <AdministracionHubView />
      </DashboardPage>
    </AdministracionAdminGate>
  );
}
