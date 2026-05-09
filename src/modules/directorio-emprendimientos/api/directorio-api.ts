import { getDirectorioEmprendimientos } from "@/api/generated/directorio-emprendimientos/directorio-emprendimientos";
import type {
  CreateDirectorioEmprendimientoDto,
  UpdateDirectorioEmprendimientoDto,
} from "@/api/generated/models";

const api = getDirectorioEmprendimientos();

export async function listDirectorioEmprendimientos() {
  return api.directorioEmprendimientosControllerFindAll();
}

export async function getDirectorioEmprendimiento(id: number) {
  return api.directorioEmprendimientosControllerFindOne(id);
}

export async function createDirectorioEmprendimiento(
  body: CreateDirectorioEmprendimientoDto,
) {
  return api.directorioEmprendimientosControllerCreate(body);
}

export async function updateDirectorioEmprendimiento(
  id: number,
  body: UpdateDirectorioEmprendimientoDto,
) {
  return api.directorioEmprendimientosControllerUpdate(id, body);
}

export async function deleteDirectorioEmprendimiento(id: number) {
  return api.directorioEmprendimientosControllerRemove(id);
}
