import { PageHeader } from "@/components/layout/page-header";
import { ConvocatoriasView } from "@/modules/convocatorias-emprendimiento/components/convocatorias-view";

export default function ConvocatoriasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Convocatorias"
        description="Convocatorias de emprendimiento, postulaciones y gestión."
      />
      <ConvocatoriasView />
    </div>
  );
}
