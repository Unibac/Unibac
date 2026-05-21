import { useMutation, useQueryClient } from "@tanstack/react-query";
import { egresadosKeys } from "@/modules/egresados/query-keys";
import {
  createEgresadoMe,
  updateEgresadoMe,
  updateMiCuenta,
  updateMiEmpresa,
} from "@/modules/perfil/api/perfil-api";
import { perfilKeys } from "@/modules/perfil/query-keys";
import type {
  CreateEgresadoDto,
  UpdateEgresadoDto,
  UpdateEmpresaMeDto,
  UpdateMeUsuarioDto,
} from "@/modules/shared/types/api-models";

export function useUpdateMiCuentaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateMeUsuarioDto) => updateMiCuenta(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: perfilKeys.cuenta() });
    },
  });
}

export function useUpdateMiEmpresaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateEmpresaMeDto) => updateMiEmpresa(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: perfilKeys.empresa() });
    },
  });
}

export function useCreateMiEgresadoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEgresadoDto) => createEgresadoMe(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: perfilKeys.egresado() });
      void queryClient.invalidateQueries({ queryKey: egresadosKeys.me() });
    },
  });
}

export function useUpdateMiEgresadoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateEgresadoDto) => updateEgresadoMe(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: perfilKeys.egresado() });
      void queryClient.invalidateQueries({ queryKey: egresadosKeys.me() });
    },
  });
}
