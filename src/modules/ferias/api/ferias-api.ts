import { getFerias } from "@/api/generated/ferias/ferias";
import {
  FeriasControllerFindPropuestasPorFeriaEstado,
  type CreateFeriaDto,
  type CreatePropuestaFeriaDto,
  type FeriasControllerFindPropuestasPorFeriaParams,
  type ModerarPropuestaFeriaDto,
  type PropuestaFeriaResponseDto,
  type UpdateFeriaDto,
  type UpdatePropuestaFeriaPropietarioDto,
} from "@/api/generated/models";

const api = getFerias();

export async function listFerias() {
  return api.feriasControllerFindAll();
}

export async function getFeria(id: number) {
  return api.feriasControllerFindOne(id);
}

export async function createFeria(body: CreateFeriaDto) {
  return api.feriasControllerCreate(body);
}

export async function updateFeria(id: number, body: UpdateFeriaDto) {
  return api.feriasControllerUpdate(id, body);
}

export async function deleteFeria(id: number) {
  return api.feriasControllerRemove(id);
}

/** Multipart al API Nest; Traiker es transparente para el cliente. */
export async function uploadFeriaBanner(archivo: File) {
  return api.feriasControllerUploadBanner({ archivo });
}

export async function listMisPropuestas() {
  return api.feriasControllerFindMisPropuestas();
}

export async function listPropuestasPorFeria(
  feriaId: number,
  params?: FeriasControllerFindPropuestasPorFeriaParams,
) {
  return api.feriasControllerFindPropuestasPorFeria(feriaId, params);
}

const ESTADOS_MODERACION_PROPUESTA = [
  FeriasControllerFindPropuestasPorFeriaEstado.POSTULADO,
  FeriasControllerFindPropuestasPorFeriaEstado.ACEPTADO,
  FeriasControllerFindPropuestasPorFeriaEstado.RECHAZADO,
] as const;

/**
 * Sin `estado` el API devuelve vitrina (ACEPTADO). Para “Todas” en admin hay que
 * consultar cada estado y fusionar.
 */
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
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function createPropuestaFeria(
  feriaId: number,
  body: CreatePropuestaFeriaDto,
) {
  return api.feriasControllerCreatePropuesta(feriaId, body);
}

export async function updateMisPropuestaFeria(
  propuestaId: number,
  body: UpdatePropuestaFeriaPropietarioDto,
) {
  return api.feriasControllerUpdateMisPropuesta(propuestaId, body);
}

/** Multipart al API Nest; Traiker es transparente para el cliente. */
export async function uploadPropuestaFeriaImagen(
  feriaId: number,
  archivo: File,
) {
  return api.feriasControllerUploadImagenPropuesta(feriaId, { archivo });
}

export async function moderarPropuestaFeria(
  propuestaId: number,
  body: ModerarPropuestaFeriaDto,
) {
  return api.feriasControllerModerarPropuesta(propuestaId, body);
}
