import { z } from "zod";

import type { EmpresaMineResponseDto } from "@/modules/shared/types/api-models";

export const empresaPerfilSchema = z.object({
  nombreContacto: z.string().optional(),
  correoContacto: z
    .string()
    .email("Correo inválido")
    .or(z.literal(""))
    .optional(),
  telefono: z.string().optional(),
});

export type EmpresaPerfilValues = z.infer<typeof empresaPerfilSchema>;

export function empresaResponseToFormValues(
  e: EmpresaMineResponseDto,
): EmpresaPerfilValues {
  return {
    nombreContacto: e.nombreContacto ?? "",
    correoContacto: e.correoContacto ?? "",
    telefono: e.telefono ?? "",
  };
}

export function buildUpdateEmpresaMeDto(values: EmpresaPerfilValues) {
  return {
    nombreContacto: values.nombreContacto?.trim() || "",
    correoContacto: values.correoContacto?.trim() || "",
    telefono: values.telefono?.trim() || "",
  };
}
