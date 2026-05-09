import type { ConvocatoriasEmprendimientoControllerFindAllPublicacionesParams } from "@/api/generated/models";

export type ConvocatoriasListFilters = {
  tipoConvocatoria?: ConvocatoriasEmprendimientoControllerFindAllPublicacionesParams["tipoConvocatoria"];
  activo?: boolean;
};

export function toListParams(
  filters: ConvocatoriasListFilters,
): ConvocatoriasEmprendimientoControllerFindAllPublicacionesParams | undefined {
  const params: ConvocatoriasEmprendimientoControllerFindAllPublicacionesParams =
    {};
  if (filters.tipoConvocatoria) {
    params.tipoConvocatoria = filters.tipoConvocatoria;
  }
  if (filters.activo !== undefined) {
    params.activo = filters.activo;
  }
  return Object.keys(params).length > 0 ? params : undefined;
}

export const convocatoriasKeys = {
  all: ["convocatorias-emprendimiento"] as const,
  lists: () => [...convocatoriasKeys.all, "list"] as const,
  list: (filters: ConvocatoriasListFilters) =>
    [...convocatoriasKeys.lists(), filters] as const,
  details: () => [...convocatoriasKeys.all, "detail"] as const,
  detail: (id: number) => [...convocatoriasKeys.details(), id] as const,
};

export const postulacionesKeys = {
  all: [...convocatoriasKeys.all, "postulaciones"] as const,
  mine: () => [...postulacionesKeys.all, "mine"] as const,
  byConvocatoria: (publicacionId: number) =>
    [...postulacionesKeys.all, "byConvocatoria", publicacionId] as const,
};
