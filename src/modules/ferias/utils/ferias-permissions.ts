import type { AuthProfileResponseDto } from "@/api/generated/models";
import {
  AuthProfileResponseDtoNivel,
  AuthProfileResponseDtoTipo,
} from "@/api/generated/models";

import {
  feriasCanBrowse as feriasCanBrowseFromProfile,
  feriasCanPostular as feriasCanPostularFromProfile,
  isAdministrador,
} from "@/modules/auth/lib/profile-capabilities";

/**
 * Política B — Ferias:
 * | Perfil | Browse | Postular | CRUD feria | Moderar |
 * | ADMIN / INTERNO | sí | no | sí (interno+) | admin only |
 * | EXTERNO ESTUDIANTE | sí | sí | no | no |
 * | EXTERNO EGRESADO/EMPRESA | sí | no | no | no |
 */

export function feriasCanBrowse(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  return feriasCanBrowseFromProfile(profile);
}

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
