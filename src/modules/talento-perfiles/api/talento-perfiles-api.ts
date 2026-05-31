import type {
  CreateTalentoPerfilDto,
  TalentoPerfilResponseDto,
  UpdateTalentoPerfilDto,
} from "@/modules/shared/types/api-models";
import { fetchApi } from "@/lib/api/fetch-api";

export async function listTalentoPerfiles() {
  return fetchApi<TalentoPerfilResponseDto[]>("/api/talento-perfiles");
}

export async function getTalentoPerfil(id: number) {
  return fetchApi<TalentoPerfilResponseDto>(`/api/talento-perfiles/${id}`);
}

export async function createTalentoPerfil(body: CreateTalentoPerfilDto) {
  return fetchApi<TalentoPerfilResponseDto>("/api/talento-perfiles", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateTalentoPerfil(
  id: number,
  body: UpdateTalentoPerfilDto,
) {
  return fetchApi<TalentoPerfilResponseDto>(`/api/talento-perfiles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteTalentoPerfil(id: number) {
  return fetchApi<void>(`/api/talento-perfiles/${id}`, { method: "DELETE" });
}
