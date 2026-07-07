import { fetchApi } from "@/lib/api/fetch-api";
import type {
  AccionResponseDto,
  CreateAccionDto,
  CreateEgresadoHabilitadoDto,
  CreateEstudianteHabilitadoDto,
  CreateModuloDto,
  CreateRolPermisoDto,
  EgresadoHabilitadoResponseDto,
  EstudianteHabilitadoResponseDto,
  ModuloResponseDto,
  PermisoEnUsuarioResponseDto,
  RolWithStatsResponseDto,
  SetupImportResultDto,
  UpdateAccionDto,
  UpdateEgresadoHabilitadoDto,
  UpdateEstudianteHabilitadoDto,
  UpdateModuloDto,
  UpdateRolDto,
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

export async function setupImportEstudiantes(file: File, dryRun: boolean) {
  const formData = new FormData();
  formData.append("archivo", file);
  formData.append("dryRun", dryRun ? "true" : "false");
  return fetchApi<SetupImportResultDto>("/api/administracion/setup-import", {
    method: "POST",
    body: formData,
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
  return fetchApi<RolWithStatsResponseDto[]>("/api/roles");
}

export async function updateRol(id: number, body: UpdateRolDto) {
  return fetchApi<RolWithStatsResponseDto>(`/api/roles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
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

export async function createModulo(body: CreateModuloDto) {
  return fetchApi<ModuloResponseDto>("/api/modulos", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateModulo(id: number, body: UpdateModuloDto) {
  return fetchApi<ModuloResponseDto>(`/api/modulos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteModulo(id: number) {
  return fetchApi<void>(`/api/modulos/${id}`, { method: "DELETE" });
}

export async function listAcciones() {
  return fetchApi<AccionResponseDto[]>("/api/acciones");
}

export async function createAccion(body: CreateAccionDto) {
  return fetchApi<AccionResponseDto>("/api/acciones", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAccion(id: number, body: UpdateAccionDto) {
  return fetchApi<AccionResponseDto>(`/api/acciones/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAccion(id: number) {
  return fetchApi<void>(`/api/acciones/${id}`, { method: "DELETE" });
}

/** En `/api/permisos`, `permiso.usuario.id` corresponde al id del rol (legacy del mapper). */
export function rolIdFromPermiso(p: PermisoEnUsuarioResponseDto): number {
  const rolId = p.usuario?.id;
  if (rolId == null) {
    throw new Error(
      "rolIdFromPermiso: se espera permiso.usuario de GET /api/permisos",
    );
  }
  return rolId;
}
