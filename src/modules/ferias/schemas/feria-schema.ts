import { z } from "zod";

import type {
  CreateFeriaDto,
  FeriaResponseDto,
  UpdateFeriaDto,
} from "@/modules/shared/types/api-models";

export function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function datetimeLocalValueToIso(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function preprocessOptionalText(val: unknown): string {
  if (val === undefined || val === null) return "";
  return String(val);
}

const optionalBannerUrl = z
  .preprocess(
    preprocessOptionalText,
    z.union([z.literal(""), z.string().trim().url("URL inválida")]),
  )
  .transform((v) => (v === "" ? undefined : v));

export const feriaFormSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  descripcion: z.string().min(1, "Requerido"),
  fechaInicioLocal: z.string().min(1, "Requerido"),
  fechaFinLocal: z.string().min(1, "Requerido"),
  imagenBannerUrl: optionalBannerUrl,
});

export type FeriaFormValues = z.infer<typeof feriaFormSchema>;

function toText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function feriaResponseToFormValues(
  row: FeriaResponseDto,
): FeriaFormValues {
  const banner = toText(row.imagenBannerUrl);
  return {
    nombre: row.nombre,
    descripcion: row.descripcion,
    fechaInicioLocal: isoToDatetimeLocalValue(row.fechaInicio),
    fechaFinLocal: isoToDatetimeLocalValue(row.fechaFin),
    imagenBannerUrl: banner ? banner : undefined,
  };
}

export function emptyFeriaFormValues(): FeriaFormValues {
  return {
    nombre: "",
    descripcion: "",
    fechaInicioLocal: "",
    fechaFinLocal: "",
    imagenBannerUrl: undefined,
  };
}

export function buildCreateFeriaDto(values: FeriaFormValues): CreateFeriaDto {
  const parsed = feriaFormSchema.parse(values);
  const dto: CreateFeriaDto = {
    nombre: parsed.nombre.trim(),
    descripcion: parsed.descripcion.trim(),
    fechaInicio: datetimeLocalValueToIso(parsed.fechaInicioLocal),
    fechaFin: datetimeLocalValueToIso(parsed.fechaFinLocal),
  };
  if (parsed.imagenBannerUrl) dto.imagenBannerUrl = parsed.imagenBannerUrl;
  return dto;
}

export function buildUpdateFeriaDto(values: FeriaFormValues): UpdateFeriaDto {
  const parsed = feriaFormSchema.parse(values);
  const dto: UpdateFeriaDto = {
    nombre: parsed.nombre.trim(),
    descripcion: parsed.descripcion.trim(),
    fechaInicio: datetimeLocalValueToIso(parsed.fechaInicioLocal),
    fechaFin: datetimeLocalValueToIso(parsed.fechaFinLocal),
  };
  if (parsed.imagenBannerUrl) dto.imagenBannerUrl = parsed.imagenBannerUrl;
  return dto;
}
