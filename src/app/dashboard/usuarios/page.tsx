import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { UsuariosView } from "@/modules/usuarios/components/usuarios-view";

export default function UsuariosPage() {
  return (
    <DashboardPage>
      <PageHeader
        title="Usuarios"
        description="Administración de cuentas y asignación de rol RBAC (permisos efectivos del rol)."
      />
      <UsuariosView />
    </DashboardPage>
  );
}
