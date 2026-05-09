import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
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
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          Identificador de feria inválido.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/ferias">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Detalle de feria"
        description="Consultá la información de la feria, las propuestas y las acciones disponibles según tu rol."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/ferias">Volver a ferias</Link>
          </Button>
        }
      />
      <FeriaDetailView feriaId={id} />
    </div>
  );
}
