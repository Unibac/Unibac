import type {
  CreateUsuarioDto,
  UpdateUsuarioDto,
  UsuarioResponseDto,
  UsuarioWithPermisosResponseDto,
} from "@/modules/shared/types/api-models";
import { fetchApi } from "@/lib/api/fetch-api";

export async function listUsuarios() {
  return fetchApi<UsuarioWithPermisosResponseDto[]>("/api/usuarios");
}

export async function getUsuario(id: number) {
  return fetchApi<UsuarioWithPermisosResponseDto>(`/api/usuarios/${id}`);
}

export async function createUsuario(body: CreateUsuarioDto) {
  return fetchApi<UsuarioResponseDto>("/api/usuarios", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateUsuario(id: number, body: UpdateUsuarioDto) {
  return fetchApi<UsuarioResponseDto>(`/api/usuarios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteUsuario(id: number) {
  return fetchApi<void>(`/api/usuarios/${id}`, { method: "DELETE" });
}
