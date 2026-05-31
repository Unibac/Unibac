import { useQuery } from "@tanstack/react-query";

import {
  getFeria,
  listFerias,
  listMisPropuestas,
  listPropuestasPorFeria,
  listPropuestasPorFeriaTodosEstados,
} from "@/modules/ferias/api/ferias-api";
import {
  type PropuestasPorFeriaEstadoFilter,
  feriasKeys,
} from "@/modules/ferias/query-keys";

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

type UsePropuestasPorFeriaQueryOptions = {
  enabled?: boolean;
  /** Admin + filtro “Todas”: fusionar POSTULADO, ACEPTADO y RECHAZADO. */
  adminVerTodasEstados?: boolean;
};

export function usePropuestasPorFeriaQuery(
  feriaId: number | null,
  estado: PropuestasPorFeriaEstadoFilter,
  options?: UsePropuestasPorFeriaQueryOptions,
) {
  const enabled = options?.enabled ?? true;
  const adminVerTodasEstados = options?.adminVerTodasEstados ?? false;
  const fetchAllEstados = adminVerTodasEstados && estado === "todas";

  return useQuery({
    queryKey: feriasKeys.propuestas(feriaId ?? 0, estado),
    queryFn: () => {
      if (feriaId == null || feriaId <= 0) {
        return Promise.reject(new Error("ID de feria inválido"));
      }
      if (fetchAllEstados) {
        return listPropuestasPorFeriaTodosEstados(feriaId);
      }
      if (estado === "todas") {
        return listPropuestasPorFeria(feriaId);
      }
      return listPropuestasPorFeria(feriaId, { estado });
    },
    enabled: Boolean(enabled && feriaId != null && feriaId > 0),
  });
}
