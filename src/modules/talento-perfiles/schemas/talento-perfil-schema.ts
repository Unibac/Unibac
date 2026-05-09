import { z } from "zod";

import {
  type CreateTalentoPerfilDto,
  CreateTalentoPerfilDtoArea,
  CreateTalentoPerfilDtoTipoPerfil,
  type TalentoPerfilResponseDto,
  type UpdateTalentoPerfilDto,
} from "@/api/generated/models";

const areaSchema = z.enum([
  CreateTalentoPerfilDtoArea.MUSICA,
  CreateTalentoPerfilDtoArea.ARTES_PLASTICAS,
  CreateTalentoPerfilDtoArea.DISENO,
  CreateTalentoPerfilDtoArea.AUDIOVISUAL,
  CreateTalentoPerfilDtoArea.ARTES_ESCENICAS,
]);

const tipoPerfilSchema = z.enum([
  CreateTalentoPerfilDtoTipoPerfil.ESTUDIANTE,
  CreateTalentoPerfilDtoTipoPerfil.EGRESADO,
  CreateTalentoPerfilDtoTipoPerfil.EMPRENDEDOR,
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

const optionalEmailField = z
  .preprocess(
    preprocessOptionalText,
    z.union([z.literal(""), z.string().trim().email("Correo inválido")]),
  )
  .transform((v) => (v === "" ? undefined : v));

const optionalPhone = z
  .preprocess(preprocessOptionalText, z.string().trim())
  .transform((v) => (v === "" ? undefined : v));

export const talentoPerfilFormSchema = z.object({
  nombreCompleto: z.string().min(1, "Requerido"),
  area: areaSchema,
  habilidades: z.string().min(1, "Requerido"),
  portafolioUrl: optionalUrl,
  telefono: optionalPhone,
  correoContacto: optionalEmailField,
  tipoPerfil: tipoPerfilSchema,
  perfilActivo: z.boolean().default(true),
});

export type TalentoPerfilFormValues = z.infer<typeof talentoPerfilFormSchema>;

function toText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function talentoResponseToFormValues(
  row: TalentoPerfilResponseDto,
): TalentoPerfilFormValues {
  const portafolioUrl = toText(row.portafolioUrl);
  const telefono = toText(row.telefono);
  const correoContacto = toText(row.correoContacto);
  return {
    nombreCompleto: row.nombreCompleto,
    area: row.area as TalentoPerfilFormValues["area"],
    habilidades: row.habilidades,
    portafolioUrl: portafolioUrl ? portafolioUrl : undefined,
    telefono: telefono ? telefono : undefined,
    correoContacto: correoContacto ? correoContacto : undefined,
    tipoPerfil: row.tipoPerfil as TalentoPerfilFormValues["tipoPerfil"],
    perfilActivo: row.perfilActivo,
  };
}

export function emptyTalentoPerfilFormValues(): TalentoPerfilFormValues {
  return {
    nombreCompleto: "",
    area: CreateTalentoPerfilDtoArea.MUSICA,
    habilidades: "",
    portafolioUrl: undefined,
    telefono: undefined,
    correoContacto: undefined,
    tipoPerfil: CreateTalentoPerfilDtoTipoPerfil.ESTUDIANTE,
    perfilActivo: true,
  };
}

export function buildCreateTalentoDto(
  values: TalentoPerfilFormValues,
): CreateTalentoPerfilDto {
  const dto: CreateTalentoPerfilDto = {
    nombreCompleto: values.nombreCompleto.trim(),
    area: values.area,
    habilidades: values.habilidades.trim(),
    tipoPerfil: values.tipoPerfil,
    perfilActivo: values.perfilActivo,
  };
  if (values.portafolioUrl) dto.portafolioUrl = values.portafolioUrl;
  if (values.telefono) dto.telefono = values.telefono;
  if (values.correoContacto) dto.correoContacto = values.correoContacto;
  return dto;
}

export function buildUpdateTalentoDto(
  values: TalentoPerfilFormValues,
): UpdateTalentoPerfilDto {
  const dto: UpdateTalentoPerfilDto = {
    nombreCompleto: values.nombreCompleto.trim(),
    area: values.area,
    habilidades: values.habilidades.trim(),
    tipoPerfil: values.tipoPerfil,
    perfilActivo: values.perfilActivo,
  };
  if (values.portafolioUrl) dto.portafolioUrl = values.portafolioUrl;
  if (values.telefono) dto.telefono = values.telefono;
  if (values.correoContacto) dto.correoContacto = values.correoContacto;
  return dto;
}
