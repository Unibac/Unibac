import { useQuery } from "@tanstack/react-query";

import { listRolesCatalog } from "@/modules/usuarios/api/roles-api";
import { getUsuario, listUsuarios } from "@/modules/usuarios/api/usuarios-api";
import {
  usuariosCatalogKeys,
  usuariosKeys,
} from "@/modules/usuarios/query-keys";

const CATALOG_STALE_MS = 5 * 60 * 1000;

export function useUsuariosListQuery() {
  return useQuery({
    queryKey: usuariosKeys.list(),
    queryFn: listUsuarios,
  });
}

export function useUsuarioDetailQuery(id: number | null, enabled: boolean) {
  return useQuery({
    queryKey: usuariosKeys.detail(id ?? 0),
    queryFn: () => {
      if (id == null || id <= 0) {
        return Promise.reject(new Error("ID de usuario inválido"));
      }
      return getUsuario(id);
    },
    enabled: Boolean(enabled && id != null && id > 0),
  });
}

export function useRolesCatalogQuery() {
  return useQuery({
    queryKey: usuariosCatalogKeys.roles(),
    queryFn: listRolesCatalog,
    staleTime: CATALOG_STALE_MS,
  });
}
