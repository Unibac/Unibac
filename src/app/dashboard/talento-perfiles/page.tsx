import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { TalentoPerfilesView } from "@/modules/talento-perfiles/components/talento-perfiles-view";

export default function TalentoPerfilesPage() {
  return (
    <DashboardPage>
      <PageHeader
        title="Talento y perfiles"
        description="Registro y consulta de perfiles de talento creativo."
      />
      <TalentoPerfilesView />
    </DashboardPage>
  );
}
