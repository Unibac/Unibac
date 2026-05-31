import type { AuthProfile } from "@/modules/auth/types";
import {
  feriasCanBrowse as feriasCanBrowseFromProfile,
  feriasCanPostular as feriasCanPostularFromProfile,
  isAdministrador,
} from "@/modules/auth/lib/profile-capabilities";
import { TipoUsuario } from "@/modules/shared/types/enums";

/**
 * Política B — Ferias:
 * | Perfil | Browse | Postular | CRUD feria | Moderar |
 * | ADMIN / INTERNO | sí | no | sí (interno+) | admin only |
 * | EXTERNO ESTUDIANTE | sí | sí (próxima o activa) | no | no |
 * | EXTERNO EGRESADO/EMPRESA | sí | no | no | no |
 */

export function feriasCanBrowse(profile: AuthProfile | undefined): boolean {
  return feriasCanBrowseFromProfile(profile);
}

export function feriasIsAdmin(profile: AuthProfile | undefined): boolean {
  return isAdministrador(profile);
}

/** Registrar/editar propuesta propia: delega a política de dominio (externo estudiante). */
export function feriasCanPostular(profile: AuthProfile | undefined): boolean {
  return feriasCanPostularFromProfile(profile);
}

/** CRUD del evento feria: administrador o personal interno (INTERNO_BASE). */
export function feriasCanManageEventos(
  profile: AuthProfile | undefined,
): boolean {
  if (!profile) return false;
  return isAdministrador(profile) || profile.tipo === TipoUsuario.INTERNO;
}
