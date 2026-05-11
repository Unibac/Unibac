import { z } from "zod";

import {
  type CreatePublicacionConvocatoriaDto,
  CreatePublicacionConvocatoriaDtoTipoConvocatoria,
  type PublicacionEmprendimientoResponseDto,
  type UpdatePublicacionConvocatoriaDto,
} from "@/api/generated/models";

const tipoSchema = z.enum([
  CreatePublicacionConvocatoriaDtoTipoConvocatoria.FINANCIAMIENTO,
  CreatePublicacionConvocatoriaDtoTipoConvocatoria.FORMACION,
  CreatePublicacionConvocatoriaDtoTipoConvocatoria.PRACTICAS,
]);

const optionalTrimmed = z
  .string()
  .transform((v) => v.trim())
  .optional()
  .or(z.literal("").transform(() => undefined));

export const convocatoriaFormSchema = z.object({
  titulo: z.string().min(1, "Requerido"),
  descripcion: z.string().min(1, "Requerido"),
  tipoConvocatoria: tipoSchema,
  convocados: z.string().min(1, "Requerido"),
  /** ISO string o formato aceptado por backend (se envía tal cual). */
  fechaLimite: z.string().min(1, "Requerido"),
  montoTipoApoyo: optionalTrimmed,
  linkExterno: optionalTrimmed,
  activo: z.boolean().default(true),
});

export type ConvocatoriaFormValues = z.infer<typeof convocatoriaFormSchema>;

export function emptyConvocatoriaFormValues(): ConvocatoriaFormValues {
  const now = new Date();
  const iso = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    titulo: "",
    descripcion: "",
    tipoConvocatoria:
      CreatePublicacionConvocatoriaDtoTipoConvocatoria.FINANCIAMIENTO,
    convocados: "",
    fechaLimite: iso,
    montoTipoApoyo: undefined,
    linkExterno: undefined,
    activo: true,
  };
}

export function convocatoriaResponseToFormValues(
  row: PublicacionEmprendimientoResponseDto,
): ConvocatoriaFormValues {
  return {
    titulo: row.titulo,
    descripcion: row.descripcion,
    tipoConvocatoria: row.tipoConvocatoria as z.infer<typeof tipoSchema>,
    convocados: row.convocados,
    fechaLimite: row.fechaLimite,
    montoTipoApoyo: row.montoTipoApoyo ? String(row.montoTipoApoyo) : undefined,
    linkExterno: row.linkExterno ? String(row.linkExterno) : undefined,
    activo: row.activo,
  };
}

export function buildCreateConvocatoriaDto(
  values: ConvocatoriaFormValues,
): CreatePublicacionConvocatoriaDto {
  const dto: CreatePublicacionConvocatoriaDto = {
    titulo: values.titulo.trim(),
    descripcion: values.descripcion.trim(),
    tipoConvocatoria: values.tipoConvocatoria,
    convocados: values.convocados.trim(),
    fechaLimite: values.fechaLimite,
    activo: values.activo,
  };
  if (values.montoTipoApoyo) dto.montoTipoApoyo = values.montoTipoApoyo;
  if (values.linkExterno) dto.linkExterno = values.linkExterno;
  return dto;
}

export function buildUpdateConvocatoriaDto(
  values: ConvocatoriaFormValues,
): UpdatePublicacionConvocatoriaDto {
  const dto: UpdatePublicacionConvocatoriaDto = {
    titulo: values.titulo.trim(),
    descripcion: values.descripcion.trim(),
    tipoConvocatoria: values.tipoConvocatoria,
    convocados: values.convocados.trim(),
    fechaLimite: values.fechaLimite,
    activo: values.activo,
  };
  if (values.montoTipoApoyo) dto.montoTipoApoyo = values.montoTipoApoyo;
  if (values.linkExterno) dto.linkExterno = values.linkExterno;
  return dto;
}
