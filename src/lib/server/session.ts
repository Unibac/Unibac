import type { AuthProfile } from "@/modules/auth/types";
import { ApiError } from "@/lib/server/api-error";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Usuario } from "@/generated/prisma/client";

export type SessionUsuario = Omit<Usuario, "clave">;

/** Usuario de aplicación vinculado a la sesión Supabase actual. */
export async function getSessionUsuario(): Promise<SessionUsuario | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const record = await prisma.usuario.findFirst({
    where: { authUserId: authUser.id, activo: true },
  });
  if (!record) return null;

  const { clave: _clave, ...sinClave } = record;
  return sinClave;
}

export async function requireSessionUsuario(): Promise<SessionUsuario> {
  const user = await getSessionUsuario();
  if (!user) {
    throw new ApiError(401, "Sin sesión o token inválido");
  }
  return user;
}

export function toAuthProfile(user: SessionUsuario): AuthProfile {
  return {
    id: user.id,
    usuario: user.usuario,
    nivel: user.nivel,
    tipo: user.tipo,
    rolId: user.rolId,
    categoria: user.categoria,
  };
}

export function isAdmin(user: SessionUsuario): boolean {
  return user.nivel === "ADMINISTRADOR";
}

export function isStaff(user: SessionUsuario): boolean {
  return isAdmin(user) || user.tipo === "INTERNO";
}

export async function requireStaff(): Promise<SessionUsuario> {
  const user = await requireSessionUsuario();
  if (!isStaff(user)) {
    throw new ApiError(403, "Se requiere usuario institucional");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUsuario> {
  const user = await requireSessionUsuario();
  if (!isAdmin(user)) {
    throw new ApiError(403, "Se requiere nivel ADMINISTRADOR");
  }
  return user;
}
