import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  CreatePublicacionConvocatoriaDto,
  UpdateEstadoPostulacionDto,
  UpdatePublicacionConvocatoriaDto,
} from "@/api/generated/models";

import {
  createPublicacion,
  deletePublicacion,
  postular,
  resolverPostulacion,
  updatePublicacion,
} from "@/modules/convocatorias-emprendimiento/api/convocatorias-api";
import {
  convocatoriasKeys,
  postulacionesKeys,
} from "@/modules/convocatorias-emprendimiento/query-keys";

export function useCreateConvocatoriaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePublicacionConvocatoriaDto) =>
      createPublicacion(body),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: convocatoriasKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: convocatoriasKeys.detail(data.id),
      });
    },
  });
}

export function useUpdateConvocatoriaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: UpdatePublicacionConvocatoriaDto;
    }) => updatePublicacion(id, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: convocatoriasKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: convocatoriasKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteConvocatoriaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePublicacion(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({
        queryKey: convocatoriasKeys.lists(),
      });
      void queryClient.removeQueries({
        queryKey: convocatoriasKeys.detail(id),
      });
    },
  });
}

export function usePostularMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicacionId: number) => postular(publicacionId),
    onSuccess: (_data, publicacionId) => {
      void queryClient.invalidateQueries({
        queryKey: convocatoriasKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: convocatoriasKeys.detail(publicacionId),
      });
      void queryClient.invalidateQueries({
        queryKey: postulacionesKeys.mine(),
      });
    },
  });
}

export function useResolverPostulacionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      postulacionId: number;
      body: UpdateEstadoPostulacionDto;
      publicacionId: number;
    }) => resolverPostulacion(vars.postulacionId, vars.body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: postulacionesKeys.byConvocatoria(variables.publicacionId),
      });
      void queryClient.invalidateQueries({
        queryKey: postulacionesKeys.mine(),
      });
    },
  });
}
