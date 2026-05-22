"use client";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { AdministracionAdminGate } from "@/modules/administracion/components/administracion-admin-gate";
import { PadronesEstudiantesView } from "@/modules/administracion/components/padrones-estudiantes-view";

export default function PadronesEstudiantesPage() {
  return (
    <AdministracionAdminGate>
      <DashboardPage>
        <PageHeader
          title="Padrón de estudiantes"
          description="Personas habilitadas para registrarse como estudiante externo."
        />
        <PadronesEstudiantesView />
      </DashboardPage>
    </AdministracionAdminGate>
  );
}
