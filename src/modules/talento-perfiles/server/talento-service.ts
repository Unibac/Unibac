import { NivelUsuario } from "@/generated/prisma/client";
import {
  ApiError,
  isPrismaUniqueConstraintError,
} from "@/lib/server/api-error";
import { prisma } from "@/lib/prisma";

function isAdmin(nivel: NivelUsuario): boolean {
  return nivel === NivelUsuario.ADMINISTRADOR;
}

export async function findAllTalento(viewerId: number, admin: boolean) {
  return prisma.talentoPerfil.findMany({
    where: admin
      ? {}
      : { OR: [{ perfilActivo: true }, { usuarioId: viewerId }] },
    orderBy: { id: "asc" },
  });
}

export async function findOneTalento(
  id: number,
  viewerId: number,
  admin: boolean,
) {
  const row = await prisma.talentoPerfil.findUnique({ where: { id } });
  if (!row) throw new ApiError(404, `Perfil con id ${id} no encontrado`);
  if (!admin && !row.perfilActivo && row.usuarioId !== viewerId) {
    throw new ApiError(404, `Perfil con id ${id} no encontrado`);
  }
  return row;
}

export async function createTalento(
  dto: {
    nombreCompleto: string;
    area: string;
    habilidades: string;
    portafolioUrl?: string;
    telefono?: string;
    correoContacto?: string;
    perfilActivo?: boolean;
    tipoPerfil: string;
  },
  usuarioId: number,
) {
  const previo = await prisma.talentoPerfil.findUnique({
    where: { usuarioId },
  });
  if (previo) {
    throw new ApiError(409, "Ya existe un perfil de talento para este usuario");
  }
  try {
    return await prisma.talentoPerfil.create({
      data: {
        usuarioId,
        nombreCompleto: dto.nombreCompleto.trim(),
        area: dto.area as never,
        habilidades: dto.habilidades.trim(),
        portafolioUrl: dto.portafolioUrl?.trim() || null,
        telefono: dto.telefono?.trim() || null,
        correoContacto: dto.correoContacto?.trim() || null,
        perfilActivo: dto.perfilActivo ?? true,
        tipoPerfil: dto.tipoPerfil as never,
      },
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(
        409,
        "Ya existe un perfil de talento para este usuario",
      );
    }
    throw error;
  }
}

export async function updateTalento(
  id: number,
  dto: Partial<{
    nombreCompleto: string;
    area: string;
    habilidades: string;
    portafolioUrl: string;
    telefono: string;
    correoContacto: string;
    perfilActivo: boolean;
    tipoPerfil: string;
  }>,
  viewerId: number,
  admin: boolean,
) {
  const current = await prisma.talentoPerfil.findUnique({ where: { id } });
  if (!current) throw new ApiError(404, `Perfil con id ${id} no encontrado`);
  if (!admin && current.usuarioId !== viewerId) {
    throw new ApiError(403, "No tiene permiso para editar este perfil");
  }
  return prisma.talentoPerfil.update({
    where: { id },
    data: {
      ...(dto.nombreCompleto !== undefined
        ? { nombreCompleto: dto.nombreCompleto.trim() }
        : {}),
      ...(dto.area !== undefined ? { area: dto.area as never } : {}),
      ...(dto.habilidades !== undefined
        ? { habilidades: dto.habilidades.trim() }
        : {}),
      ...(dto.portafolioUrl !== undefined
        ? { portafolioUrl: dto.portafolioUrl.trim() || null }
        : {}),
      ...(dto.telefono !== undefined
        ? { telefono: dto.telefono.trim() || null }
        : {}),
      ...(dto.correoContacto !== undefined
        ? { correoContacto: dto.correoContacto.trim() || null }
        : {}),
      ...(dto.perfilActivo !== undefined
        ? { perfilActivo: dto.perfilActivo }
        : {}),
      ...(dto.tipoPerfil !== undefined
        ? { tipoPerfil: dto.tipoPerfil as never }
        : {}),
    },
  });
}

export async function removeTalento(id: number, nivel: NivelUsuario) {
  if (!isAdmin(nivel)) {
    throw new ApiError(403, "Solo un administrador puede eliminar perfiles");
  }
  const exists = await prisma.talentoPerfil.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, `Perfil con id ${id} no encontrado`);
  await prisma.talentoPerfil.delete({ where: { id } });
}
