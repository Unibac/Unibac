import {
  FeriaResponseDtoPeriodo,
  type PropuestaFeriaResponseDto,
  PropuestaFeriaResponseDtoEstado,
} from "@/api/generated/models";

/** Alta/edición de propuesta: feria próxima o en curso (no finalizada). */
export function feriaPermitePostulacion(
  periodo: FeriaResponseDtoPeriodo | undefined,
): boolean {
  return (
    periodo === FeriaResponseDtoPeriodo.proxima ||
    periodo === FeriaResponseDtoPeriodo.activa
  );
}

export function canEditMisPropuesta(
  row: PropuestaFeriaResponseDto,
  options: {
    canPostular: boolean;
    usuarioId: number | undefined;
    feriaPeriodo: FeriaResponseDtoPeriodo | undefined;
  },
): boolean {
  const { canPostular, usuarioId, feriaPeriodo } = options;
  if (!canPostular || usuarioId == null) return false;
  if (!feriaPermitePostulacion(feriaPeriodo)) return false;
  if (row.estado !== PropuestaFeriaResponseDtoEstado.POSTULADO) return false;
  return usuarioId === row.usuarioId;
}

export function feriaPeriodoFromPropuesta(
  propuesta: PropuestaFeriaResponseDto,
): FeriaResponseDtoPeriodo | undefined {
  return propuesta.feria?.periodo;
}
