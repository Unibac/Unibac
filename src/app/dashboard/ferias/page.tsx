import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { FeriasView } from "@/modules/ferias/components/ferias-view";

export default function FeriasPage() {
  return (
    <DashboardPage>
      <PageHeader
        title="Ferias virtuales"
        description="Calendario de ferias y vitrina de propuestas. El registro de emprendimientos está reservado a estudiantes externos; administradores moderan y el personal interno gestiona eventos."
      />
      <FeriasView />
    </DashboardPage>
  );
}
