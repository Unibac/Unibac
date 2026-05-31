import type { AuthProfile } from "@/modules/auth/types";
import {
  CategoriaUsuarioExterno,
  TipoUsuario,
} from "@/modules/shared/types/enums";

import { isStaffFullUx } from "@/modules/auth/lib/profile-capabilities";

export function isPortalExternoUx(profile: AuthProfile | undefined): boolean {
  if (!profile || isStaffFullUx(profile)) return false;
  return profile.tipo === TipoUsuario.EXTERNO && profile.categoria != null;
}

const CATEGORIA_LABELS: Record<CategoriaUsuarioExterno, string> = {
  [CategoriaUsuarioExterno.ESTUDIANTE]: "Estudiantes",
  [CategoriaUsuarioExterno.EGRESADO]: "Egresados",
  [CategoriaUsuarioExterno.EMPRESA]: "Empresas",
};

export function portalCategoriaLabel(
  categoria: CategoriaUsuarioExterno,
): string {
  return CATEGORIA_LABELS[categoria];
}
