/**
 * Rutas del menú lateral del dashboard y visibilidad por perfil.
 * Alinear `SIDEBAR_HREFS_BY_CATEGORIA` con permisos de módulo en backend.
 */
import type { AuthProfileResponseDto } from "@/api/generated/models";
import {
  AuthProfileResponseDtoCategoria,
  AuthProfileResponseDtoTipo,
} from "@/api/generated/models";

import type { DashboardNavHref } from "@/modules/auth/lib/dashboard-nav-items";
import { DASHBOARD_NAV_ITEM_DATA } from "@/modules/auth/lib/dashboard-nav-items";
import {
  externalCategoria,
  isAdministrador,
  isStaffFullUx,
} from "@/modules/auth/lib/profile-capabilities";

/** Allow-list por categoría de usuario externo (literales del API).
 * Mantener coherente con `*-CanAccessModule` en profile-capabilities y RBAC backend.
 */
export const SIDEBAR_HREFS_BY_CATEGORIA: Record<
  AuthProfileResponseDtoCategoria,
  readonly DashboardNavHref[]
> = {
  [AuthProfileResponseDtoCategoria.ESTUDIANTE]: [
    "/dashboard",
    "/dashboard/convocatorias",
    "/dashboard/talento-perfiles",
    "/dashboard/ferias",
    "/dashboard/directorio-emprendimientos",
  ],
  [AuthProfileResponseDtoCategoria.EGRESADO]: [
    "/dashboard",
    "/dashboard/egresados",
    "/dashboard/directorio-emprendimientos",
    "/dashboard/convocatorias",
    "/dashboard/talento-perfiles",
    "/dashboard/ferias",
  ],
  [AuthProfileResponseDtoCategoria.EMPRESA]: [
    "/dashboard",
    "/dashboard/directorio-emprendimientos",
    "/dashboard/convocatorias",
    "/dashboard/ferias",
  ],
};

export function getVisibleDashboardNavHrefs(
  profile: AuthProfileResponseDto,
): readonly DashboardNavHref[] {
  const allHrefs = DASHBOARD_NAV_ITEM_DATA.map((i) => i.href);

  if (isStaffFullUx(profile)) {
    return allHrefs.filter(
      (href) => href !== "/dashboard/usuarios" || isAdministrador(profile),
    );
  }

  if (profile.tipo === AuthProfileResponseDtoTipo.EXTERNO) {
    const cat = externalCategoria(profile);
    if (cat === undefined) {
      return ["/dashboard"];
    }
    const allowed = new Set<string>(SIDEBAR_HREFS_BY_CATEGORIA[cat]);
    return allHrefs.filter((href) => allowed.has(href));
  }

  return allHrefs;
}
