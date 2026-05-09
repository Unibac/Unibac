import { useQuery } from "@tanstack/react-query";

import type { FeriasControllerFindPropuestasPorFeriaEstado } from "@/api/generated/models";

import {
  getFeria,
  listFerias,
  listMisPropuestas,
  listPropuestasPorFeria,
} from "@/modules/ferias/api/ferias-api";
import { feriasKeys } from "@/modules/ferias/query-keys";

export function useFeriasListQuery() {
  return useQuery({
    queryKey: feriasKeys.list(),
    queryFn: listFerias,
  });
}

export function useFeriaDetailQuery(id: number | null, enabled = true) {
  return useQuery({
    queryKey: feriasKeys.detail(id ?? 0),
    queryFn: () => {
      if (id == null || id <= 0) {
        return Promise.reject(new Error("ID de feria inválido"));
      }
      return getFeria(id);
    },
    enabled: Boolean(enabled && id != null && id > 0),
  });
}

export function useMisPropuestasQuery(enabled: boolean) {
  return useQuery({
    queryKey: feriasKeys.misPropuestas(),
    queryFn: listMisPropuestas,
    enabled,
  });
}

export function usePropuestasPorFeriaQuery(
  feriaId: number | null,
  estado: FeriasControllerFindPropuestasPorFeriaEstado | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: feriasKeys.propuestas(feriaId ?? 0, estado),
    queryFn: () => {
      if (feriaId == null || feriaId <= 0) {
        return Promise.reject(new Error("ID de feria inválido"));
      }
      return listPropuestasPorFeria(feriaId, estado ? { estado } : undefined);
    },
    enabled: Boolean(enabled && feriaId != null && feriaId > 0),
  });
}
