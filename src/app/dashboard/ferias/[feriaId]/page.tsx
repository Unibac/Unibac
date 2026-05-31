import Link from "next/link";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { Button } from "@/components/ui/button";
import { FeriaDetailView } from "@/modules/ferias/components/feria-detail-view";

type Props = {
  params: Promise<{ feriaId: string }>;
};

export default async function FeriaDetailPage({ params }: Props) {
  const { feriaId } = await params;
  const id = Number(feriaId);

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <DashboardPage>
        <p className="text-sm text-destructive">
          Identificador de feria inválido.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/ferias">Volver al listado</Link>
        </Button>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <FeriaDetailView feriaId={id} />
    </DashboardPage>
  );
}
