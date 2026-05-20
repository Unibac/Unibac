import {
  EstadoPostulacionConvocatoria,
  NivelUsuario,
} from "@/generated/prisma/client";
import {
  ApiError,
  isPrismaUniqueConstraintError,
} from "@/lib/server/api-error";
import { prisma } from "@/lib/prisma";
import type { AuthProfile } from "@/modules/auth/types";

function isAdmin(user: AuthProfile): boolean {
  return user.nivel === NivelUsuario.ADMINISTRADOR;
}

function isStaff(user: AuthProfile): boolean {
  return isAdmin(user) || user.tipo === "INTERNO";
}

export async function findAllPublicaciones(
  query: { activo?: boolean; tipoConvocatoria?: string },
  user: AuthProfile,
) {
  const where: Record<string, unknown> = {};
  if (!isAdmin(user)) {
    where.activo = true;
  } else if (query.activo !== undefined) {
    where.activo = query.activo;
  }
  if (query.tipoConvocatoria) {
    where.tipoConvocatoria = query.tipoConvocatoria;
  }
  return prisma.publicacionEmprendimiento.findMany({
    where,
    orderBy: { fechaLimite: "asc" },
  });
}

export async function findOnePublicacion(id: number, user: AuthProfile) {
  const row = await prisma.publicacionEmprendimiento.findUnique({
    where: { id },
  });
  if (!row) throw new ApiError(404, `Convocatoria con id ${id} no encontrada`);
  if (!row.activo && !isAdmin(user)) {
    throw new ApiError(404, `Convocatoria con id ${id} no encontrada`);
  }
  return row;
}

export async function createPublicacion(dto: {
  titulo: string;
  descripcion: string;
  tipoConvocatoria: string;
  convocados: string;
  fechaLimite: Date;
  montoTipoApoyo?: string;
  linkExterno?: string;
  activo?: boolean;
}) {
  return prisma.publicacionEmprendimiento.create({
    data: {
      titulo: dto.titulo.trim(),
      descripcion: dto.descripcion.trim(),
      tipoConvocatoria: dto.tipoConvocatoria as never,
      convocados: dto.convocados.trim(),
      fechaLimite: dto.fechaLimite,
      montoTipoApoyo: dto.montoTipoApoyo?.trim() || null,
      linkExterno: dto.linkExterno?.trim() || null,
      activo: dto.activo ?? true,
    },
  });
}

export async function updatePublicacion(
  id: number,
  dto: Partial<{
    titulo: string;
    descripcion: string;
    tipoConvocatoria: string;
    convocados: string;
    fechaLimite: Date;
    montoTipoApoyo: string;
    linkExterno: string;
    activo: boolean;
  }>,
) {
  const exists = await prisma.publicacionEmprendimiento.findUnique({
    where: { id },
  });
  if (!exists)
    throw new ApiError(404, `Convocatoria con id ${id} no encontrada`);
  return prisma.publicacionEmprendimiento.update({
    where: { id },
    data: {
      ...(dto.titulo !== undefined ? { titulo: dto.titulo.trim() } : {}),
      ...(dto.descripcion !== undefined
        ? { descripcion: dto.descripcion.trim() }
        : {}),
      ...(dto.tipoConvocatoria !== undefined
        ? { tipoConvocatoria: dto.tipoConvocatoria as never }
        : {}),
      ...(dto.convocados !== undefined
        ? { convocados: dto.convocados.trim() }
        : {}),
      ...(dto.fechaLimite !== undefined
        ? { fechaLimite: dto.fechaLimite }
        : {}),
      ...(dto.montoTipoApoyo !== undefined
        ? { montoTipoApoyo: dto.montoTipoApoyo.trim() || null }
        : {}),
      ...(dto.linkExterno !== undefined
        ? { linkExterno: dto.linkExterno.trim() || null }
        : {}),
      ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
    },
  });
}

export async function removePublicacion(id: number, nivel: NivelUsuario) {
  if (nivel !== NivelUsuario.ADMINISTRADOR) {
    throw new ApiError(
      403,
      "Solo un administrador puede eliminar convocatorias",
    );
  }
  const exists = await prisma.publicacionEmprendimiento.findUnique({
    where: { id },
  });
  if (!exists)
    throw new ApiError(404, `Convocatoria con id ${id} no encontrada`);
  await prisma.publicacionEmprendimiento.delete({ where: { id } });
}

export async function findMisPostulaciones(userId: number, user: AuthProfile) {
  if (!isStaff(user) && user.categoria == null) {
    throw new ApiError(403, "No cuenta con permiso para esta operación.");
  }
  return prisma.postulacionConvocatoria.findMany({
    where: { usuarioId: userId },
    include: {
      publicacion: {
        select: {
          id: true,
          titulo: true,
          descripcion: true,
          tipoConvocatoria: true,
          convocados: true,
          fechaLimite: true,
          montoTipoApoyo: true,
          linkExterno: true,
          activo: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { fechaPostulacion: "desc" },
  });
}

export async function createPostulacion(
  publicacionId: number,
  user: AuthProfile,
) {
  if (!isStaff(user) && user.categoria == null) {
    throw new ApiError(403, "No cuenta con permiso para postular.");
  }
  const pub = await prisma.publicacionEmprendimiento.findUnique({
    where: { id: publicacionId },
  });
  if (!pub || !pub.activo) {
    throw new ApiError(
      404,
      `Convocatoria con id ${publicacionId} no encontrada`,
    );
  }
  if (pub.fechaLimite.getTime() < Date.now()) {
    throw new ApiError(400, "La convocatoria ya cerró su fecha límite.");
  }
  try {
    return await prisma.postulacionConvocatoria.create({
      data: { usuarioId: user.id, publicacionId },
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(409, "Ya se encuentra postulado a esta convocatoria");
    }
    throw error;
  }
}

export async function findPostulacionesPorConvocatoria(
  publicacionId: number,
  user: AuthProfile,
) {
  if (!isAdmin(user)) {
    throw new ApiError(403, "Solo un administrador puede ver postulaciones");
  }
  const pub = await prisma.publicacionEmprendimiento.findUnique({
    where: { id: publicacionId },
  });
  if (!pub)
    throw new ApiError(
      404,
      `Convocatoria con id ${publicacionId} no encontrada`,
    );
  return prisma.postulacionConvocatoria.findMany({
    where: { publicacionId },
    include: {
      usuario: { select: { id: true, usuario: true, correo: true } },
    },
    orderBy: { fechaPostulacion: "desc" },
  });
}

export async function updateEstadoPostulacion(
  postulacionId: number,
  dto: { estado: "APROBADO" | "RECHAZADO" },
  user: AuthProfile,
) {
  if (!isAdmin(user)) {
    throw new ApiError(
      403,
      "Solo un administrador puede moderar postulaciones",
    );
  }
  const row = await prisma.postulacionConvocatoria.findUnique({
    where: { id: postulacionId },
  });
  if (!row)
    throw new ApiError(
      404,
      `Postulación con id ${postulacionId} no encontrada`,
    );
  if (row.estadoPostulacion !== EstadoPostulacionConvocatoria.POSTULADO) {
    throw new ApiError(409, "Solo se puede cambiar el estado desde POSTULADO");
  }
  return prisma.postulacionConvocatoria.update({
    where: { id: postulacionId },
    data: {
      estadoPostulacion:
        dto.estado === "APROBADO"
          ? EstadoPostulacionConvocatoria.APROBADO
          : EstadoPostulacionConvocatoria.RECHAZADO,
    },
  });
}
