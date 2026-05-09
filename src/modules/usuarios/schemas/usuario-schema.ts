import { z } from "zod";

import {
  CreateUsuarioDtoNivel,
  CreateUsuarioDtoTipo,
} from "@/api/generated/models";

const nivelSchema = z.enum([
  CreateUsuarioDtoNivel.USUARIO,
  CreateUsuarioDtoNivel.ADMINISTRADOR,
]);

const tipoSchema = z.enum([
  CreateUsuarioDtoTipo.INTERNO,
  CreateUsuarioDtoTipo.EXTERNO,
]);

export const permisoParSchema = z.object({
  moduloId: z.number().int().positive(),
  accionId: z.number().int().positive(),
});

export const usuarioPermisosFormSchema = z
  .array(permisoParSchema)
  .superRefine((rows, ctx) => {
    const seen = new Set<string>();
    rows.forEach((row, index) => {
      const key = `${row.moduloId}:${row.accionId}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: "Este módulo y acción ya están en la lista",
          path: [index],
        });
      }
      seen.add(key);
    });
  });

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

export const createUsuarioFormSchema = z.object({
  usuario: z.string().min(3, "Mínimo 3 caracteres"),
  clave: z.string().min(6, "Mínimo 6 caracteres"),
  descripcion: optionalTrimmed,
  activo: z.boolean(),
  nivel: nivelSchema,
  tipo: tipoSchema,
  correo: optionalCorreo,
  celular: optionalTrimmed,
  permisos: usuarioPermisosFormSchema,
});

export type CreateUsuarioFormValues = z.infer<typeof createUsuarioFormSchema>;

export const updateUsuarioFormSchema = z
  .object({
    usuario: z.string().min(3, "Mínimo 3 caracteres").optional(),
    clave: z.string().optional(),
    descripcion: optionalTrimmed,
    activo: z.boolean().optional(),
    nivel: nivelSchema.optional(),
    tipo: tipoSchema.optional(),
    correo: optionalCorreo,
    celular: optionalTrimmed,
    permisos: usuarioPermisosFormSchema,
  })
  .superRefine((data, ctx) => {
    const c = data.clave?.trim() ?? "";
    if (c.length > 0 && c.length < 6) {
      ctx.addIssue({
        code: "custom",
        message: "Mínimo 6 caracteres si indicas una nueva contraseña",
        path: ["clave"],
      });
    }
  });

export type UpdateUsuarioFormValues = z.infer<typeof updateUsuarioFormSchema>;
