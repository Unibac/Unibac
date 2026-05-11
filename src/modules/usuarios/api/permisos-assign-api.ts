import type { CreatePermisoDto } from "@/api/generated/models";
import { getPermisos } from "@/api/generated/permisos/permisos";

const permisos = getPermisos();

export async function listPermisosByUsuario(usuarioId: number) {
  return permisos.permisosControllerFindAll({ usuarioId });
}

export async function createPermiso(body: CreatePermisoDto) {
  return permisos.permisosControllerCreate(body);
}

export async function deletePermiso(id: number) {
  return permisos.permisosControllerRemove(id);
}
