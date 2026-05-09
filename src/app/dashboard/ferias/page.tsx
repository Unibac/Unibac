import { PageHeader } from "@/components/layout/page-header";
import { FeriasView } from "@/modules/ferias/components/ferias-view";

export default function FeriasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ferias virtuales"
        description="Calendario de ferias, vitrina de propuestas y moderación para administradores; postulación para usuarios internos."
      />
      <FeriasView />
    </div>
  );
}
