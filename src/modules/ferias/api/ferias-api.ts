import { getFerias } from "@/api/generated/ferias/ferias";
import type {
  CreateFeriaDto,
  CreatePropuestaFeriaDto,
  FeriasControllerFindPropuestasPorFeriaParams,
  ModerarPropuestaFeriaDto,
  UpdateFeriaDto,
  UpdatePropuestaFeriaPropietarioDto,
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
