import { z } from "zod";

import type { RegisterPublicInput } from "@/modules/auth/types";
import { CategoriaUsuarioExterno } from "@/modules/shared/types/enums";

const optionalTrimmed = z
  .string()
  .optional()
  .transform((v) => {
    const t = v?.trim();
    return t === "" || t === undefined ? undefined : t;
  });

const optionalCorreo = z
  .union([z.literal(""), z.string().email("Correo no válido")])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

const optionalCorreoContacto = z
  .union([z.literal(""), z.string().email("Correo no válido")])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

export const registerPublicFormSchema = z
  .object({
    categoria: z.enum([
      CategoriaUsuarioExterno.ESTUDIANTE,
      CategoriaUsuarioExterno.EGRESADO,
      CategoriaUsuarioExterno.EMPRESA,
    ]),
    usuario: z.string().min(3, "Mínimo 3 caracteres"),
    clave: z.string().min(6, "Mínimo 6 caracteres"),
    correo: optionalCorreo,
    celular: optionalTrimmed,
    descripcion: optionalTrimmed,
    identificacion: optionalTrimmed,
    codigoEstudiantil: optionalTrimmed,
    nit: optionalTrimmed,
    razonSocial: optionalTrimmed,
    nombreContacto: optionalTrimmed,
    correoContacto: optionalCorreoContacto,
    telefono: optionalTrimmed,
  })
  .superRefine((data, ctx) => {
    if (
      data.categoria === CategoriaUsuarioExterno.ESTUDIANTE ||
      data.categoria === CategoriaUsuarioExterno.EGRESADO
    ) {
      if (!data.identificacion?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "La identificación es obligatoria",
          path: ["identificacion"],
        });
      }
    }
    if (data.categoria === CategoriaUsuarioExterno.ESTUDIANTE) {
      if (!data.codigoEstudiantil?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "El código estudiantil es obligatorio",
          path: ["codigoEstudiantil"],
        });
      }
    }
    if (data.categoria === CategoriaUsuarioExterno.EMPRESA) {
      if (!data.nit?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "El NIT es obligatorio",
          path: ["nit"],
        });
      }
      if (!data.razonSocial?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "La razón social es obligatoria",
          path: ["razonSocial"],
        });
      }
    }
  });

export type RegisterPublicFormValues = z.infer<typeof registerPublicFormSchema>;

export function toRegisterPublicDto(
  data: RegisterPublicFormValues,
): RegisterPublicInput {
  const base: RegisterPublicInput = {
    categoria: data.categoria,
    usuario: data.usuario.trim(),
    clave: data.clave,
  };
  if (data.correo !== undefined) {
    base.correo = data.correo;
  }
  if (data.celular !== undefined) {
    base.celular = data.celular;
  }
  if (data.descripcion !== undefined) {
    base.descripcion = data.descripcion;
  }

  if (
    data.categoria === CategoriaUsuarioExterno.ESTUDIANTE ||
    data.categoria === CategoriaUsuarioExterno.EGRESADO
  ) {
    base.identificacion = data.identificacion?.trim();
  }
  if (data.categoria === CategoriaUsuarioExterno.ESTUDIANTE) {
    base.codigoEstudiantil = data.codigoEstudiantil?.trim();
  }
  if (data.categoria === CategoriaUsuarioExterno.EMPRESA) {
    base.nit = data.nit?.trim();
    base.razonSocial = data.razonSocial?.trim();
    if (data.nombreContacto !== undefined) {
      base.nombreContacto = data.nombreContacto;
    }
    if (data.correoContacto !== undefined) {
      base.correoContacto = data.correoContacto;
    }
    if (data.telefono !== undefined) {
      base.telefono = data.telefono;
    }
  }

  return base;
}

export function emptyRegisterPublicFormValues(
  categoria: RegisterPublicFormValues["categoria"],
): RegisterPublicFormValues {
  return {
    categoria,
    usuario: "",
    clave: "",
    correo: "",
    celular: "",
    descripcion: "",
    identificacion: "",
    codigoEstudiantil: "",
    nit: "",
    razonSocial: "",
    nombreContacto: "",
    correoContacto: "",
    telefono: "",
  };
}
