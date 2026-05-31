import type {
  FindConvocatoriasParams,
  CreatePublicacionConvocatoriaDto,
  PostulacionConvocatoriaResponseDto,
  PublicacionEmprendimientoResponseDto,
  UpdateEstadoPostulacionDto,
  UpdatePublicacionConvocatoriaDto,
} from "@/modules/shared/types/api-models";
import { fetchApi } from "@/lib/api/fetch-api";

function convocatoriasPath(params?: FindConvocatoriasParams): string {
  if (!params) return "/api/convocatorias-emprendimiento";
  const sp = new URLSearchParams();
  if (params.tipoConvocatoria) {
    sp.set("tipoConvocatoria", params.tipoConvocatoria);
  }
  if (params.activo !== undefined) sp.set("activo", String(params.activo));
  const q = sp.toString();
  return q
    ? `/api/convocatorias-emprendimiento?${q}`
    : "/api/convocatorias-emprendimiento";
}

export async function listPublicaciones(params?: FindConvocatoriasParams) {
  return fetchApi<PublicacionEmprendimientoResponseDto[]>(
    convocatoriasPath(params),
  );
}

export async function getPublicacion(id: number) {
  return fetchApi<PublicacionEmprendimientoResponseDto>(
    `/api/convocatorias-emprendimiento/${id}`,
  );
}

export async function createPublicacion(
  body: CreatePublicacionConvocatoriaDto,
) {
  return fetchApi<PublicacionEmprendimientoResponseDto>(
    "/api/convocatorias-emprendimiento",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function updatePublicacion(
  id: number,
  body: UpdatePublicacionConvocatoriaDto,
) {
  return fetchApi<PublicacionEmprendimientoResponseDto>(
    `/api/convocatorias-emprendimiento/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function deletePublicacion(id: number) {
  return fetchApi<void>(`/api/convocatorias-emprendimiento/${id}`, {
    method: "DELETE",
  });
}

export async function postular(publicacionId: number) {
  return fetchApi<PostulacionConvocatoriaResponseDto>(
    `/api/convocatorias-emprendimiento/${publicacionId}/postulaciones`,
    { method: "POST" },
  );
}

export async function listMisPostulaciones() {
  return fetchApi<PostulacionConvocatoriaResponseDto[]>(
    "/api/convocatorias-emprendimiento/mis-postulaciones",
  );
}

export async function listPostulacionesPorConvocatoria(publicacionId: number) {
  return fetchApi<PostulacionConvocatoriaResponseDto[]>(
    `/api/convocatorias-emprendimiento/${publicacionId}/postulaciones`,
  );
}

export async function resolverPostulacion(
  postulacionId: number,
  body: UpdateEstadoPostulacionDto,
) {
  return fetchApi<PostulacionConvocatoriaResponseDto>(
    `/api/convocatorias-emprendimiento/postulaciones/${postulacionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}
