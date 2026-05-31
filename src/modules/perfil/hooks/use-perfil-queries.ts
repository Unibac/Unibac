import { useQuery } from "@tanstack/react-query";
import type { AuthProfile } from "@/modules/auth/types";
import {
  getMiCuenta,
  getMiEgresado,
  getMiEmpresa,
} from "@/modules/perfil/api/perfil-api";
import { perfilKeys } from "@/modules/perfil/query-keys";
import { CategoriaUsuarioExterno } from "@/modules/shared/types/enums";

export function useMiCuenta() {
  return useQuery({
    queryKey: perfilKeys.cuenta(),
    queryFn: getMiCuenta,
  });
}

export function useMiEmpresa(enabled: boolean) {
  return useQuery({
    queryKey: perfilKeys.empresa(),
    queryFn: getMiEmpresa,
    enabled,
  });
}

export function useMiEgresado(enabled: boolean) {
  return useQuery({
    queryKey: perfilKeys.egresado(),
    queryFn: getMiEgresado,
    enabled,
  });
}

export function perfilSectionsForProfile(profile: AuthProfile) {
  const cat = profile.categoria;
  return {
    showEmpresa: cat === CategoriaUsuarioExterno.EMPRESA,
    showEgresado: cat === CategoriaUsuarioExterno.EGRESADO,
    showEstudianteLinks: cat === CategoriaUsuarioExterno.ESTUDIANTE,
  };
}
