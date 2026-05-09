import { z } from "zod";

import {
  CreateEgresadoDtoEstadoLaboral,
  type CreateEgresadoDto,
  type EgresadoResponseDto,
  type UpdateEgresadoDto,
} from "@/api/generated/models";

const estadoLaboralSchema = z.enum([
  CreateEgresadoDtoEstadoLaboral.EMPLEADO,
  CreateEgresadoDtoEstadoLaboral.EMPRENDEDOR,
  CreateEgresadoDtoEstadoLaboral.DESEMPLEADO,
  CreateEgresadoDtoEstadoLaboral.ESTUDIANDO,
]);

const currentYear = new Date().getFullYear();

export const egresadoFormSchema = z.object({
  nombreCompleto: z.string().min(1, "Requerido"),
  identificacion: z.string().min(1, "Requerido"),
  telefono: z.string().optional(),
  correo: z.string().email("Correo inválido"),
  anioEgreso: z.coerce
    .number()
    .int()
    .min(1950, "Año inválido")
    .max(currentYear + 1, "Año inválido"),
  programaCarrera: z
    .string()
    .min(1, "Requerido")
    .max(200, "Máximo 200 caracteres"),
  estadoLaboral: estadoLaboralSchema,
  brevePerfilProfesional: z.string().min(1, "Requerido"),
  informacionEmprendimiento: z.string().optional(),
});

export type EgresadoFormValues = z.infer<typeof egresadoFormSchema>;

function telefonoFromResponse(
  t: EgresadoResponseDto["telefono"],
): string {
  if (t == null) {
    return "";
  }
  if (typeof t === "string") {
    return t;
  }
  return JSON.stringify(t);
}

function informacionFromResponse(
  i: EgresadoResponseDto["informacionEmprendimiento"],
): string {
  if (i == null) {
    return "";
  }
  if (typeof i === "string") {
    return i;
  }
  return JSON.stringify(i);
}

export function egresadoResponseToFormValues(
  e: EgresadoResponseDto,
): EgresadoFormValues {
  return {
    nombreCompleto: e.nombreCompleto,
    identificacion: e.identificacion,
    telefono: telefonoFromResponse(e.telefono),
    correo: e.correo,
    anioEgreso: e.anioEgreso,
    programaCarrera: e.programaCarrera,
    estadoLaboral: e.estadoLaboral as z.infer<typeof estadoLaboralSchema>,
    brevePerfilProfesional: e.brevePerfilProfesional,
    informacionEmprendimiento: informacionFromResponse(
      e.informacionEmprendimiento,
    ),
  };
}

export function buildCreateEgresadoDto(
  values: EgresadoFormValues,
): CreateEgresadoDto {
  const dto: CreateEgresadoDto = {
    nombreCompleto: values.nombreCompleto.trim(),
    identificacion: values.identificacion.trim(),
    correo: values.correo.trim(),
    anioEgreso: values.anioEgreso,
    programaCarrera: values.programaCarrera.trim(),
    estadoLaboral: values.estadoLaboral,
    brevePerfilProfesional: values.brevePerfilProfesional.trim(),
  };
  const tel = values.telefono?.trim();
  if (tel) {
    dto.telefono = tel;
  }
  const info = values.informacionEmprendimiento?.trim();
  if (info) {
    dto.informacionEmprendimiento = info;
  }
  return dto;
}

export function buildUpdateEgresadoDto(
  values: EgresadoFormValues,
): UpdateEgresadoDto {
  const dto: UpdateEgresadoDto = {
    nombreCompleto: values.nombreCompleto.trim(),
    identificacion: values.identificacion.trim(),
    correo: values.correo.trim(),
    anioEgreso: values.anioEgreso,
    programaCarrera: values.programaCarrera.trim(),
    estadoLaboral: values.estadoLaboral,
    brevePerfilProfesional: values.brevePerfilProfesional.trim(),
  };
  const tel = values.telefono?.trim();
  if (tel) {
    dto.telefono = tel;
  }
  const info = values.informacionEmprendimiento?.trim();
  if (info) {
    dto.informacionEmprendimiento = info;
  }
  return dto;
}

export function emptyEgresadoFormValues(): EgresadoFormValues {
  return {
    nombreCompleto: "",
    identificacion: "",
    telefono: "",
    correo: "",
    anioEgreso: currentYear,
    programaCarrera: "",
    estadoLaboral: CreateEgresadoDtoEstadoLaboral.EMPLEADO,
    brevePerfilProfesional: "",
    informacionEmprendimiento: "",
  };
}
