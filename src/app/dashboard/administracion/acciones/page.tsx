"use client";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { AdministracionAdminGate } from "@/modules/administracion/components/administracion-admin-gate";
import { AccionesView } from "@/modules/administracion/components/acciones-view";

export default function AdministracionAccionesPage() {
  return (
    <AdministracionAdminGate>
      <DashboardPage>
        <PageHeader
          title="Acciones RBAC"
          description="Operaciones disponibles en la matriz de permisos (consulta, edición, etc.)."
        />
        <AccionesView />
      </DashboardPage>
    </AdministracionAdminGate>
  );
}
