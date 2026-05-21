import { CategoriaUsuarioExterno } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/server/api-error";
import type { AuthProfile } from "@/modules/auth/types";
import type { UpdateEmpresaMeDto } from "@/modules/shared/types/api-models";

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
  dto: UpdateEmpresaMeDto,
) {
  if (user.categoria !== CategoriaUsuarioExterno.EMPRESA) {
    throw new ApiError(403, "Solo usuarios categoría EMPRESA pueden acceder");
  }
  const keys = Object.keys(dto).filter(
    (k) => dto[k as keyof UpdateEmpresaMeDto] !== undefined,
  );
  if (keys.length === 0) {
    throw new ApiError(400, "No hay campos para actualizar");
  }
  const mine = await prisma.empresa.findUnique({
    where: { usuarioId: user.id },
  });
  if (!mine) throw new ApiError(404, "Empresa no encontrada");
  return prisma.empresa.update({
    where: { usuarioId: user.id },
    data: {
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
}
