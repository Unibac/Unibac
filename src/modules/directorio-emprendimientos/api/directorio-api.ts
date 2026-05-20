import type {
  CreateDirectorioEmprendimientoDto,
  DirectorioEmprendimientoResponseDto,
  DirectorioImagenUploadResponseDto,
  UpdateDirectorioEmprendimientoDto,
} from "@/modules/shared/types/api-models";
import { fetchApi } from "@/lib/api/fetch-api";

export async function uploadDirectorioImagen(archivo: File) {
  const formData = new FormData();
  formData.append("archivo", archivo);
  return fetchApi<DirectorioImagenUploadResponseDto>(
    "/api/uploads/directorio/imagen",
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function listDirectorioEmprendimientos() {
  return fetchApi<DirectorioEmprendimientoResponseDto[]>(
    "/api/directorio-emprendimientos",
  );
}

export async function getDirectorioEmprendimiento(id: number) {
  return fetchApi<DirectorioEmprendimientoResponseDto>(
    `/api/directorio-emprendimientos/${id}`,
  );
}

export async function createDirectorioEmprendimiento(
  body: CreateDirectorioEmprendimientoDto,
) {
  return fetchApi<DirectorioEmprendimientoResponseDto>(
    "/api/directorio-emprendimientos",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function updateDirectorioEmprendimiento(
  id: number,
  body: UpdateDirectorioEmprendimientoDto,
) {
  return fetchApi<DirectorioEmprendimientoResponseDto>(
    `/api/directorio-emprendimientos/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function deleteDirectorioEmprendimiento(id: number) {
  return fetchApi<void>(`/api/directorio-emprendimientos/${id}`, {
    method: "DELETE",
  });
}
