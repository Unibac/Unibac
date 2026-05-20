import { z } from "zod";

import { NivelUsuario, TipoUsuario } from "@/modules/shared/types/api-models";

const nivelSchema = z.enum([NivelUsuario.USUARIO, NivelUsuario.ADMINISTRADOR]);

const tipoSchema = z.enum([TipoUsuario.INTERNO, TipoUsuario.EXTERNO]);

const rolIdSchema = z.coerce
  .number()
  .int()
  .refine((n) => n > 0, { message: "Seleccioná un rol" });

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
  rolId: rolIdSchema,
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
    rolId: rolIdSchema,
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
