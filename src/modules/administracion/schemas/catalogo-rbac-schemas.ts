import { z } from "zod";

export const moduloFormSchema = z.object({
  nombre: z.string().min(1, "Requerido").max(100),
  activo: z.boolean(),
});

export type ModuloFormValues = z.infer<typeof moduloFormSchema>;

export const accionFormSchema = z.object({
  nombre: z.string().min(1, "Requerido").max(100),
});

export type AccionFormValues = z.infer<typeof accionFormSchema>;
