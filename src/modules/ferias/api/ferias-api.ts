import type {
  CreateFeriaDto,
  CreatePropuestaFeriaDto,
  FeriaBannerUploadResponseDto,
  FeriaPropuestaImagenUploadResponseDto,
  FeriaResponseDto,
  FindPropuestasPorFeriaParams,
  ModerarPropuestaFeriaDto,
  PropuestaFeriaResponseDto,
  UpdateFeriaDto,
  UpdatePropuestaFeriaPropietarioDto,
} from "@/modules/shared/types/api-models";
import { fetchApi } from "@/lib/api/fetch-api";
import { EstadoPropuestaFeria } from "@/modules/shared/types/enums";

export async function listFerias() {
  return fetchApi<FeriaResponseDto[]>("/api/ferias");
}

export async function getFeria(id: number) {
  return fetchApi<FeriaResponseDto>(`/api/ferias/${id}`);
}

export async function createFeria(body: CreateFeriaDto) {
  return fetchApi<FeriaResponseDto>("/api/ferias", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateFeria(id: number, body: UpdateFeriaDto) {
  return fetchApi<FeriaResponseDto>(`/api/ferias/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteFeria(id: number) {
  return fetchApi<void>(`/api/ferias/${id}`, { method: "DELETE" });
}

export async function uploadFeriaBanner(archivo: File) {
  const formData = new FormData();
  formData.append("archivo", archivo);
  return fetchApi<FeriaBannerUploadResponseDto>("/api/uploads/ferias/banner", {
    method: "POST",
    body: formData,
  });
}

export async function listMisPropuestas() {
  return fetchApi<PropuestaFeriaResponseDto[]>("/api/ferias/mis-propuestas");
}

function propuestasPath(
  feriaId: number,
  params?: FindPropuestasPorFeriaParams,
): string {
  const base = `/api/ferias/${feriaId}/propuestas`;
  if (!params?.estado) return base;
  return `${base}?estado=${encodeURIComponent(params.estado)}`;
}

export async function listPropuestasPorFeria(
  feriaId: number,
  params?: FindPropuestasPorFeriaParams,
) {
  return fetchApi<PropuestaFeriaResponseDto[]>(propuestasPath(feriaId, params));
}

const ESTADOS_MODERACION_PROPUESTA = [
  EstadoPropuestaFeria.POSTULADO,
  EstadoPropuestaFeria.ACEPTADO,
  EstadoPropuestaFeria.RECHAZADO,
] as const;

export async function listPropuestasPorFeriaTodosEstados(
  feriaId: number,
): Promise<PropuestaFeriaResponseDto[]> {
  const batches = await Promise.all(
    ESTADOS_MODERACION_PROPUESTA.map((estado) =>
      listPropuestasPorFeria(feriaId, { estado }),
    ),
  );
  const byId = new Map<number, PropuestaFeriaResponseDto>();
  for (const batch of batches) {
    for (const row of batch) {
      byId.set(row.id, row);
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createPropuestaFeria(
  feriaId: number,
  body: CreatePropuestaFeriaDto,
) {
  return fetchApi<PropuestaFeriaResponseDto>(
    `/api/ferias/${feriaId}/propuestas`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function updateMisPropuestaFeria(
  propuestaId: number,
  body: UpdatePropuestaFeriaPropietarioDto,
) {
  return fetchApi<PropuestaFeriaResponseDto>(
    `/api/ferias/mis-propuestas/${propuestaId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function uploadPropuestaFeriaImagen(
  feriaId: number,
  archivo: File,
) {
  const formData = new FormData();
  formData.append("archivo", archivo);
  return fetchApi<FeriaPropuestaImagenUploadResponseDto>(
    `/api/uploads/ferias/${feriaId}/propuestas/imagen`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function moderarPropuestaFeria(
  propuestaId: number,
  body: ModerarPropuestaFeriaDto,
) {
  return fetchApi<PropuestaFeriaResponseDto>(
    `/api/ferias/propuestas/${propuestaId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}
