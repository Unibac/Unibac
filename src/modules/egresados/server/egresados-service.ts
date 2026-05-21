import {
  CategoriaUsuarioExterno,
  NivelUsuario,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ApiError,
  isPrismaUniqueConstraintError,
} from "@/lib/server/api-error";
import type { AuthProfile } from "@/modules/auth/types";
import type {
  CreateEgresadoDto,
  UpdateEgresadoDto,
} from "@/modules/shared/types/api-models";

const yearNow = new Date().getFullYear();

function mapEgresado(row: {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  identificacion: string;
  telefono: string | null;
  correo: string;
  anioEgreso: number;
  programaCarrera: string;
  estadoLaboral: string;
  brevePerfilProfesional: string;
  informacionEmprendimiento: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return row;
}

function mapConVinculos(row: Awaited<ReturnType<typeof findOneEgresadoRaw>>) {
  if (!row) return null;
  const { usuario, ...egreso } = row;
  return {
    ...mapEgresado(egreso),
    vinculos: {
      talentoPerfilId: usuario.talentoPerfil?.id ?? null,
      directorioEmprendimientoId: usuario.directorioEmprendimiento?.id ?? null,
    },
  };
}

async function findOneEgresadoRaw(id: number) {
  return prisma.egresado.findUnique({
    where: { id },
    include: {
      usuario: {
        select: {
          talentoPerfil: { select: { id: true } },
          directorioEmprendimiento: { select: { id: true } },
        },
      },
    },
  });
}

export async function findAllEgresados(query: {
  nombre?: string;
  anioEgreso?: number;
  programaCarrera?: string;
  estadoLaboral?: string;
}) {
  const where: Record<string, unknown> = {};
  if (query.nombre?.trim()) {
    where.nombreCompleto = {
      contains: query.nombre.trim(),
      mode: "insensitive",
    };
  }
  if (query.anioEgreso !== undefined) where.anioEgreso = query.anioEgreso;
  if (query.programaCarrera?.trim()) {
    where.programaCarrera = {
      contains: query.programaCarrera.trim(),
      mode: "insensitive",
    };
  }
  if (query.estadoLaboral) where.estadoLaboral = query.estadoLaboral;
  const rows = await prisma.egresado.findMany({
    where,
    orderBy: { id: "asc" },
  });
  return rows.map(mapEgresado);
}

export async function findEgresadoMe(usuarioId: number) {
  const row = await prisma.egresado.findUnique({
    where: { usuarioId },
    include: {
      usuario: {
        select: {
          talentoPerfil: { select: { id: true } },
          directorioEmprendimiento: { select: { id: true } },
        },
      },
    },
  });
  return row ? mapConVinculos(row) : null;
}

export async function findOneEgresado(id: number) {
  const row = await findOneEgresadoRaw(id);
  if (!row) throw new ApiError(404, `Egresado con id ${id} no encontrado`);
  return mapConVinculos(row);
}

function assertAnio(anio: number) {
  if (anio < 1950 || anio > yearNow + 1) {
    throw new ApiError(400, `Año de egreso inválido (${anio})`);
  }
}

function assertEgresadoCategoria(user: AuthProfile) {
  if (user.categoria !== CategoriaUsuarioExterno.EGRESADO) {
    throw new ApiError(403, "Solo usuarios categoría EGRESADO pueden acceder");
  }
}

export async function createEgresadoMine(
  user: AuthProfile,
  dto: CreateEgresadoDto,
) {
  assertEgresadoCategoria(user);
  return createEgresado(dto, user.id);
}

export async function updateEgresadoMine(
  user: AuthProfile,
  dto: UpdateEgresadoDto,
) {
  assertEgresadoCategoria(user);
  const current = await prisma.egresado.findUnique({
    where: { usuarioId: user.id },
  });
  if (!current) {
    throw new ApiError(
      404,
      "No hay registro de egresado asociado a esta cuenta",
    );
  }
  const { identificacion: _omit, ...rest } = dto;
  if (Object.keys(rest).length === 0) {
    throw new ApiError(400, "No hay campos para actualizar");
  }
  return updateEgresado(current.id, rest, user.id, false);
}

export async function createEgresado(
  dto: {
    nombreCompleto: string;
    identificacion: string;
    telefono?: string;
    correo: string;
    anioEgreso: number;
    programaCarrera: string;
    estadoLaboral: string;
    brevePerfilProfesional: string;
    informacionEmprendimiento?: string;
  },
  usuarioId: number,
) {
  assertAnio(dto.anioEgreso);
  const previo = await prisma.egresado.findUnique({ where: { usuarioId } });
  if (previo)
    throw new ApiError(409, "El usuario ya tiene un registro de egresado");
  const cuenta = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!cuenta) throw new ApiError(404, "Usuario no encontrado");
  if (cuenta.correo && cuenta.correo !== dto.correo.trim()) {
    throw new ApiError(
      400,
      "El correo debe coincidir con el de la cuenta de usuario",
    );
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const egreso = await tx.egresado.create({
        data: {
          usuarioId,
          nombreCompleto: dto.nombreCompleto.trim(),
          identificacion: dto.identificacion.trim(),
          telefono: dto.telefono?.trim() || null,
          correo: dto.correo.trim(),
          anioEgreso: dto.anioEgreso,
          programaCarrera: dto.programaCarrera.trim(),
          estadoLaboral: dto.estadoLaboral as never,
          brevePerfilProfesional: dto.brevePerfilProfesional.trim(),
          informacionEmprendimiento:
            dto.informacionEmprendimiento?.trim() || null,
        },
      });
      if (!cuenta.correo) {
        await tx.usuario.update({
          where: { id: usuarioId },
          data: { correo: dto.correo.trim() },
        });
      }
      return mapEgresado(egreso);
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(409, "Identificación o correo ya registrados");
    }
    throw error;
  }
}

export async function updateEgresado(
  id: number,
  dto: Partial<{
    nombreCompleto: string;
    identificacion: string;
    telefono: string;
    correo: string;
    anioEgreso: number;
    programaCarrera: string;
    estadoLaboral: string;
    brevePerfilProfesional: string;
    informacionEmprendimiento: string;
  }>,
  usuarioId: number,
  admin: boolean,
) {
  const current = await prisma.egresado.findUnique({ where: { id } });
  if (!current) throw new ApiError(404, `Egresado con id ${id} no encontrado`);
  if (!admin && current.usuarioId !== usuarioId) {
    throw new ApiError(403, "No tiene permiso para editar este egresado");
  }
  if (dto.anioEgreso !== undefined) assertAnio(dto.anioEgreso);
  const updated = await prisma.egresado.update({
    where: { id },
    data: {
      ...(dto.nombreCompleto !== undefined
        ? { nombreCompleto: dto.nombreCompleto.trim() }
        : {}),
      ...(dto.identificacion !== undefined
        ? { identificacion: dto.identificacion.trim() }
        : {}),
      ...(dto.telefono !== undefined
        ? { telefono: dto.telefono.trim() || null }
        : {}),
      ...(dto.correo !== undefined ? { correo: dto.correo.trim() } : {}),
      ...(dto.anioEgreso !== undefined ? { anioEgreso: dto.anioEgreso } : {}),
      ...(dto.programaCarrera !== undefined
        ? { programaCarrera: dto.programaCarrera.trim() }
        : {}),
      ...(dto.estadoLaboral !== undefined
        ? { estadoLaboral: dto.estadoLaboral as never }
        : {}),
      ...(dto.brevePerfilProfesional !== undefined
        ? { brevePerfilProfesional: dto.brevePerfilProfesional.trim() }
        : {}),
      ...(dto.informacionEmprendimiento !== undefined
        ? {
            informacionEmprendimiento:
              dto.informacionEmprendimiento.trim() || null,
          }
        : {}),
    },
  });
  return mapEgresado(updated);
}

export async function removeEgresado(id: number, nivel: NivelUsuario) {
  if (nivel !== NivelUsuario.ADMINISTRADOR) {
    throw new ApiError(403, "Solo un administrador puede eliminar egresados");
  }
  const exists = await prisma.egresado.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, `Egresado con id ${id} no encontrado`);
  await prisma.egresado.delete({ where: { id } });
}
