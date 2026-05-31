import { z } from "zod";

/** Alineado con LoginDto del OpenAPI (usuario min 3, clave min 1). */
export const loginSchema = z.object({
  usuario: z.string().min(3, "Mínimo 3 caracteres"),
  clave: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
