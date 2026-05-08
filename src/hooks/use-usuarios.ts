import { useQuery } from "@tanstack/react-query";
import { getUsuarios } from "@/api/generated/usuarios/usuarios";

const usuariosApi = getUsuarios();

export function useUsuarios() {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: () => usuariosApi.usuariosControllerFindAll(),
  });
}
