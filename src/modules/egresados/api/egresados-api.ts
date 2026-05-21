import type {
  CreateEgresadoDto,
  EgresadoResponseDto,
  FindEgresadosParams,
  UpdateEgresadoDto,
} from "@/modules/shared/types/api-models";
import { fetchApi } from "@/lib/api/fetch-api";

function egresadosPath(params?: FindEgresadosParams): string {
  if (!params) return "/api/egresados";
  const sp = new URLSearchParams();
  if (params.nombre) sp.set("nombre", params.nombre);
  if (params.anioEgreso !== undefined) {
    sp.set("anioEgreso", String(params.anioEgreso));
  }
  if (params.programaCarrera) {
    sp.set("programaCarrera", params.programaCarrera);
  }
  if (params.estadoLaboral) sp.set("estadoLaboral", params.estadoLaboral);
  const q = sp.toString();
  return q ? `/api/egresados?${q}` : "/api/egresados";
}

export async function listEgresados(params?: FindEgresadosParams) {
  return fetchApi<EgresadoResponseDto[]>(egresadosPath(params));
}

export async function getEgresado(id: number) {
  return fetchApi<EgresadoResponseDto>(`/api/egresados/${id}`);
}

export async function getEgresadoMe() {
  return fetchApi<EgresadoResponseDto>("/api/egresados/me");
}

export async function createEgresadoMe(body: CreateEgresadoDto) {
  return fetchApi<EgresadoResponseDto>("/api/egresados/me", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateEgresadoMe(body: UpdateEgresadoDto) {
  return fetchApi<EgresadoResponseDto>("/api/egresados/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function createEgresado(body: CreateEgresadoDto) {
  return fetchApi<EgresadoResponseDto>("/api/egresados", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateEgresado(id: number, body: UpdateEgresadoDto) {
  return fetchApi<EgresadoResponseDto>(`/api/egresados/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteEgresado(id: number) {
  return fetchApi<void>(`/api/egresados/${id}`, { method: "DELETE" });
}
