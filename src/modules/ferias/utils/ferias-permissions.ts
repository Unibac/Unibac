import type { AuthProfileResponseDto } from "@/api/generated/models";
import {
  AuthProfileResponseDtoNivel,
  AuthProfileResponseDtoTipo,
} from "@/api/generated/models";

import {
  feriasCanPostular as feriasCanPostularFromProfile,
  isAdministrador,
} from "@/modules/auth/lib/profile-capabilities";

export function feriasIsAdmin(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  return profile?.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR;
}

/** Registrar/editar propuesta propia: delega a política de dominio (externo estudiante). */
export function feriasCanPostular(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  return feriasCanPostularFromProfile(profile);
}

/** CRUD del evento feria: administrador o personal interno (INTERNO_BASE). */
export function feriasCanManageEventos(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  if (!profile) return false;
  return (
    isAdministrador(profile) ||
    profile.tipo === AuthProfileResponseDtoTipo.INTERNO
  );
}
