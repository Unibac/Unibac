import { z } from "zod";

import {
  type CreatePropuestaFeriaDto,
  CreatePropuestaFeriaDtoAreaCreativa,
  type PropuestaFeriaResponseDto,
  type UpdatePropuestaFeriaPropietarioDto,
} from "@/api/generated/models";

const areaCreativaSchema = z.enum([
  CreatePropuestaFeriaDtoAreaCreativa.ARTES_PLASTICAS,
  CreatePropuestaFeriaDtoAreaCreativa.MUSICA,
  CreatePropuestaFeriaDtoAreaCreativa.DISENO,
  CreatePropuestaFeriaDtoAreaCreativa.AUDIOVISUAL,
]);

function preprocessOptionalText(val: unknown): string {
  if (val === undefined || val === null) return "";
  return String(val);
}

const optionalUrl = z
  .preprocess(
    preprocessOptionalText,
    z.union([z.literal(""), z.string().trim().url("URL inválida")]),
  )
  .transform((v) => (v === "" ? undefined : v));

const optionalCelular = z.preprocess(
  preprocessOptionalText,
  z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .min(7, "Mínimo 7 caracteres")
      .max(20, "Máximo 20 caracteres"),
  ]),
);

const optionalRedes = z.preprocess(
  preprocessOptionalText,
  z.union([z.literal(""), z.string().trim().max(500, "Máximo 500 caracteres")]),
);

export const propuestaFeriaFormSchema = z.object({
  nombreEmprendimiento: z
    .string()
    .trim()
    .min(2, "Mínimo 2 caracteres")
    .max(200, "Máximo 200 caracteres"),
  descripcionCorta: z
    .string()
    .trim()
    .min(10, "Mínimo 10 caracteres")
    .max(500, "Máximo 500 caracteres"),
  imagenUrl: optionalUrl,
  areaCreativa: areaCreativaSchema,
  redesContacto: optionalRedes,
  correo: z.string().trim().email("Correo inválido"),
  celular: optionalCelular,
});

export type PropuestaFeriaFormValues = z.infer<typeof propuestaFeriaFormSchema>;

function toText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function propuestaFeriaResponseToFormValues(
  row: PropuestaFeriaResponseDto,
): PropuestaFeriaFormValues {
  const img = toText(row.imagenUrl);
  const redes = toText(row.redesContacto);
  const cel = toText(row.celular);
  return {
    nombreEmprendimiento: row.nombreEmprendimiento,
    descripcionCorta: row.descripcionCorta,
    imagenUrl: img ? img : undefined,
    areaCreativa: row.areaCreativa as z.infer<typeof areaCreativaSchema>,
    redesContacto: redes,
    correo: row.correo,
    celular: cel,
  };
}

export function emptyPropuestaFeriaFormValues(): PropuestaFeriaFormValues {
  return {
    nombreEmprendimiento: "",
    descripcionCorta: "",
    imagenUrl: undefined,
    areaCreativa: CreatePropuestaFeriaDtoAreaCreativa.ARTES_PLASTICAS,
    redesContacto: "",
    correo: "",
    celular: "",
  };
}

export function buildCreatePropuestaFeriaDto(
  values: PropuestaFeriaFormValues,
): CreatePropuestaFeriaDto {
  const parsed = propuestaFeriaFormSchema.parse(values);
  const dto: CreatePropuestaFeriaDto = {
    nombreEmprendimiento: parsed.nombreEmprendimiento.trim(),
    descripcionCorta: parsed.descripcionCorta.trim(),
    areaCreativa: parsed.areaCreativa,
    correo: parsed.correo.trim(),
  };
  if (parsed.imagenUrl) dto.imagenUrl = parsed.imagenUrl;
  const redes = parsed.redesContacto.trim();
  if (redes) dto.redesContacto = redes;
  const cel = parsed.celular.trim();
  if (cel) dto.celular = cel;
  return dto;
}

export function buildUpdatePropuestaFeriaDto(
  values: PropuestaFeriaFormValues,
): UpdatePropuestaFeriaPropietarioDto {
  const parsed = propuestaFeriaFormSchema.parse(values);
  const dto: UpdatePropuestaFeriaPropietarioDto = {
    nombreEmprendimiento: parsed.nombreEmprendimiento.trim(),
    descripcionCorta: parsed.descripcionCorta.trim(),
    areaCreativa: parsed.areaCreativa,
    correo: parsed.correo.trim(),
  };
  if (parsed.imagenUrl) dto.imagenUrl = parsed.imagenUrl;
  const redes = parsed.redesContacto.trim();
  if (redes) dto.redesContacto = redes;
  const cel = parsed.celular.trim();
  if (cel) dto.celular = cel;
  return dto;
}
