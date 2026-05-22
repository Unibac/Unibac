import { z } from "zod";

export const estudianteHabilitadoFormSchema = z.object({
  identificacion: z.string().min(1, "Requerido"),
  codigoEstudiantil: z.string().min(1, "Requerido"),
  nombres: z.string().min(1, "Requerido"),
  apellidos: z.string().min(1, "Requerido"),
  programa: z.string().optional(),
  semestre: z.coerce.number().int().min(1).max(20).optional(),
});

export type EstudianteHabilitadoFormValues = z.infer<
  typeof estudianteHabilitadoFormSchema
>;

export const egresadoHabilitadoFormSchema = z.object({
  identificacion: z.string().min(1, "Requerido"),
});

export type EgresadoHabilitadoFormValues = z.infer<
  typeof egresadoHabilitadoFormSchema
>;
