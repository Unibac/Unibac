import {
  FeriaPeriodo,
  type PropuestaFeriaResponseDto,
  EstadoPropuestaFeria,
} from "@/modules/shared/types/api-models";

/** Alta/edición de propuesta: feria próxima o en curso (no finalizada). */
export function feriaPermitePostulacion(
  periodo: FeriaPeriodo | undefined,
): boolean {
  return periodo === FeriaPeriodo.proxima || periodo === FeriaPeriodo.activa;
}

export function canEditMisPropuesta(
  row: PropuestaFeriaResponseDto,
  options: {
    canPostular: boolean;
    usuarioId: number | undefined;
    feriaPeriodo: FeriaPeriodo | undefined;
  },
): boolean {
  const { canPostular, usuarioId, feriaPeriodo } = options;
  if (!canPostular || usuarioId == null) return false;
  if (!feriaPermitePostulacion(feriaPeriodo)) return false;
  if (row.estado !== EstadoPropuestaFeria.POSTULADO) return false;
  return usuarioId === row.usuarioId;
}

export function feriaPeriodoFromPropuesta(
  propuesta: PropuestaFeriaResponseDto,
): FeriaPeriodo | undefined {
  return propuesta.feria?.periodo;
}
