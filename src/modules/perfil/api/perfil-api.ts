import { ApiClientError, fetchApi } from "@/lib/api/fetch-api";
import {
  createEgresadoMe,
  getEgresadoMe,
  updateEgresadoMe,
} from "@/modules/egresados/api/egresados-api";
import type {
  CreateEgresadoDto,
  EgresadoResponseDto,
  EmpresaMineResponseDto,
  UpdateEgresadoDto,
  UpdateEmpresaMeDto,
  UpdateMeUsuarioDto,
  UsuarioWithPermisosResponseDto,
} from "@/modules/shared/types/api-models";

export async function getMiCuenta() {
  return fetchApi<UsuarioWithPermisosResponseDto>("/api/usuarios/me");
}

export async function updateMiCuenta(body: UpdateMeUsuarioDto) {
  return fetchApi<UsuarioWithPermisosResponseDto>("/api/usuarios/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function getMiEmpresa() {
  return fetchApi<EmpresaMineResponseDto>("/api/empresa/me");
}

export async function updateMiEmpresa(body: UpdateEmpresaMeDto) {
  return fetchApi<EmpresaMineResponseDto>("/api/empresa/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function getMiEgresado(): Promise<EgresadoResponseDto | null> {
  try {
    return await getEgresadoMe();
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export type { CreateEgresadoDto, UpdateEgresadoDto };
export { createEgresadoMe, updateEgresadoMe };
