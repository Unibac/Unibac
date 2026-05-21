import {
  buildCreateEgresadoDto,
  buildUpdateEgresadoDto,
  type EgresadoFormValues,
} from "@/modules/egresados/schemas/egresado-schema";
import type { UpdateEgresadoDto } from "@/modules/shared/types/api-models";

export function buildUpdateEgresadoMeDto(
  values: EgresadoFormValues,
): UpdateEgresadoDto {
  const { identificacion: _omit, ...rest } = buildUpdateEgresadoDto(values);
  return rest;
}

export { buildCreateEgresadoDto };
