/**
 * Capacidades UX por perfil (`GET /api/auth/profile`).
 * Debe alinearse con RBAC del backend; solo oculta/mostrar UI — la API sigue siendo autoridad.
 */
import type { AuthProfile } from "@/modules/auth/types";
import {
  CategoriaUsuarioExterno,
  NivelUsuario,
  TipoUsuario,
} from "@/modules/shared/types/enums";

export function isAdministrador(profile: AuthProfile | undefined): boolean {
  return profile?.nivel === NivelUsuario.ADMINISTRADOR;
}

/** Admin o usuario institucional: panel operativo completo en UX. */
export function isStaffFullUx(profile: AuthProfile | undefined): boolean {
  if (!profile) return false;
  return (
    profile.nivel === NivelUsuario.ADMINISTRADOR ||
    profile.tipo === TipoUsuario.INTERNO
  );
}

export function externalCategoria(
  profile: AuthProfile | undefined,
): CategoriaUsuarioExterno | undefined {
  if (!profile || profile.tipo !== TipoUsuario.EXTERNO) {
    return undefined;
  }
  return profile.categoria ?? undefined;
}

export function convocatoriasCanAccessModule(
  profile: AuthProfile | undefined,
): boolean {
  if (!profile) return false;
  if (isStaffFullUx(profile)) return true;
  return externalCategoria(profile) != null;
}

export function convocatoriasCanPostular(
  profile: AuthProfile | undefined,
): boolean {
  return convocatoriasCanAccessModule(profile);
}

export function egresadosCanAccessModule(
  profile: AuthProfile | undefined,
): boolean {
  if (!profile) return false;
  if (isStaffFullUx(profile)) return true;
  return externalCategoria(profile) === CategoriaUsuarioExterno.EGRESADO;
}

export function directorioCanAccessModule(
  profile: AuthProfile | undefined,
): boolean {
  if (!profile) return false;
  if (isStaffFullUx(profile)) return true;
  const cat = externalCategoria(profile);
  return (
    cat === CategoriaUsuarioExterno.ESTUDIANTE ||
    cat === CategoriaUsuarioExterno.EGRESADO ||
    cat === CategoriaUsuarioExterno.EMPRESA
  );
}

export function talentoCanAccessModule(
  profile: AuthProfile | undefined,
): boolean {
  if (!profile) return false;
  if (isStaffFullUx(profile)) return true;
  const cat = externalCategoria(profile);
  return (
    cat === CategoriaUsuarioExterno.ESTUDIANTE ||
    cat === CategoriaUsuarioExterno.EGRESADO
  );
}

export function feriasCanBrowse(profile: AuthProfile | undefined): boolean {
  if (!profile) return false;
  if (isStaffFullUx(profile)) return true;
  const cat = externalCategoria(profile);
  return (
    cat === CategoriaUsuarioExterno.ESTUDIANTE ||
    cat === CategoriaUsuarioExterno.EGRESADO ||
    cat === CategoriaUsuarioExterno.EMPRESA
  );
}

/** @deprecated Usar `feriasCanBrowse`. */
export function feriasCanAccessModule(
  profile: AuthProfile | undefined,
): boolean {
  return feriasCanBrowse(profile);
}

export function feriasCanPostular(profile: AuthProfile | undefined): boolean {
  if (!profile) return false;
  return (
    profile.tipo === TipoUsuario.EXTERNO &&
    profile.categoria === CategoriaUsuarioExterno.ESTUDIANTE
  );
}
