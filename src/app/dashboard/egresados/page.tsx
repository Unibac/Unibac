import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { EgresadosView } from "@/modules/egresados/components/egresados-view";

export default function EgresadosPage() {
  return (
    <DashboardPage>
      <PageHeader
        title="Egresados"
        description="Registro de egresados, búsqueda por filtros y edición según permisos del backend."
      />
      <EgresadosView />
    </DashboardPage>
  );
}
