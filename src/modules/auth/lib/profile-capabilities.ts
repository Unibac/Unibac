/**
 * Capacidades UX por perfil (`GET /auth/profile`).
 * Debe alinearse con RBAC del backend; solo oculta/mostrar UI — la API sigue siendo autoridad.
 */
import type { AuthProfileResponseDto } from "@/api/generated/models";
import {
  AuthProfileResponseDtoCategoria,
  AuthProfileResponseDtoNivel,
  AuthProfileResponseDtoTipo,
} from "@/api/generated/models";

export function isAdministrador(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  return profile?.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR;
}

/** Admin o usuario institucional: panel operativo completo en UX. */
export function isStaffFullUx(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  if (!profile) return false;
  return (
    profile.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR ||
    profile.tipo === AuthProfileResponseDtoTipo.INTERNO
  );
}

export function externalCategoria(
  profile: AuthProfileResponseDto | undefined,
): AuthProfileResponseDtoCategoria | undefined {
  if (!profile || profile.tipo !== AuthProfileResponseDtoTipo.EXTERNO) {
    return undefined;
  }
  return profile.categoria;
}

/** Ver módulo convocatorias en UX (staff o externo con categoría). */
export function convocatoriasCanAccessModule(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  if (!profile) return false;
  if (isStaffFullUx(profile)) return true;
  return externalCategoria(profile) != null;
}

/** Postular a convocatorias: staff o cualquier externo con categoría (empresa incluida si el módulo está en su menú). */
export function convocatoriasCanPostular(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  return convocatoriasCanAccessModule(profile);
}

/** Módulo egresados: personal y externos categoría EGRESADO. */
export function egresadosCanAccessModule(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  if (!profile) return false;
  if (isStaffFullUx(profile)) return true;
  return (
    externalCategoria(profile) === AuthProfileResponseDtoCategoria.EGRESADO
  );
}

/** Directorio: staff + externos con categoría (incluye empresa). */
export function directorioCanAccessModule(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  if (!profile) return false;
  if (isStaffFullUx(profile)) return true;
  const cat = externalCategoria(profile);
  return (
    cat === AuthProfileResponseDtoCategoria.ESTUDIANTE ||
    cat === AuthProfileResponseDtoCategoria.EGRESADO ||
    cat === AuthProfileResponseDtoCategoria.EMPRESA
  );
}

/** Talento: staff + estudiante/egresado (no empresa en política UX actual). */
export function talentoCanAccessModule(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  if (!profile) return false;
  if (isStaffFullUx(profile)) return true;
  const cat = externalCategoria(profile);
  return (
    cat === AuthProfileResponseDtoCategoria.ESTUDIANTE ||
    cat === AuthProfileResponseDtoCategoria.EGRESADO
  );
}

/** Ferias (propuestas): staff + estudiante/egresado. */
export function feriasCanAccessModule(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  if (!profile) return false;
  if (isStaffFullUx(profile)) return true;
  const cat = externalCategoria(profile);
  return (
    cat === AuthProfileResponseDtoCategoria.ESTUDIANTE ||
    cat === AuthProfileResponseDtoCategoria.EGRESADO
  );
}
