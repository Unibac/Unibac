import { getPermisos } from "@/api/generated/permisos/permisos";
import type { CreatePermisoDto } from "@/api/generated/models";

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
