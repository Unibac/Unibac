"use client";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { AdministracionAdminGate } from "@/modules/administracion/components/administracion-admin-gate";
import { PadronesEgresadosView } from "@/modules/administracion/components/padrones-egresados-view";

export default function PadronesEgresadosPage() {
  return (
    <AdministracionAdminGate>
      <DashboardPage>
        <PageHeader
          title="Padrón de egresados"
          description="Identificaciones habilitadas para registro público como egresado."
        />
        <PadronesEgresadosView />
      </DashboardPage>
    </AdministracionAdminGate>
  );
}
