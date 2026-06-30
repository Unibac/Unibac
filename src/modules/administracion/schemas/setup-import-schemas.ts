import { z } from "zod";

/** Catálogo de referencia: resuelve programa y semestre por defecto en el join. */
export const programaSheetRowSchema = z.object({
  codigo_programa: z.string().min(1, "codigo_programa requerido"),
  nombre_programa: z.string().min(1, "nombre_programa requerido"),
  semestres_plan: z.coerce.number().int().min(1).max(20).optional(),
});

/** Datos personales → nombres, apellidos, codigo_estudiantil en padrón. */
export const estudianteSheetRowSchema = z.object({
  identificacion: z.string().min(1, "identificacion requerida"),
  codigo_estudiantil: z.string().min(1, "codigo_estudiantil requerido"),
  nombres: z.string().min(1, "nombres requerido"),
  apellidos: z.string().min(1, "apellidos requerido"),
});

/** Vínculo estudiante–programa; una fila genera un registro de padrón. */
export const matriculaSheetRowSchema = z.object({
  identificacion: z.string().min(1, "identificacion requerida"),
  codigo_programa: z.string().min(1, "codigo_programa requerido"),
  semestre: z.coerce.number().int().min(1).max(20).optional(),
});

export const padronImportRowSchema = z.object({
  identificacion: z.string().min(1),
  codigoEstudiantil: z.string().min(1),
  nombres: z.string().min(1),
  apellidos: z.string().min(1),
  programa: z.string().optional(),
  semestre: z.coerce.number().int().min(1).max(20).optional(),
});

export type ProgramaSheetRow = z.infer<typeof programaSheetRowSchema>;
export type EstudianteSheetRow = z.infer<typeof estudianteSheetRowSchema>;
export type MatriculaSheetRow = z.infer<typeof matriculaSheetRowSchema>;
export type PadronImportRow = z.infer<typeof padronImportRowSchema>;
