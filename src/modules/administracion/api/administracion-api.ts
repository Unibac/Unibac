import { fetchApi } from "@/lib/api/fetch-api";
import type {
  AccionResponseDto,
  CreateEgresadoHabilitadoDto,
  CreateEstudianteHabilitadoDto,
  CreateRolPermisoDto,
  EgresadoHabilitadoResponseDto,
  EstudianteHabilitadoResponseDto,
  ModuloResponseDto,
  PermisoEnUsuarioResponseDto,
  RolResponseDto,
  UpdateEgresadoHabilitadoDto,
  UpdateEstudianteHabilitadoDto,
} from "@/modules/shared/types/api-models";

export async function listEstudiantesHabilitados() {
  return fetchApi<EstudianteHabilitadoResponseDto[]>(
    "/api/estudiantes-habilitados",
  );
}

export async function createEstudianteHabilitado(
  body: CreateEstudianteHabilitadoDto,
) {
  return fetchApi<EstudianteHabilitadoResponseDto>(
    "/api/estudiantes-habilitados",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function updateEstudianteHabilitado(
  id: number,
  body: UpdateEstudianteHabilitadoDto,
) {
  return fetchApi<EstudianteHabilitadoResponseDto>(
    `/api/estudiantes-habilitados/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function deleteEstudianteHabilitado(id: number) {
  return fetchApi<void>(`/api/estudiantes-habilitados/${id}`, {
    method: "DELETE",
  });
}

export async function listEgresadosHabilitados() {
  return fetchApi<EgresadoHabilitadoResponseDto[]>(
    "/api/egresados-habilitados",
  );
}

export async function createEgresadoHabilitado(
  body: CreateEgresadoHabilitadoDto,
) {
  return fetchApi<EgresadoHabilitadoResponseDto>("/api/egresados-habilitados", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateEgresadoHabilitado(
  id: number,
  body: UpdateEgresadoHabilitadoDto,
) {
  return fetchApi<EgresadoHabilitadoResponseDto>(
    `/api/egresados-habilitados/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function deleteEgresadoHabilitado(id: number) {
  return fetchApi<void>(`/api/egresados-habilitados/${id}`, {
    method: "DELETE",
  });
}

export async function listRoles() {
  return fetchApi<RolResponseDto[]>("/api/roles");
}

export async function listPermisos() {
  return fetchApi<PermisoEnUsuarioResponseDto[]>("/api/permisos");
}

export async function createRolPermiso(body: CreateRolPermisoDto) {
  return fetchApi<PermisoEnUsuarioResponseDto>("/api/permisos", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteRolPermiso(id: number) {
  return fetchApi<void>(`/api/permisos/${id}`, { method: "DELETE" });
}

export async function listModulos(activo?: boolean) {
  const q = activo === true ? "?activo=true" : "";
  return fetchApi<ModuloResponseDto[]>(`/api/modulos${q}`);
}

export async function listAcciones() {
  return fetchApi<AccionResponseDto[]>("/api/acciones");
}

/** En la API, `permiso.usuario.id` corresponde al id del rol (legacy del mapper). */
export function rolIdFromPermiso(p: PermisoEnUsuarioResponseDto): number {
  return p.usuario.id;
}
