import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  CreateDirectorioEmprendimientoDto,
  UpdateDirectorioEmprendimientoDto,
} from "@/modules/shared/types/api-models";

import {
  createDirectorioEmprendimiento,
  deleteDirectorioEmprendimiento,
  updateDirectorioEmprendimiento,
  uploadDirectorioImagen,
} from "@/modules/directorio-emprendimientos/api/directorio-api";
import { directorioKeys } from "@/modules/directorio-emprendimientos/query-keys";

export function useUploadDirectorioImagenMutation() {
  return useMutation({
    mutationFn: (archivo: File) => uploadDirectorioImagen(archivo),
  });
}

export function useCreateDirectorioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateDirectorioEmprendimientoDto) =>
      createDirectorioEmprendimiento(body),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: directorioKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: directorioKeys.detail(data.id),
      });
    },
  });
}

export function useUpdateDirectorioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: UpdateDirectorioEmprendimientoDto;
    }) => updateDirectorioEmprendimiento(id, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: directorioKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: directorioKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteDirectorioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteDirectorioEmprendimiento(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: directorioKeys.lists() });
      void queryClient.removeQueries({ queryKey: directorioKeys.detail(id) });
    },
  });
}
