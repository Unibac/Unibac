import { useQuery } from "@tanstack/react-query";

import {
  getDirectorioEmprendimiento,
  listDirectorioEmprendimientos,
} from "@/modules/directorio-emprendimientos/api/directorio-api";
import { directorioKeys } from "@/modules/directorio-emprendimientos/query-keys";

export function useDirectorioListQuery() {
  return useQuery({
    queryKey: directorioKeys.list(),
    queryFn: listDirectorioEmprendimientos,
  });
}

export function useDirectorioDetailQuery(id: number | null, enabled: boolean) {
  return useQuery({
    queryKey: directorioKeys.detail(id ?? 0),
    queryFn: () => getDirectorioEmprendimiento(id!),
    enabled: Boolean(enabled && id != null && id > 0),
  });
}
