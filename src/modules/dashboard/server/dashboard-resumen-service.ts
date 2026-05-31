import {
  CategoriaUsuarioExterno,
  EstadoPostulacionConvocatoria,
  EstadoPropuestaFeria,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { DashboardResumenResponseDto } from "@/modules/shared/types/api-models";

export async function getDashboardResumen(): Promise<DashboardResumenResponseDto> {
  const now = new Date();

  const [
    postulacionesConvocatoriaPendientes,
    propuestasFeriaPendientes,
    convocatoriasAbiertas,
    feriasVigentes,
    egresadosSinFicha,
  ] = await Promise.all([
    prisma.postulacionConvocatoria.count({
      where: { estadoPostulacion: EstadoPostulacionConvocatoria.POSTULADO },
    }),
    prisma.propuestaFeria.count({
      where: { estado: EstadoPropuestaFeria.POSTULADO },
    }),
    prisma.publicacionEmprendimiento.count({
      where: { activo: true, fechaLimite: { gte: now } },
    }),
    prisma.feria.count({
      where: { fechaFin: { gte: now } },
    }),
    prisma.usuario.count({
      where: {
        activo: true,
        categoria: CategoriaUsuarioExterno.EGRESADO,
        egreso: null,
      },
    }),
  ]);

  return {
    postulacionesConvocatoriaPendientes,
    propuestasFeriaPendientes,
    convocatoriasAbiertas,
    feriasVigentes,
    egresadosSinFicha,
  };
}
