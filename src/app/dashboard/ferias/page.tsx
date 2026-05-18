import { PageHeader } from "@/components/layout/page-header";
import { FeriasView } from "@/modules/ferias/components/ferias-view";

export default function FeriasPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ferias virtuales"
        description="Calendario de ferias y vitrina de propuestas. El registro de emprendimientos está reservado a estudiantes externos; administradores moderan y el personal interno gestiona eventos."
      />
      <FeriasView />
    </div>
  );
}
