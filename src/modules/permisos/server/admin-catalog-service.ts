import {
  ApiError,
  isPrismaUniqueConstraintError,
} from "@/lib/server/api-error";
import { prisma } from "@/lib/prisma";

function mapPermiso(
  p: {
    id: number;
    rolId: number;
    moduloId: number;
    accionId: number;
    rol: { id: number; codigo: string; nombre: string; activo: boolean };
    modulo: { id: number; nombre: string; activo: boolean };
    accion: { id: number; nombre: string };
  },
  usuarioId = 0,
) {
  return {
    id: p.id,
    usuarioId,
    moduloId: p.moduloId,
    accionId: p.accionId,
    usuario: {
      id: p.rol.id,
      usuario: p.rol.codigo,
      descripcion: p.rol.nombre,
      activo: p.rol.activo,
      nivel: "USUARIO" as const,
      tipo: "INTERNO" as const,
      correo: null,
      celular: null,
    },
    modulo: p.modulo,
    accion: p.accion,
  };
}

export async function findAllPermisos(usuarioId?: number) {
  if (usuarioId !== undefined) {
    const u = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        rol: {
          include: {
            permisos: {
              include: { modulo: true, accion: true },
              orderBy: { id: "asc" },
            },
          },
        },
      },
    });
    if (!u)
      throw new ApiError(404, `Usuario con id ${usuarioId} no encontrado`);
    return (u.rol?.permisos ?? []).map((p) =>
      mapPermiso({ ...p, rol: u.rol! }, u.id),
    );
  }
  const rows = await prisma.rolPermiso.findMany({
    include: { rol: true, modulo: true, accion: true },
    orderBy: [{ rolId: "asc" }, { id: "asc" }],
  });
  return rows.map((p) => mapPermiso(p));
}

export async function findOnePermiso(id: number) {
  const p = await prisma.rolPermiso.findUnique({
    where: { id },
    include: { rol: true, modulo: true, accion: true },
  });
  if (!p) throw new ApiError(404, `Permiso con id ${id} no encontrado`);
  return mapPermiso(p);
}

export async function createRolPermiso(dto: {
  rolId: number;
  moduloId: number;
  accionId: number;
}) {
  const [rol, modulo, accion] = await Promise.all([
    prisma.rol.findUnique({ where: { id: dto.rolId } }),
    prisma.modulo.findUnique({ where: { id: dto.moduloId } }),
    prisma.accion.findUnique({ where: { id: dto.accionId } }),
  ]);
  if (!rol?.activo) throw new ApiError(400, "Rol no encontrado o inactivo");
  if (!modulo?.activo)
    throw new ApiError(400, "Módulo no encontrado o inactivo");
  if (!accion) throw new ApiError(400, "Acción no encontrada");
  try {
    const created = await prisma.rolPermiso.create({
      data: dto,
      include: { rol: true, modulo: true, accion: true },
    });
    return mapPermiso(created);
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(
        409,
        "El permiso ya existe para este rol, módulo y acción",
      );
    }
    throw error;
  }
}

export async function removePermiso(id: number) {
  const exists = await prisma.rolPermiso.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, `Permiso con id ${id} no encontrado`);
  await prisma.rolPermiso.delete({ where: { id } });
  return { id, moduloId: 0, accionId: 0, usuarioId: 0 };
}

export async function findAllModulos(activo?: boolean) {
  return prisma.modulo.findMany({
    where: activo === true ? { activo: true } : {},
    orderBy: { id: "asc" },
  });
}

export async function findOneModulo(id: number) {
  const row = await prisma.modulo.findUnique({ where: { id } });
  if (!row) throw new ApiError(404, `Módulo con id ${id} no encontrado`);
  return row;
}

export async function createModulo(dto: { nombre: string; activo?: boolean }) {
  return prisma.modulo.create({
    data: { nombre: dto.nombre.trim(), activo: dto.activo ?? true },
  });
}

export async function updateModulo(
  id: number,
  dto: Partial<{ nombre: string; activo: boolean }>,
) {
  const exists = await prisma.modulo.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, `Módulo con id ${id} no encontrado`);
  return prisma.modulo.update({
    where: { id },
    data: {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
      ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
    },
  });
}

export async function removeModulo(id: number) {
  const exists = await prisma.modulo.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, `Módulo con id ${id} no encontrado`);
  await prisma.modulo.delete({ where: { id } });
}

export async function findAllAcciones() {
  return prisma.accion.findMany({ orderBy: { id: "asc" } });
}

export async function findOneAccion(id: number) {
  const row = await prisma.accion.findUnique({ where: { id } });
  if (!row) throw new ApiError(404, `Acción con id ${id} no encontrada`);
  return row;
}

export async function createAccion(dto: { nombre: string }) {
  return prisma.accion.create({ data: { nombre: dto.nombre.trim() } });
}

export async function updateAccion(
  id: number,
  dto: Partial<{ nombre: string }>,
) {
  const exists = await prisma.accion.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, `Acción con id ${id} no encontrada`);
  return prisma.accion.update({
    where: { id },
    data: dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {},
  });
}

export async function removeAccion(id: number) {
  const exists = await prisma.accion.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, `Acción con id ${id} no encontrada`);
  await prisma.accion.delete({ where: { id } });
}

export async function findAllEstudiantesHabilitados() {
  return prisma.estudianteHabilitado.findMany({ orderBy: { id: "asc" } });
}

export async function findOneEstudianteHabilitado(id: number) {
  const row = await prisma.estudianteHabilitado.findUnique({ where: { id } });
  if (!row) throw new ApiError(404, `Registro con id ${id} no encontrado`);
  return row;
}

export async function createEstudianteHabilitado(dto: {
  identificacion: string;
  codigoEstudiantil: string;
  nombres: string;
  apellidos: string;
  programa?: string;
  semestre?: number;
}) {
  try {
    return await prisma.estudianteHabilitado.create({
      data: {
        identificacion: dto.identificacion.trim(),
        codigoEstudiantil: dto.codigoEstudiantil.trim(),
        nombres: dto.nombres.trim(),
        apellidos: dto.apellidos.trim(),
        programa: dto.programa?.trim() || null,
        semestre: dto.semestre ?? null,
      },
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(
        409,
        "Identificación y código estudiantil ya registrados",
      );
    }
    throw error;
  }
}

export async function updateEstudianteHabilitado(
  id: number,
  dto: Partial<{
    identificacion: string;
    codigoEstudiantil: string;
    nombres: string;
    apellidos: string;
    programa: string;
    semestre: number;
  }>,
) {
  await findOneEstudianteHabilitado(id);
  try {
    return await prisma.estudianteHabilitado.update({
      where: { id },
      data: {
        ...(dto.identificacion !== undefined
          ? { identificacion: dto.identificacion.trim() }
          : {}),
        ...(dto.codigoEstudiantil !== undefined
          ? { codigoEstudiantil: dto.codigoEstudiantil.trim() }
          : {}),
        ...(dto.nombres !== undefined ? { nombres: dto.nombres.trim() } : {}),
        ...(dto.apellidos !== undefined
          ? { apellidos: dto.apellidos.trim() }
          : {}),
        ...(dto.programa !== undefined
          ? { programa: dto.programa.trim() || null }
          : {}),
        ...(dto.semestre !== undefined ? { semestre: dto.semestre } : {}),
      },
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(
        409,
        "Identificación y código estudiantil ya registrados",
      );
    }
    throw error;
  }
}

export async function removeEstudianteHabilitado(id: number) {
  await findOneEstudianteHabilitado(id);
  await prisma.estudianteHabilitado.delete({ where: { id } });
}

export async function findAllEgresadosHabilitados() {
  return prisma.egresadoHabilitado.findMany({ orderBy: { id: "asc" } });
}

export async function findOneEgresadoHabilitado(id: number) {
  const row = await prisma.egresadoHabilitado.findUnique({ where: { id } });
  if (!row) throw new ApiError(404, `Registro con id ${id} no encontrado`);
  return row;
}

export async function createEgresadoHabilitado(dto: {
  identificacion: string;
}) {
  try {
    return await prisma.egresadoHabilitado.create({
      data: { identificacion: dto.identificacion.trim() },
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(409, "Identificación ya registrada");
    }
    throw error;
  }
}

export async function updateEgresadoHabilitado(
  id: number,
  dto: { identificacion?: string },
) {
  await findOneEgresadoHabilitado(id);
  try {
    return await prisma.egresadoHabilitado.update({
      where: { id },
      data:
        dto.identificacion !== undefined
          ? { identificacion: dto.identificacion.trim() }
          : {},
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new ApiError(409, "Identificación ya registrada");
    }
    throw error;
  }
}

export async function removeEgresadoHabilitado(id: number) {
  await findOneEgresadoHabilitado(id);
  await prisma.egresadoHabilitado.delete({ where: { id } });
}
