import { useQuery } from "@tanstack/react-query";

import {
  listAccionesCatalog,
  listModulosCatalog,
} from "@/modules/usuarios/api/catalog-api";
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
    queryFn: () => getUsuario(id!),
    enabled: Boolean(enabled && id != null && id > 0),
  });
}

export function useModulosCatalogQuery() {
  return useQuery({
    queryKey: usuariosCatalogKeys.modulos(),
    queryFn: listModulosCatalog,
    staleTime: CATALOG_STALE_MS,
  });
}

export function useAccionesCatalogQuery() {
  return useQuery({
    queryKey: usuariosCatalogKeys.acciones(),
    queryFn: listAccionesCatalog,
    staleTime: CATALOG_STALE_MS,
  });
}
