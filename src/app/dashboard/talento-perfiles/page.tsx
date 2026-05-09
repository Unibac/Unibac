import { PageHeader } from "@/components/layout/page-header";
import { TalentoPerfilesView } from "@/modules/talento-perfiles/components/talento-perfiles-view";

export default function TalentoPerfilesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Talento"
        description="Banco de perfiles creativos: registro asociado a tu usuario, edición según permisos y eliminación solo para administradores."
      />
      <TalentoPerfilesView />
    </div>
  );
}
