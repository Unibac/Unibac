import bcrypt from "bcrypt";

import {
  CategoriaUsuarioExterno,
  NivelUsuario,
  TipoUsuario,
} from "@/generated/prisma/client";
import {
  ApiError,
  isPrismaUniqueConstraintError,
} from "@/lib/server/api-error";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  authEmailForUsuario,
  CLAVE_MANAGED_BY_SUPABASE,
} from "@/modules/auth/server/auth-email";
import type {
  LoginInput,
  LoginResponse,
  RegisterPublicInput,
} from "@/modules/auth/types";
import { toAuthProfile } from "@/lib/server/session";

const BCRYPT_ROUNDS = 10;

export const ROL_EXTERNO_ESTUDIANTE = "EXTERNO_ESTUDIANTE";
export const ROL_EXTERNO_EGRESADO = "EXTERNO_EGRESADO";
export const ROL_EXTERNO_EMPRESA = "EXTERNO_EMPRESA";

function isPublicRegistrationEnabledServer(): boolean {
  const raw = process.env.PUBLIC_REGISTRATION_ENABLED?.trim().toLowerCase();
  if (!raw) return false;
  return ["true", "1", "yes"].includes(raw);
}

export async function loginWithUsuario(
  dto: LoginInput,
): Promise<LoginResponse> {
  const record = await prisma.usuario.findUnique({
    where: { usuario: dto.usuario.trim() },
  });
  if (!record?.activo) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  if (!record.authUserId) {
    const coincide = await bcrypt.compare(dto.clave, record.clave);
    if (!coincide) {
      throw new ApiError(401, "Credenciales inválidas");
    }
    const admin = createSupabaseAdminClient();
    const email = authEmailForUsuario(record.usuario);
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: dto.clave,
      email_confirm: true,
    });
    if (error || !data.user) {
      throw new ApiError(
        500,
        "No se pudo vincular la cuenta con Supabase Auth",
      );
    }
    await prisma.usuario.update({
      where: { id: record.id },
      data: { authUserId: data.user.id, clave: CLAVE_MANAGED_BY_SUPABASE },
    });
  }

  const supabase = await createSupabaseServerClient();
  const email = authEmailForUsuario(record.usuario);
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: dto.clave,
  });
  if (signInError) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  const { clave: _clave, ...sinClave } = record;
  return {
    message: "OK",
    usuario: toAuthProfile(sinClave),
  };
}

export async function logoutSession(): Promise<{ message: string }> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return { message: "Sesión cerrada" };
}

export async function registerPublicUser(dto: RegisterPublicInput) {
  if (!isPublicRegistrationEnabledServer()) {
    throw new ApiError(403, "El registro público está deshabilitado.");
  }

  const existente = await prisma.usuario.findUnique({
    where: { usuario: dto.usuario.trim() },
    select: { id: true },
  });
  if (existente) {
    throw new ApiError(409, "El usuario ya existe");
  }

  const codigoRolPorCategoria: Record<CategoriaUsuarioExterno, string> = {
    [CategoriaUsuarioExterno.ESTUDIANTE]: ROL_EXTERNO_ESTUDIANTE,
    [CategoriaUsuarioExterno.EGRESADO]: ROL_EXTERNO_EGRESADO,
    [CategoriaUsuarioExterno.EMPRESA]: ROL_EXTERNO_EMPRESA,
  };

  const rol = await prisma.rol.findFirst({
    where: { codigo: codigoRolPorCategoria[dto.categoria], activo: true },
    select: { id: true },
  });
  if (!rol) {
    throw new ApiError(
      400,
      "Registro no disponible: configuración de roles incompleta.",
    );
  }

  let empresaNit: string | undefined;
  let empresaRazon: string | undefined;

  if (dto.categoria === CategoriaUsuarioExterno.ESTUDIANTE) {
    if (!dto.identificacion?.trim() || !dto.codigoEstudiantil?.trim()) {
      throw new ApiError(
        400,
        "Debe enviar identificación y código estudiantil",
      );
    }
    const enPadron = await prisma.estudianteHabilitado.findFirst({
      where: {
        identificacion: dto.identificacion.trim(),
        codigoEstudiantil: dto.codigoEstudiantil.trim(),
      },
      select: { id: true },
    });
    if (!enPadron) {
      throw new ApiError(
        400,
        "No figura en el padrón de estudiantes habilitados para registro.",
      );
    }
  } else if (dto.categoria === CategoriaUsuarioExterno.EGRESADO) {
    if (!dto.identificacion?.trim()) {
      throw new ApiError(400, "Debe enviar identificación");
    }
    const enPadron = await prisma.egresadoHabilitado.findUnique({
      where: { identificacion: dto.identificacion.trim() },
      select: { id: true },
    });
    if (!enPadron) {
      throw new ApiError(
        400,
        "No figura en el padrón de egresados habilitados para registro.",
      );
    }
  } else {
    if (!dto.nit?.trim() || !dto.razonSocial?.trim()) {
      throw new ApiError(400, "Debe enviar NIT y razón social");
    }
    const nit = dto.nit.trim();
    const nitTomado = await prisma.empresa.findUnique({
      where: { nit },
      select: { id: true },
    });
    if (nitTomado) {
      throw new ApiError(409, "El NIT ya está registrado");
    }
    empresaNit = nit;
    empresaRazon = dto.razonSocial.trim();
  }

  const admin = createSupabaseAdminClient();
  const email = authEmailForUsuario(dto.usuario.trim());
  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password: dto.clave,
      email_confirm: true,
    });
  if (authError || !authData.user) {
    throw new ApiError(400, authError?.message ?? "No se pudo crear la cuenta");
  }

  try {
    const creado = await prisma.$transaction(async (tx) => {
      const u = await tx.usuario.create({
        data: {
          authUserId: authData.user.id,
          usuario: dto.usuario.trim(),
          clave: CLAVE_MANAGED_BY_SUPABASE,
          nivel: NivelUsuario.USUARIO,
          tipo: TipoUsuario.EXTERNO,
          correo: dto.correo,
          descripcion: dto.descripcion,
          celular: dto.celular,
          activo: true,
          rol: { connect: { id: rol.id } },
          categoria: dto.categoria,
        },
      });
      if (dto.categoria === CategoriaUsuarioExterno.EMPRESA) {
        if (!empresaNit || !empresaRazon) {
          throw new ApiError(400, "Debe enviar NIT y razón social");
        }
        await tx.empresa.create({
          data: {
            usuarioId: u.id,
            nit: empresaNit,
            razonSocial: empresaRazon,
            nombreContacto: dto.nombreContacto?.trim() || null,
            correoContacto: dto.correoContacto?.trim() || null,
            telefono: dto.telefono?.trim() || null,
          },
        });
      }
      return u;
    });
    const { clave: _clave, ...sinClave } = creado;
    return sinClave;
  } catch (error) {
    await admin.auth.admin.deleteUser(authData.user.id);
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(
        409,
        "Datos duplicados (usuario, NIT u otro campo único)",
      );
    }
    throw error;
  }
}

export async function createSupabaseUserForStaff(
  usuario: string,
  clave: string,
): Promise<string> {
  const admin = createSupabaseAdminClient();
  const email = authEmailForUsuario(usuario);
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: clave,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new ApiError(400, error?.message ?? "No se pudo crear usuario Auth");
  }
  return data.user.id;
}

export async function updateSupabasePassword(
  authUserId: string,
  clave: string,
): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(authUserId, {
    password: clave,
  });
  if (error) {
    throw new ApiError(400, error.message);
  }
}

export async function deleteSupabaseUser(authUserId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin.auth.admin.deleteUser(authUserId);
}
