import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CreateFeriaDto,
  CreatePropuestaFeriaDto,
  ModerarPropuestaFeriaDto,
  UpdateFeriaDto,
  UpdatePropuestaFeriaPropietarioDto,
} from "@/modules/shared/types/api-models";

import {
  createFeria,
  createPropuestaFeria,
  deleteFeria,
  moderarPropuestaFeria,
  updateFeria,
  updateMisPropuestaFeria,
  uploadFeriaBanner,
  uploadPropuestaFeriaImagen,
} from "@/modules/ferias/api/ferias-api";
import { feriasKeys } from "@/modules/ferias/query-keys";

function invalidatePropuestasDeFeria(
  queryClient: QueryClient,
  feriaId: number,
) {
  void queryClient.invalidateQueries({
    queryKey: [...feriasKeys.propuestasRoot(), feriaId],
  });
}

export function useUploadFeriaBannerMutation() {
  return useMutation({
    mutationFn: (archivo: File) => uploadFeriaBanner(archivo),
  });
}

export function useUploadPropuestaImagenMutation(feriaId: number) {
  return useMutation({
    mutationFn: (archivo: File) => uploadPropuestaFeriaImagen(feriaId, archivo),
  });
}

export function useCreateFeriaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFeriaDto) => createFeria(body),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: feriasKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: feriasKeys.detail(data.id),
      });
    },
  });
}

export function useUpdateFeriaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateFeriaDto }) =>
      updateFeria(id, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: feriasKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: feriasKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteFeriaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteFeria(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: feriasKeys.lists() });
      void queryClient.removeQueries({ queryKey: feriasKeys.detail(id) });
    },
  });
}

export function useCreatePropuestaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      feriaId,
      body,
    }: {
      feriaId: number;
      body: CreatePropuestaFeriaDto;
    }) => createPropuestaFeria(feriaId, body),
    onSuccess: (data) => {
      invalidatePropuestasDeFeria(queryClient, data.feriaId);
      void queryClient.invalidateQueries({
        queryKey: feriasKeys.misPropuestas(),
      });
    },
  });
}

export function useUpdateMisPropuestaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      propuestaId,
      body,
    }: {
      propuestaId: number;
      body: UpdatePropuestaFeriaPropietarioDto;
    }) => updateMisPropuestaFeria(propuestaId, body),
    onSuccess: (data) => {
      invalidatePropuestasDeFeria(queryClient, data.feriaId);
      void queryClient.invalidateQueries({
        queryKey: feriasKeys.misPropuestas(),
      });
    },
  });
}

export function useModerarPropuestaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      propuestaId,
      body,
    }: {
      propuestaId: number;
      body: ModerarPropuestaFeriaDto;
    }) => moderarPropuestaFeria(propuestaId, body),
    onSuccess: (data) => {
      invalidatePropuestasDeFeria(queryClient, data.feriaId);
      void queryClient.invalidateQueries({
        queryKey: feriasKeys.misPropuestas(),
      });
    },
  });
}
