import { z } from "zod";

import type { UsuarioWithPermisosResponseDto } from "@/modules/shared/types/api-models";

export const cuentaPerfilSchema = z.object({
  correo: z.string().email("Correo inválido").or(z.literal("")),
  celular: z.string().optional(),
  descripcion: z.string().optional(),
});

export type CuentaPerfilValues = z.infer<typeof cuentaPerfilSchema>;

export function cuentaResponseToFormValues(
  u: UsuarioWithPermisosResponseDto,
): CuentaPerfilValues {
  return {
    correo: u.correo ?? "",
    celular: u.celular ?? "",
    descripcion: u.descripcion ?? "",
  };
}

export function buildUpdateMeUsuarioDto(values: CuentaPerfilValues): {
  descripcion?: string;
  correo?: string;
  celular?: string;
} {
  const dto: { descripcion?: string; correo?: string; celular?: string } = {};
  const correo = values.correo.trim();
  if (correo) {
    dto.correo = correo;
  } else {
    dto.correo = "";
  }
  const celular = values.celular?.trim();
  if (celular) {
    dto.celular = celular;
  } else {
    dto.celular = "";
  }
  const descripcion = values.descripcion?.trim();
  if (descripcion) {
    dto.descripcion = descripcion;
  } else {
    dto.descripcion = "";
  }
  return dto;
}
