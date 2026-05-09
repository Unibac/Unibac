import { getConvocatoriasEmprendimiento } from "@/api/generated/convocatorias-emprendimiento/convocatorias-emprendimiento";
import type {
  ConvocatoriasEmprendimientoControllerFindAllPublicacionesParams,
  CreatePublicacionConvocatoriaDto,
  UpdateEstadoPostulacionDto,
  UpdatePublicacionConvocatoriaDto,
} from "@/api/generated/models";

const api = getConvocatoriasEmprendimiento();

export async function listPublicaciones(
  params?: ConvocatoriasEmprendimientoControllerFindAllPublicacionesParams,
) {
  return api.convocatoriasEmprendimientoControllerFindAllPublicaciones(params);
}

export async function getPublicacion(id: number) {
  return api.convocatoriasEmprendimientoControllerFindOnePublicacion(id);
}

export async function createPublicacion(
  body: CreatePublicacionConvocatoriaDto,
) {
  return api.convocatoriasEmprendimientoControllerCreatePublicacion(body);
}

export async function updatePublicacion(
  id: number,
  body: UpdatePublicacionConvocatoriaDto,
) {
  return api.convocatoriasEmprendimientoControllerUpdatePublicacion(id, body);
}

export async function deletePublicacion(id: number) {
  return api.convocatoriasEmprendimientoControllerRemovePublicacion(id);
}

export async function postular(publicacionId: number) {
  return api.convocatoriasEmprendimientoControllerCreatePostulacion(
    publicacionId,
  );
}

export async function listMisPostulaciones() {
  return api.convocatoriasEmprendimientoControllerFindMisPostulaciones();
}

export async function listPostulacionesPorConvocatoria(publicacionId: number) {
  return api.convocatoriasEmprendimientoControllerFindPostulacionesPorConvocatoria(
    publicacionId,
  );
}

export async function resolverPostulacion(
  postulacionId: number,
  body: UpdateEstadoPostulacionDto,
) {
  return api.convocatoriasEmprendimientoControllerUpdateEstadoPostulacion(
    postulacionId,
    body,
  );
}
