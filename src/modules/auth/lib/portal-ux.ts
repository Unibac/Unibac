import type { AuthProfileResponseDto } from "@/api/generated/models";
import {
  AuthProfileResponseDtoCategoria,
  AuthProfileResponseDtoTipo,
} from "@/api/generated/models";

import { isStaffFullUx } from "@/modules/auth/lib/profile-capabilities";

export function isPortalExternoUx(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  if (!profile || isStaffFullUx(profile)) return false;
  return (
    profile.tipo === AuthProfileResponseDtoTipo.EXTERNO &&
    profile.categoria != null
  );
}

const CATEGORIA_LABELS: Record<AuthProfileResponseDtoCategoria, string> = {
  [AuthProfileResponseDtoCategoria.ESTUDIANTE]: "Estudiantes",
  [AuthProfileResponseDtoCategoria.EGRESADO]: "Egresados",
  [AuthProfileResponseDtoCategoria.EMPRESA]: "Empresas",
};

export function portalCategoriaLabel(
  categoria: AuthProfileResponseDtoCategoria,
): string {
  return CATEGORIA_LABELS[categoria];
}
