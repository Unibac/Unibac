import { useQuery } from "@tanstack/react-query";

import {
  getTalentoPerfil,
  listTalentoPerfiles,
} from "@/modules/talento-perfiles/api/talento-perfiles-api";
import { talentoKeys } from "@/modules/talento-perfiles/query-keys";

export function useTalentoListQuery() {
  return useQuery({
    queryKey: talentoKeys.list(),
    queryFn: listTalentoPerfiles,
  });
}

export function useTalentoDetailQuery(id: number | null, enabled: boolean) {
  return useQuery({
    queryKey: talentoKeys.detail(id ?? 0),
    queryFn: () => {
      if (id == null || id <= 0) {
        return Promise.reject(new Error("ID de perfil inválido"));
      }
      return getTalentoPerfil(id);
    },
    enabled: Boolean(enabled && id != null && id > 0),
  });
}
