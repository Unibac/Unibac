import bcrypt from "bcrypt";

import type { Prisma } from "@/generated/prisma/client";
import {
  ApiError,
  isPrismaUniqueConstraintError,
} from "@/lib/server/api-error";
import { prisma } from "@/lib/prisma";
import {
  createSupabaseUserForStaff,
  deleteSupabaseUser,
  updateSupabasePassword,
} from "@/modules/auth/server/auth-service";
import { CLAVE_MANAGED_BY_SUPABASE } from "@/modules/auth/server/auth-email";

const BCRYPT_SALT_ROUNDS = 10;
const SEED_ADMIN_USUARIO =
  process.env.SEED_ADMIN_USUARIO?.trim() || "administrador";

const usuarioListaArgs = {
  omit: { clave: true },
  include: {
    rol: {
      include: {
        permisos: {
          include: { modulo: true, accion: true },
          orderBy: { id: "asc" as const },
        },
      },
    },
  },
} satisfies Pick<Prisma.UsuarioFindManyArgs, "omit" | "include">;

type UsuarioListaPayload = Prisma.UsuarioGetPayload<typeof usuarioListaArgs>;

function mapUsuarioConPermisos(usuario: UsuarioListaPayload) {
  const { rol, ...base } = usuario;
  const permisos =
    rol?.permisos.map((p) => ({
      id: p.id,
      usuarioId: usuario.id,
      moduloId: p.moduloId,
      accionId: p.accionId,
      modulo: p.modulo,
      accion: p.accion,
    })) ?? [];
  return {
    ...base,
    rolId: usuario.rolId,
    categoria: usuario.categoria,
    permisos,
  };
}

async function assertRolActivo(rolId: number): Promise<void> {
  const rol = await prisma.rol.findUnique({
    where: { id: rolId },
    select: { id: true, activo: true },
  });
  if (!rol?.activo) {
    throw new ApiError(400, `Rol con id ${rolId} no encontrado o inactivo`);
  }
}

function isSeedAdmin(usuarioLogin: string): boolean {
  return usuarioLogin === SEED_ADMIN_USUARIO;
}

export async function findAllUsuarios() {
  const rows = await prisma.usuario.findMany({
    ...usuarioListaArgs,
    orderBy: { id: "asc" },
  });
  return rows.map(mapUsuarioConPermisos);
}

export async function findOneUsuario(id: number) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    ...usuarioListaArgs,
  });
  if (!usuario) throw new ApiError(404, `Usuario con id ${id} no encontrado`);
  return mapUsuarioConPermisos(usuario);
}

export async function findMeUsuario(id: number) {
  return findOneUsuario(id);
}

export async function updateMeUsuario(
  id: number,
  dto: { descripcion?: string; correo?: string; celular?: string },
) {
  const current = await prisma.usuario.findUnique({ where: { id } });
  if (!current) throw new ApiError(404, `Usuario con id ${id} no encontrado`);
  const data: Prisma.UsuarioUpdateInput = {};
  if (dto.descripcion !== undefined) data.descripcion = dto.descripcion;
  if (dto.correo !== undefined) data.correo = dto.correo;
  if (dto.celular !== undefined) data.celular = dto.celular;
  if (Object.keys(data).length === 0) {
    throw new ApiError(400, "No hay campos para actualizar");
  }
  const updated = await prisma.usuario.update({
    where: { id },
    data,
    ...usuarioListaArgs,
  });
  return mapUsuarioConPermisos(updated);
}

export async function createUsuario(dto: {
  usuario: string;
  clave: string;
  descripcion?: string;
  activo?: boolean;
  nivel: Prisma.UsuarioCreateInput["nivel"];
  tipo: Prisma.UsuarioCreateInput["tipo"];
  correo?: string;
  celular?: string;
  rolId?: number;
  categoria?: Prisma.UsuarioCreateInput["categoria"];
}) {
  const existing = await prisma.usuario.findUnique({
    where: { usuario: dto.usuario },
  });
  if (existing) {
    throw new ApiError(
      409,
      `Ya existe un usuario con el login "${dto.usuario}"`,
    );
  }
  if (dto.rolId !== undefined) await assertRolActivo(dto.rolId);

  const authUserId = await createSupabaseUserForStaff(dto.usuario, dto.clave);

  try {
    const created = await prisma.usuario.create({
      data: {
        authUserId,
        usuario: dto.usuario,
        descripcion: dto.descripcion,
        clave: CLAVE_MANAGED_BY_SUPABASE,
        activo: dto.activo ?? true,
        nivel: dto.nivel,
        tipo: dto.tipo,
        correo: dto.correo,
        celular: dto.celular,
        ...(dto.rolId !== undefined
          ? { rol: { connect: { id: dto.rolId } } }
          : {}),
        ...(dto.categoria !== undefined ? { categoria: dto.categoria } : {}),
      },
      ...usuarioListaArgs,
    });
    return mapUsuarioConPermisos(created);
  } catch (error) {
    await deleteSupabaseUser(authUserId);
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(
        409,
        `Ya existe un usuario con el login "${dto.usuario}"`,
      );
    }
    throw error;
  }
}

export async function updateUsuario(
  id: number,
  dto: Partial<{
    usuario: string;
    clave: string;
    descripcion: string;
    activo: boolean;
    nivel: Prisma.UsuarioUpdateInput["nivel"];
    tipo: Prisma.UsuarioUpdateInput["tipo"];
    correo: string;
    celular: string;
    rolId: number;
    categoria: Prisma.UsuarioUpdateInput["categoria"];
  }>,
) {
  const current = await prisma.usuario.findUnique({ where: { id } });
  if (!current) throw new ApiError(404, `Usuario con id ${id} no encontrado`);

  if (isSeedAdmin(current.usuario)) {
    const cambiaRestringido =
      dto.usuario !== undefined ||
      dto.descripcion !== undefined ||
      dto.activo !== undefined ||
      dto.nivel !== undefined ||
      dto.tipo !== undefined ||
      dto.correo !== undefined ||
      dto.celular !== undefined ||
      dto.rolId !== undefined ||
      dto.categoria !== undefined;
    if (cambiaRestringido) {
      throw new ApiError(
        403,
        "La cuenta administradora del sistema solo permite cambiar la contraseña.",
      );
    }
    if (!dto.clave) {
      throw new ApiError(
        400,
        "Debe enviar el campo clave para actualizar la contraseña.",
      );
    }
    if (current.authUserId) {
      await updateSupabasePassword(current.authUserId, dto.clave);
    } else {
      const hash = await bcrypt.hash(dto.clave, BCRYPT_SALT_ROUNDS);
      await prisma.usuario.update({ where: { id }, data: { clave: hash } });
    }
    return findOneUsuario(id);
  }

  if (dto.usuario && dto.usuario !== current.usuario) {
    const taken = await prisma.usuario.findUnique({
      where: { usuario: dto.usuario },
    });
    if (taken) {
      throw new ApiError(
        409,
        `Ya existe un usuario con el login "${dto.usuario}"`,
      );
    }
  }
  if (dto.rolId !== undefined) await assertRolActivo(dto.rolId);

  if (dto.clave && current.authUserId) {
    await updateSupabasePassword(current.authUserId, dto.clave);
  } else if (dto.clave) {
    await prisma.usuario.update({
      where: { id },
      data: { clave: await bcrypt.hash(dto.clave, BCRYPT_SALT_ROUNDS) },
    });
  }

  const data: Prisma.UsuarioUpdateInput = {};
  if (dto.usuario !== undefined) data.usuario = dto.usuario;
  if (dto.descripcion !== undefined) data.descripcion = dto.descripcion;
  if (dto.activo !== undefined) data.activo = dto.activo;
  if (dto.nivel !== undefined) data.nivel = dto.nivel;
  if (dto.tipo !== undefined) data.tipo = dto.tipo;
  if (dto.correo !== undefined) data.correo = dto.correo;
  if (dto.celular !== undefined) data.celular = dto.celular;
  if (dto.rolId !== undefined) data.rol = { connect: { id: dto.rolId } };
  if (dto.categoria !== undefined) data.categoria = dto.categoria;
  if (dto.clave && !current.authUserId) {
    data.clave = await bcrypt.hash(dto.clave, BCRYPT_SALT_ROUNDS);
  }

  const updated = await prisma.usuario.update({
    where: { id },
    data,
    ...usuarioListaArgs,
  });
  return mapUsuarioConPermisos(updated);
}

export async function removeUsuario(id: number) {
  const exists = await prisma.usuario.findUnique({
    where: { id },
    select: { id: true, usuario: true, authUserId: true },
  });
  if (!exists) throw new ApiError(404, `Usuario con id ${id} no encontrado`);
  if (isSeedAdmin(exists.usuario)) {
    throw new ApiError(
      403,
      "No se puede eliminar la cuenta administradora del sistema.",
    );
  }
  if (exists.authUserId) {
    await deleteSupabaseUser(exists.authUserId);
  }
  return prisma.usuario.delete({ where: { id }, omit: { clave: true } });
}

export async function findAllRoles() {
  return prisma.rol.findMany({ orderBy: { id: "asc" } });
}
