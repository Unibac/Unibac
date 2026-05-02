import { useQuery } from "@tanstack/react-query";
import type { PermisosControllerFindAllParams } from "@/api/generated/models";
import { getPermisos } from "@/api/generated/permisos/permisos";

const permisosApi = getPermisos();

export function usePermisos(params?: PermisosControllerFindAllParams) {
  return useQuery({
    queryKey: ["permisos", params?.usuarioId ?? "all"],
    queryFn: () => permisosApi.permisosControllerFindAll(params),
  });
}
