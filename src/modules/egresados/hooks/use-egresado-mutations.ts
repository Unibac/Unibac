import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  CreateEgresadoDto,
  UpdateEgresadoDto,
} from "@/modules/shared/types/api-models";

import {
  createEgresado,
  deleteEgresado,
  updateEgresado,
} from "@/modules/egresados/api/egresados-api";
import { egresadosKeys } from "@/modules/egresados/query-keys";

export function useCreateEgresadoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateEgresadoDto) => createEgresado(body),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: egresadosKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: egresadosKeys.me() });
      void queryClient.invalidateQueries({
        queryKey: egresadosKeys.detail(data.id),
      });
    },
  });
}

export function useUpdateEgresadoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateEgresadoDto }) =>
      updateEgresado(id, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: egresadosKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: egresadosKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({ queryKey: egresadosKeys.me() });
    },
  });
}

export function useDeleteEgresadoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteEgresado(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: egresadosKeys.lists() });
      void queryClient.removeQueries({ queryKey: egresadosKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: egresadosKeys.me() });
    },
  });
}
