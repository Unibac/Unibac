import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import {
  getEgresado,
  getEgresadoMe,
  listEgresados,
} from "@/modules/egresados/api/egresados-api";
import {
  type EgresadosListFilters,
  egresadosKeys,
  toFindAllParams,
} from "@/modules/egresados/query-keys";

export function useEgresadosListQuery(filters: EgresadosListFilters) {
  return useQuery({
    queryKey: egresadosKeys.list(filters),
    queryFn: () => listEgresados(toFindAllParams(filters)),
  });
}

export function useEgresadoDetailQuery(id: number | null, enabled: boolean) {
  return useQuery({
    queryKey: egresadosKeys.detail(id ?? 0),
    queryFn: () => getEgresado(id!),
    enabled: Boolean(enabled && id != null && id > 0),
  });
}

/** `null` si el usuario no tiene registro (404). Otros errores propagan. */
export function useEgresadoMeQuery() {
  return useQuery({
    queryKey: egresadosKeys.me(),
    queryFn: async () => {
      try {
        return await getEgresadoMe();
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          return null;
        }
        throw e;
      }
    },
    retry: false,
  });
}
