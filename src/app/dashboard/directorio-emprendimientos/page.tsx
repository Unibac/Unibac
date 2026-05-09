import { PageHeader } from "@/components/layout/page-header";
import { DirectorioView } from "@/modules/directorio-emprendimientos/components/directorio-view";

export default function DirectorioEmprendimientosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Directorio de emprendimientos"
        description="Registro y gestión de emprendimientos creativos."
      />
      <DirectorioView />
    </div>
  );
}
