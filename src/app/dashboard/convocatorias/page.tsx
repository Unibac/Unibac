import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { ConvocatoriasView } from "@/modules/convocatorias-emprendimiento/components/convocatorias-view";

export default function ConvocatoriasPage() {
  return (
    <DashboardPage>
      <PageHeader
        title="Convocatorias de emprendimiento"
        description="Publicaciones, postulaciones y gestión según tu rol."
      />
      <ConvocatoriasView />
    </DashboardPage>
  );
}
