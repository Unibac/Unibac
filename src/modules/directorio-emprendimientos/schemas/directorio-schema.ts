import { z } from "zod";

import {
  type CreateDirectorioEmprendimientoDto,
  AreaCreativaEmprendimiento,
  type DirectorioEmprendimientoResponseDto,
  type UpdateDirectorioEmprendimientoDto,
} from "@/modules/shared/types/api-models";
import { parsePublicImageUrl } from "@/lib/media/parse-public-image-url";

const areaCreativaSchema = z.enum([
  AreaCreativaEmprendimiento.ARTES_PLASTICAS,
  AreaCreativaEmprendimiento.MUSICA,
  AreaCreativaEmprendimiento.DISENO,
  AreaCreativaEmprendimiento.AUDIOVISUAL,
]);

function preprocessOptionalText(val: unknown): string {
  if (val === undefined || val === null) return "";
  return String(val);
}

const optionalTrimmed = z
  .string()
  .transform((v) => v.trim())
  .optional()
  .or(z.literal("").transform(() => undefined));

/** URL manual; la subida por archivo rellena el mismo campo vía POST /directorio-emprendimientos/imagen. */
const optionalImagenUrl = z
  .preprocess(
    preprocessOptionalText,
    z.union([z.literal(""), z.string().trim().url("URL inválida")]),
  )
  .transform((v) => (v === "" ? undefined : v));

export const directorioFormSchema = z.object({
  nombreProyecto: z.string().min(1, "Requerido"),
  descripcionCorta: z
    .string()
    .min(1, "Requerido")
    .max(500, "Máximo 500 caracteres"),
  imagenUrl: optionalImagenUrl,
  correo: optionalTrimmed,
  redes: optionalTrimmed,
  sitioWeb: optionalTrimmed,
  areaCreativa: areaCreativaSchema,
  perfilActivo: z.boolean().default(true),
});

export type DirectorioFormValues = z.infer<typeof directorioFormSchema>;

function toText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function directorioResponseToFormValues(
  row: DirectorioEmprendimientoResponseDto,
): DirectorioFormValues {
  return {
    nombreProyecto: row.nombreProyecto,
    descripcionCorta: row.descripcionCorta,
    imagenUrl: parsePublicImageUrl(row.imagenUrl) ?? undefined,
    correo: toText(row.correo) || undefined,
    redes: toText(row.redes) || undefined,
    sitioWeb: toText(row.sitioWeb) || undefined,
    areaCreativa: row.areaCreativa as z.infer<typeof areaCreativaSchema>,
    perfilActivo: row.perfilActivo,
  };
}

export function emptyDirectorioFormValues(): DirectorioFormValues {
  return {
    nombreProyecto: "",
    descripcionCorta: "",
    imagenUrl: undefined,
    correo: undefined,
    redes: undefined,
    sitioWeb: undefined,
    areaCreativa: AreaCreativaEmprendimiento.ARTES_PLASTICAS,
    perfilActivo: true,
  };
}

export function buildCreateDirectorioDto(
  values: DirectorioFormValues,
): CreateDirectorioEmprendimientoDto {
  const dto: CreateDirectorioEmprendimientoDto = {
    nombreProyecto: values.nombreProyecto.trim(),
    descripcionCorta: values.descripcionCorta.trim(),
    areaCreativa: values.areaCreativa,
    perfilActivo: values.perfilActivo,
  };
  if (values.imagenUrl) dto.imagenUrl = values.imagenUrl;
  if (values.correo) dto.correo = values.correo;
  if (values.redes) dto.redes = values.redes;
  if (values.sitioWeb) dto.sitioWeb = values.sitioWeb;
  return dto;
}

export function buildUpdateDirectorioDto(
  values: DirectorioFormValues,
): UpdateDirectorioEmprendimientoDto {
  const dto: UpdateDirectorioEmprendimientoDto = {
    nombreProyecto: values.nombreProyecto.trim(),
    descripcionCorta: values.descripcionCorta.trim(),
    areaCreativa: values.areaCreativa,
    perfilActivo: values.perfilActivo,
  };
  if (values.imagenUrl) dto.imagenUrl = values.imagenUrl;
  if (values.correo) dto.correo = values.correo;
  if (values.redes) dto.redes = values.redes;
  if (values.sitioWeb) dto.sitioWeb = values.sitioWeb;
  return dto;
}
