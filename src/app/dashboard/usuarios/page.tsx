import { PageHeader } from "@/components/layout/page-header";
import { UsuariosView } from "@/modules/usuarios/components/usuarios-view";

export default function UsuariosPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuarios"
        description="Administración de cuentas y permisos por módulo y acción."
      />
      <UsuariosView />
    </div>
  );
}
