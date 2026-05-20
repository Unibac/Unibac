import type { FindEgresadosParams } from "@/modules/shared/types/api-models";

export const egresadosKeys = {
  all: ["egresados"] as const,
  lists: () => [...egresadosKeys.all, "list"] as const,
  list: (params: EgresadosListFilters) =>
    [...egresadosKeys.lists(), params] as const,
  details: () => [...egresadosKeys.all, "detail"] as const,
  detail: (id: number) => [...egresadosKeys.details(), id] as const,
  me: () => [...egresadosKeys.all, "me"] as const,
};

/** Filtros de listado; valores vacíos se omiten al llamar a la API. */
export type EgresadosListFilters = {
  nombre?: string;
  anioEgreso?: number;
  programaCarrera?: string;
  estadoLaboral?: FindEgresadosParams["estadoLaboral"];
};

export function toFindAllParams(
  filters: EgresadosListFilters,
): FindEgresadosParams | undefined {
  const params: FindEgresadosParams = {};
  if (filters.nombre?.trim()) {
    params.nombre = filters.nombre.trim();
  }
  if (filters.anioEgreso !== undefined && !Number.isNaN(filters.anioEgreso)) {
    params.anioEgreso = filters.anioEgreso;
  }
  if (filters.programaCarrera?.trim()) {
    params.programaCarrera = filters.programaCarrera.trim();
  }
  if (filters.estadoLaboral) {
    params.estadoLaboral = filters.estadoLaboral;
  }
  return Object.keys(params).length > 0 ? params : undefined;
}
