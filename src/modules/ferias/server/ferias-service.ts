import type { Feria, PropuestaFeria } from "@/generated/prisma/client";
import { EstadoPropuestaFeria, NivelUsuario } from "@/generated/prisma/client";
import {
  ApiError,
  isPrismaUniqueConstraintError,
} from "@/lib/server/api-error";
import { prisma } from "@/lib/prisma";
import type { AuthProfile } from "@/modules/auth/types";

export type PeriodoFeria = "proxima" | "activa" | "finalizada";

export function derivePeriodoFeria(
  fechaInicio: Date,
  fechaFin: Date,
  nowMs = Date.now(),
): PeriodoFeria {
  const t0 = fechaInicio.getTime();
  const t1 = fechaFin.getTime();
  if (nowMs < t0) return "proxima";
  if (nowMs > t1) return "finalizada";
  return "activa";
}

export function feriaPermitePostulacion(
  fechaFin: Date,
  nowMs = Date.now(),
): boolean {
  return nowMs <= fechaFin.getTime();
}

function assertPuedePostularEnFeria(user: AuthProfile): void {
  if (user.tipo !== "EXTERNO" || user.categoria !== "ESTUDIANTE") {
    throw new ApiError(
      403,
      "Solo estudiantes externos registrados con categoría ESTUDIANTE pueden registrar o editar propuestas en ferias.",
    );
  }
}

function isAdmin(user: AuthProfile): boolean {
  return user.nivel === NivelUsuario.ADMINISTRADOR;
}

function mapFeria(row: Feria) {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    fechaInicio: row.fechaInicio,
    fechaFin: row.fechaFin,
    imagenBannerUrl: row.imagenBannerUrl,
    periodo: derivePeriodoFeria(row.fechaInicio, row.fechaFin),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapPropuesta(row: PropuestaFeria & { feria?: Feria | null }) {
  const base = {
    id: row.id,
    usuarioId: row.usuarioId,
    feriaId: row.feriaId,
    nombreEmprendimiento: row.nombreEmprendimiento,
    descripcionCorta: row.descripcionCorta,
    imagenUrl: row.imagenUrl,
    areaCreativa: row.areaCreativa,
    redesContacto: row.redesContacto,
    correo: row.correo,
    celular: row.celular,
    estado: row.estado,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  if (row.feria) {
    return { ...base, feria: mapFeria(row.feria) };
  }
  return base;
}

function assertFechasValidas(fechaInicio: Date, fechaFin: Date): void {
  if (fechaFin.getTime() <= fechaInicio.getTime()) {
    throw new ApiError(
      400,
      "La fecha de fin debe ser posterior a la fecha de inicio.",
    );
  }
}

export async function findAllFerias() {
  const rows = await prisma.feria.findMany({
    orderBy: { fechaInicio: "desc" },
  });
  return rows.map(mapFeria);
}

export async function findOneFeria(id: number) {
  const row = await prisma.feria.findUnique({ where: { id } });
  if (!row) throw new ApiError(404, `Feria con id ${id} no encontrada`);
  return mapFeria(row);
}

export async function createFeria(dto: {
  nombre: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  imagenBannerUrl?: string;
}) {
  assertFechasValidas(dto.fechaInicio, dto.fechaFin);
  const row = await prisma.feria.create({
    data: {
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion.trim(),
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      imagenBannerUrl: dto.imagenBannerUrl?.trim() || null,
    },
  });
  return mapFeria(row);
}

export async function updateFeria(
  id: number,
  dto: Partial<{
    nombre: string;
    descripcion: string;
    fechaInicio: Date;
    fechaFin: Date;
    imagenBannerUrl: string;
  }>,
) {
  const exists = await prisma.feria.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, `Feria con id ${id} no encontrada`);

  const fechaInicio = dto.fechaInicio ?? exists.fechaInicio;
  const fechaFin = dto.fechaFin ?? exists.fechaFin;
  assertFechasValidas(fechaInicio, fechaFin);

  const row = await prisma.feria.update({
    where: { id },
    data: {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
      ...(dto.descripcion !== undefined
        ? { descripcion: dto.descripcion.trim() }
        : {}),
      ...(dto.fechaInicio !== undefined
        ? { fechaInicio: dto.fechaInicio }
        : {}),
      ...(dto.fechaFin !== undefined ? { fechaFin: dto.fechaFin } : {}),
      ...(dto.imagenBannerUrl !== undefined
        ? { imagenBannerUrl: dto.imagenBannerUrl.trim() || null }
        : {}),
    },
  });
  return mapFeria(row);
}

export async function removeFeria(id: number, nivel: NivelUsuario) {
  if (nivel !== NivelUsuario.ADMINISTRADOR) {
    throw new ApiError(403, "Solo un administrador puede eliminar ferias");
  }
  const exists = await prisma.feria.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, `Feria con id ${id} no encontrada`);
  try {
    await prisma.feria.delete({ where: { id } });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2003"
    ) {
      throw new ApiError(
        409,
        "No se puede eliminar una feria con propuestas registradas",
      );
    }
    throw error;
  }
}

export async function findFeriaParaUploadPropuesta(
  feriaId: number,
  user: AuthProfile,
) {
  assertPuedePostularEnFeria(user);
  const feria = await prisma.feria.findUnique({ where: { id: feriaId } });
  if (!feria) throw new ApiError(404, `Feria con id ${feriaId} no encontrada`);
  if (!feriaPermitePostulacion(feria.fechaFin)) {
    throw new ApiError(
      400,
      "La feria ya finalizó; no se pueden registrar ni editar propuestas.",
    );
  }
  return feria;
}

export async function createPropuesta(
  feriaId: number,
  dto: {
    nombreEmprendimiento: string;
    descripcionCorta: string;
    imagenUrl?: string;
    areaCreativa: PropuestaFeria["areaCreativa"];
    redesContacto?: string;
    correo: string;
    celular?: string;
  },
  user: AuthProfile,
) {
  assertPuedePostularEnFeria(user);
  const feria = await prisma.feria.findUnique({ where: { id: feriaId } });
  if (!feria) throw new ApiError(404, `Feria con id ${feriaId} no encontrada`);
  if (!feriaPermitePostulacion(feria.fechaFin)) {
    throw new ApiError(
      400,
      "La feria ya finalizó; no se pueden registrar ni editar propuestas.",
    );
  }
  try {
    const creada = await prisma.propuestaFeria.create({
      data: {
        usuarioId: user.id,
        feriaId,
        nombreEmprendimiento: dto.nombreEmprendimiento.trim(),
        descripcionCorta: dto.descripcionCorta.trim(),
        imagenUrl: dto.imagenUrl?.trim() || null,
        areaCreativa: dto.areaCreativa,
        redesContacto: dto.redesContacto?.trim() || null,
        correo: dto.correo.trim(),
        celular: dto.celular?.trim() || null,
      },
    });
    return mapPropuesta(creada);
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(
        409,
        "Ya existe una propuesta suya registrada para esta feria",
      );
    }
    throw error;
  }
}

export async function findMisPropuestas(user: AuthProfile) {
  const rows = await prisma.propuestaFeria.findMany({
    where: { usuarioId: user.id },
    include: { feria: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapPropuesta);
}

export async function updatePropuestaPropietario(
  propuestaId: number,
  dto: Partial<{
    nombreEmprendimiento: string;
    descripcionCorta: string;
    imagenUrl: string;
    areaCreativa: PropuestaFeria["areaCreativa"];
    redesContacto: string;
    correo: string;
    celular: string;
  }>,
  user: AuthProfile,
) {
  assertPuedePostularEnFeria(user);
  const row = await prisma.propuestaFeria.findUnique({
    where: { id: propuestaId },
    include: { feria: true },
  });
  if (!row)
    throw new ApiError(404, `Propuesta con id ${propuestaId} no encontrada`);
  if (row.usuarioId !== user.id && !isAdmin(user)) {
    throw new ApiError(403, "No tiene permiso para editar esta propuesta");
  }
  if (row.estado !== EstadoPropuestaFeria.POSTULADO) {
    throw new ApiError(
      409,
      "Solo se puede editar la propuesta mientras está en estado POSTULADO",
    );
  }
  if (!feriaPermitePostulacion(row.feria.fechaFin)) {
    throw new ApiError(
      400,
      "La feria ya finalizó; no se pueden registrar ni editar propuestas.",
    );
  }
  const actualizada = await prisma.propuestaFeria.update({
    where: { id: propuestaId },
    data: {
      ...(dto.nombreEmprendimiento !== undefined
        ? { nombreEmprendimiento: dto.nombreEmprendimiento.trim() }
        : {}),
      ...(dto.descripcionCorta !== undefined
        ? { descripcionCorta: dto.descripcionCorta.trim() }
        : {}),
      ...(dto.imagenUrl !== undefined
        ? { imagenUrl: dto.imagenUrl.trim() || null }
        : {}),
      ...(dto.areaCreativa !== undefined
        ? { areaCreativa: dto.areaCreativa }
        : {}),
      ...(dto.redesContacto !== undefined
        ? { redesContacto: dto.redesContacto.trim() || null }
        : {}),
      ...(dto.correo !== undefined ? { correo: dto.correo.trim() } : {}),
      ...(dto.celular !== undefined
        ? { celular: dto.celular.trim() || null }
        : {}),
    },
  });
  return mapPropuesta(actualizada);
}

export async function findPropuestasPorFeria(
  feriaId: number,
  query: { estado?: EstadoPropuestaFeria },
  user: AuthProfile,
) {
  const feria = await prisma.feria.findUnique({ where: { id: feriaId } });
  if (!feria) throw new ApiError(404, `Feria con id ${feriaId} no encontrada`);
  const estado =
    isAdmin(user) && query.estado !== undefined
      ? query.estado
      : EstadoPropuestaFeria.ACEPTADO;
  const rows = await prisma.propuestaFeria.findMany({
    where: { feriaId, estado },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapPropuesta);
}

export async function moderarPropuesta(
  propuestaId: number,
  dto: { estado: "ACEPTADO" | "RECHAZADO" },
  user: AuthProfile,
) {
  if (!isAdmin(user)) {
    throw new ApiError(
      403,
      "Solo un administrador puede realizar esta operación",
    );
  }
  const row = await prisma.propuestaFeria.findUnique({
    where: { id: propuestaId },
  });
  if (!row)
    throw new ApiError(404, `Propuesta con id ${propuestaId} no encontrada`);
  if (row.estado !== EstadoPropuestaFeria.POSTULADO) {
    throw new ApiError(
      409,
      "Solo se puede moderar una propuesta mientras está en estado POSTULADO",
    );
  }
  const actualizada = await prisma.propuestaFeria.update({
    where: { id: propuestaId },
    data: {
      estado:
        dto.estado === "ACEPTADO"
          ? EstadoPropuestaFeria.ACEPTADO
          : EstadoPropuestaFeria.RECHAZADO,
    },
  });
  return mapPropuesta(actualizada);
}
