import {
  ACCIONES_CRUD,
  normalizarAccionRbac,
} from "@/modules/shared/server/rbac-accion";
import { ApiError } from "@/lib/server/api-error";
import { prisma } from "@/lib/prisma";
import type { SessionUsuario } from "@/lib/server/session";
import { isAdmin } from "@/lib/server/session";

async function permisosForRol(rolId: number): Promise<Set<string>> {
  const rows = await prisma.rolPermiso.findMany({
    where: {
      rolId,
      rol: { activo: true },
      modulo: { activo: true },
    },
    select: {
      modulo: { select: { nombre: true } },
      accion: { select: { nombre: true } },
    },
  });
  const set = new Set<string>();
  for (const r of rows) {
    const accionCrud = normalizarAccionRbac(r.accion.nombre);
    if (ACCIONES_CRUD.has(accionCrud)) {
      set.add(`${r.modulo.nombre}:${accionCrud}`);
    }
  }
  return set;
}

export async function assertPermission(
  user: SessionUsuario,
  modulo: string,
  accion: string,
): Promise<void> {
  if (isAdmin(user)) return;
  if (user.rolId == null) {
    throw new ApiError(403, "No cuenta con permiso para esta operación.");
  }
  const accionCrud = normalizarAccionRbac(accion);
  if (!ACCIONES_CRUD.has(accionCrud)) {
    throw new ApiError(403, "No cuenta con permiso para esta operación.");
  }
  const set = await permisosForRol(user.rolId);
  if (!set.has(`${modulo}:${accionCrud}`)) {
    throw new ApiError(403, "No cuenta con permiso para esta operación.");
  }
}

export async function assertAnyPermission(
  user: SessionUsuario,
  modulo: string,
  acciones: string[],
): Promise<void> {
  if (isAdmin(user)) return;
  if (user.rolId == null) {
    throw new ApiError(403, "No cuenta con permiso para esta operación.");
  }
  const set = await permisosForRol(user.rolId);
  const ok = acciones.some((a) => {
    const crud = normalizarAccionRbac(a);
    return ACCIONES_CRUD.has(crud) && set.has(`${modulo}:${crud}`);
  });
  if (!ok) {
    throw new ApiError(403, "No cuenta con permiso para esta operación.");
  }
}
