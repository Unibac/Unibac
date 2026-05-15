import type { AuthProfileResponseDto } from "@/api/generated/models";
import { AuthProfileResponseDtoNivel } from "@/api/generated/models";

import {
  feriasCanAccessModule,
  isStaffFullUx,
} from "@/modules/auth/lib/profile-capabilities";

export function feriasIsAdmin(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  return profile?.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR;
}

/** Propuestas en ferias activas: staff institucional o externos estudiante/egresado (alineado con sidebar). */
export function feriasCanPostular(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  if (!profile) return false;
  if (isStaffFullUx(profile)) return true;
  return feriasCanAccessModule(profile);
}
