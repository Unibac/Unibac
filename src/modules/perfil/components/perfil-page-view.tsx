"use client";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { PageHeader } from "@/components/layout/page-header";
import { useProfile } from "@/modules/auth/hooks/use-profile";
import { CuentaPerfilSection } from "@/modules/perfil/components/cuenta-perfil-section";
import { EgresadoPerfilSection } from "@/modules/perfil/components/egresado-perfil-section";
import { EmpresaPerfilSection } from "@/modules/perfil/components/empresa-perfil-section";
import { EstudiantePerfilLinks } from "@/modules/perfil/components/estudiante-perfil-links";
import {
  perfilSectionsForProfile,
  useMiEgresado,
} from "@/modules/perfil/hooks/use-perfil-queries";

export function PerfilPageView() {
  const profile = useProfile();
  const sections = profile.data ? perfilSectionsForProfile(profile.data) : null;
  const egresadoQuery = useMiEgresado(sections?.showEgresado ?? false);

  if (!profile.data || !sections) {
    return null;
  }

  return (
    <DashboardPage className="flex flex-col gap-6">
      <PageHeader
        title="Mi perfil"
        description="Gestioná los datos opcionales de tu cuenta y completá la información de tu perfil según tu tipo de usuario."
      />
      <CuentaPerfilSection />
      {sections.showEmpresa ? <EmpresaPerfilSection /> : null}
      {sections.showEgresado ? (
        <EgresadoPerfilSection
          egresado={egresadoQuery.data ?? null}
          isLoading={egresadoQuery.isPending}
        />
      ) : null}
      {sections.showEstudianteLinks ? <EstudiantePerfilLinks /> : null}
    </DashboardPage>
  );
}
