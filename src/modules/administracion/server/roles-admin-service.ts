import { ApiError } from "@/lib/server/api-error";
import { prisma } from "@/lib/prisma";
import type {
  RolWithStatsResponseDto,
  UpdateRolDto,
} from "@/modules/shared/types/api-models";

export async function findAllRolesWithStats(): Promise<
  RolWithStatsResponseDto[]
> {
  const rows = await prisma.rol.findMany({
    orderBy: { id: "asc" },
    include: {
      _count: { select: { usuarios: true, permisos: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    codigo: r.codigo,
    nombre: r.nombre,
    activo: r.activo,
    usuariosCount: r._count.usuarios,
    permisosCount: r._count.permisos,
  }));
}

export async function updateRol(
  id: number,
  dto: UpdateRolDto,
): Promise<RolWithStatsResponseDto> {
  const exists = await prisma.rol.findUnique({
    where: { id },
    include: { _count: { select: { usuarios: true, permisos: true } } },
  });
  if (!exists) {
    throw new ApiError(404, `Rol con id ${id} no encontrado`);
  }

  if (dto.activo === false && exists._count.usuarios > 0) {
    throw new ApiError(
      409,
      "No se puede desactivar un rol con usuarios asignados. Reasigná las cuentas primero.",
    );
  }

  const updated = await prisma.rol.update({
    where: { id },
    data: {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
      ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
    },
    include: {
      _count: { select: { usuarios: true, permisos: true } },
    },
  });

  return {
    id: updated.id,
    codigo: updated.codigo,
    nombre: updated.nombre,
    activo: updated.activo,
    usuariosCount: updated._count.usuarios,
    permisosCount: updated._count.permisos,
  };
}
