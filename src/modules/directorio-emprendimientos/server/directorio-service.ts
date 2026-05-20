import { NivelUsuario } from "@/generated/prisma/client";
import {
  ApiError,
  isPrismaUniqueConstraintError,
} from "@/lib/server/api-error";
import { prisma } from "@/lib/prisma";

function isAdmin(nivel: NivelUsuario): boolean {
  return nivel === NivelUsuario.ADMINISTRADOR;
}

export async function findAllDirectorio(viewerId: number, admin: boolean) {
  return prisma.directorioEmprendimiento.findMany({
    where: admin
      ? {}
      : { OR: [{ perfilActivo: true }, { usuarioId: viewerId }] },
    orderBy: { id: "asc" },
  });
}

export async function findOneDirectorio(
  id: number,
  viewerId: number,
  admin: boolean,
) {
  const row = await prisma.directorioEmprendimiento.findUnique({
    where: { id },
  });
  if (!row) throw new ApiError(404, `Registro con id ${id} no encontrado`);
  if (!admin && !row.perfilActivo && row.usuarioId !== viewerId) {
    throw new ApiError(404, `Registro con id ${id} no encontrado`);
  }
  return row;
}

export async function createDirectorio(
  dto: {
    nombreProyecto: string;
    descripcionCorta: string;
    imagenUrl?: string;
    correo?: string;
    redes?: string;
    sitioWeb?: string;
    areaCreativa: string;
    perfilActivo?: boolean;
  },
  usuarioId: number,
) {
  const previo = await prisma.directorioEmprendimiento.findUnique({
    where: { usuarioId },
  });
  if (previo) {
    throw new ApiError(
      409,
      "Ya existe un registro de directorio para este usuario",
    );
  }
  try {
    return await prisma.directorioEmprendimiento.create({
      data: {
        usuarioId,
        nombreProyecto: dto.nombreProyecto.trim(),
        descripcionCorta: dto.descripcionCorta.trim(),
        imagenUrl: dto.imagenUrl?.trim() || null,
        correo: dto.correo?.trim() || null,
        redes: dto.redes?.trim() || null,
        sitioWeb: dto.sitioWeb?.trim() || null,
        areaCreativa: dto.areaCreativa as never,
        perfilActivo: dto.perfilActivo ?? true,
      },
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(
        409,
        "Ya existe un registro de directorio para este usuario",
      );
    }
    throw error;
  }
}

export async function updateDirectorio(
  id: number,
  dto: Partial<{
    nombreProyecto: string;
    descripcionCorta: string;
    imagenUrl: string;
    correo: string;
    redes: string;
    sitioWeb: string;
    areaCreativa: string;
    perfilActivo: boolean;
  }>,
  viewerId: number,
  admin: boolean,
) {
  const current = await prisma.directorioEmprendimiento.findUnique({
    where: { id },
  });
  if (!current) throw new ApiError(404, `Registro con id ${id} no encontrado`);
  if (!admin && current.usuarioId !== viewerId) {
    throw new ApiError(403, "No tiene permiso para editar este registro");
  }
  return prisma.directorioEmprendimiento.update({
    where: { id },
    data: {
      ...(dto.nombreProyecto !== undefined
        ? { nombreProyecto: dto.nombreProyecto.trim() }
        : {}),
      ...(dto.descripcionCorta !== undefined
        ? { descripcionCorta: dto.descripcionCorta.trim() }
        : {}),
      ...(dto.imagenUrl !== undefined
        ? { imagenUrl: dto.imagenUrl.trim() || null }
        : {}),
      ...(dto.correo !== undefined
        ? { correo: dto.correo.trim() || null }
        : {}),
      ...(dto.redes !== undefined ? { redes: dto.redes.trim() || null } : {}),
      ...(dto.sitioWeb !== undefined
        ? { sitioWeb: dto.sitioWeb.trim() || null }
        : {}),
      ...(dto.areaCreativa !== undefined
        ? { areaCreativa: dto.areaCreativa as never }
        : {}),
      ...(dto.perfilActivo !== undefined
        ? { perfilActivo: dto.perfilActivo }
        : {}),
    },
  });
}

export async function removeDirectorio(id: number, nivel: NivelUsuario) {
  if (!isAdmin(nivel)) {
    throw new ApiError(403, "Solo un administrador puede eliminar registros");
  }
  const exists = await prisma.directorioEmprendimiento.findUnique({
    where: { id },
  });
  if (!exists) throw new ApiError(404, `Registro con id ${id} no encontrado`);
  await prisma.directorioEmprendimiento.delete({ where: { id } });
}
