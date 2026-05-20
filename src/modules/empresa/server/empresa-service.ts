import { CategoriaUsuarioExterno } from "@/generated/prisma/client";
import {
  ApiError,
  isPrismaUniqueConstraintError,
} from "@/lib/server/api-error";
import { prisma } from "@/lib/prisma";
import type { AuthProfile } from "@/modules/auth/types";

export async function getEmpresaMine(user: AuthProfile) {
  if (user.categoria !== CategoriaUsuarioExterno.EMPRESA) {
    throw new ApiError(403, "Solo usuarios categoría EMPRESA pueden acceder");
  }
  const row = await prisma.empresa.findUnique({
    where: { usuarioId: user.id },
  });
  if (!row) throw new ApiError(404, "Empresa no encontrada para este usuario");
  return row;
}

export async function updateEmpresaMine(
  user: AuthProfile,
  dto: Partial<{
    nit: string;
    razonSocial: string;
    nombreContacto: string;
    correoContacto: string;
    telefono: string;
  }>,
) {
  if (user.categoria !== CategoriaUsuarioExterno.EMPRESA) {
    throw new ApiError(403, "Solo usuarios categoría EMPRESA pueden acceder");
  }
  const keys = Object.keys(dto).filter(
    (k) => dto[k as keyof typeof dto] !== undefined,
  );
  if (keys.length === 0) {
    throw new ApiError(400, "No hay campos para actualizar");
  }
  if (dto.nit?.trim()) {
    const taken = await prisma.empresa.findUnique({
      where: { nit: dto.nit.trim() },
    });
    const mine = await prisma.empresa.findUnique({
      where: { usuarioId: user.id },
    });
    if (taken && taken.usuarioId !== user.id) {
      throw new ApiError(409, "El NIT ya está registrado");
    }
    if (!mine) throw new ApiError(404, "Empresa no encontrada");
  }
  try {
    return await prisma.empresa.update({
      where: { usuarioId: user.id },
      data: {
        ...(dto.nit !== undefined ? { nit: dto.nit.trim() } : {}),
        ...(dto.razonSocial !== undefined
          ? { razonSocial: dto.razonSocial.trim() }
          : {}),
        ...(dto.nombreContacto !== undefined
          ? { nombreContacto: dto.nombreContacto.trim() || null }
          : {}),
        ...(dto.correoContacto !== undefined
          ? { correoContacto: dto.correoContacto.trim() || null }
          : {}),
        ...(dto.telefono !== undefined
          ? { telefono: dto.telefono.trim() || null }
          : {}),
      },
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(409, "El NIT ya está registrado");
    }
    throw error;
  }
}
