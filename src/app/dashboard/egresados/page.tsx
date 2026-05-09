import { PageHeader } from "@/components/layout/page-header";
import { EgresadosView } from "@/modules/egresados/components/egresados-view";

export default function EgresadosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Egresados"
        description="Registro de egresados, búsqueda por filtros y edición según permisos del backend."
      />
      <EgresadosView />
    </div>
  );
}
