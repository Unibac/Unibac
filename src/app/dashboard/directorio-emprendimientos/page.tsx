import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { DirectorioView } from "@/modules/directorio-emprendimientos/components/directorio-view";

export default function DirectorioPage() {
  return (
    <DashboardPage>
      <PageHeader
        title="Directorio de emprendimientos"
        description="Perfiles públicos de emprendimientos registrados en la plataforma."
      />
      <DirectorioView />
    </DashboardPage>
  );
}
