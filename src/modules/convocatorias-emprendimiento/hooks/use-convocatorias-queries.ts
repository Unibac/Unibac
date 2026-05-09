import { useQuery } from "@tanstack/react-query";

import {
  getPublicacion,
  listMisPostulaciones,
  listPostulacionesPorConvocatoria,
  listPublicaciones,
} from "@/modules/convocatorias-emprendimiento/api/convocatorias-api";
import {
  convocatoriasKeys,
  postulacionesKeys,
  toListParams,
  type ConvocatoriasListFilters,
} from "@/modules/convocatorias-emprendimiento/query-keys";

export function useConvocatoriasListQuery(filters: ConvocatoriasListFilters) {
  return useQuery({
    queryKey: convocatoriasKeys.list(filters),
    queryFn: () => listPublicaciones(toListParams(filters)),
  });
}

export function useConvocatoriaDetailQuery(
  id: number | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: convocatoriasKeys.detail(id ?? 0),
    queryFn: () => getPublicacion(id!),
    enabled: Boolean(enabled && id != null && id > 0),
  });
}

export function useMisPostulacionesQuery(enabled: boolean) {
  return useQuery({
    queryKey: postulacionesKeys.mine(),
    queryFn: listMisPostulaciones,
    enabled,
  });
}

export function usePostulacionesPorConvocatoriaQuery(
  publicacionId: number | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: postulacionesKeys.byConvocatoria(publicacionId ?? 0),
    queryFn: () => listPostulacionesPorConvocatoria(publicacionId!),
    enabled: Boolean(enabled && publicacionId != null && publicacionId > 0),
  });
}
