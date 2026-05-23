import { Suspense } from "react";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EgresadosView } from "@/modules/egresados/components/egresados-view";

export default function EgresadosPage() {
  return (
    <DashboardPage>
      <PageHeader
        title="Egresados"
        description="Registro de egresados, búsqueda por filtros y edición según permisos del backend."
      />
      <Suspense fallback={<Skeleton className="h-72 w-full" />}>
        <EgresadosView />
      </Suspense>
    </DashboardPage>
  );
}
