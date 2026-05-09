import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  CreateTalentoPerfilDto,
  UpdateTalentoPerfilDto,
} from "@/api/generated/models";

import {
  createTalentoPerfil,
  deleteTalentoPerfil,
  updateTalentoPerfil,
} from "@/modules/talento-perfiles/api/talento-perfiles-api";
import { talentoKeys } from "@/modules/talento-perfiles/query-keys";

export function useCreateTalentoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTalentoPerfilDto) => createTalentoPerfil(body),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: talentoKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: talentoKeys.detail(data.id),
      });
    },
  });
}

export function useUpdateTalentoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateTalentoPerfilDto }) =>
      updateTalentoPerfil(id, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: talentoKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: talentoKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteTalentoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTalentoPerfil(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: talentoKeys.lists() });
      void queryClient.removeQueries({ queryKey: talentoKeys.detail(id) });
    },
  });
}
