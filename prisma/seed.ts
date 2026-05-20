import { resolve } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { Pool } from "pg";

import {
  NivelUsuario,
  PrismaClient,
  TipoUsuario,
} from "../src/generated/prisma/client";
import { createSupabaseAdminClient } from "../src/lib/supabase/admin";
import {
  authEmailForUsuario,
  CLAVE_MANAGED_BY_SUPABASE,
} from "../src/modules/auth/server/auth-email";
import {
  ROL_EXTERNO_EGRESADO,
  ROL_EXTERNO_EMPRESA,
  ROL_EXTERNO_ESTUDIANTE,
  ROL_INTERNO_BASE,
} from "../src/modules/shared/constants/rol-codigos";

const root = process.cwd();
config({ path: resolve(root, ".env") });
config({ path: resolve(root, ".env.local"), override: true });

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DIRECT_URL o DATABASE_URL es obligatorio para ejecutar el seed (ver prisma/README.md)",
  );
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const SEED_ADMIN_USUARIO =
  process.env.SEED_ADMIN_USUARIO?.trim() || "administrador";
const SEED_ADMIN_PASSWORD =
  process.env.SEED_ADMIN_PASSWORD?.trim() || "admin123";
const SEED_DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD?.trim() || "demo123";

type ModuloAcciones = Record<string, readonly string[]>;

const PERMISOS_POR_ROL: Record<string, ModuloAcciones> = {
  [ROL_INTERNO_BASE]: {
    Emprendimiento: [
      "CONSULTA",
      "CREACION",
      "EDICION",
      "ELIMINACION",
      "POSTULACION",
    ],
    Ferias: ["CONSULTA", "CREACION", "EDICION", "ELIMINACION"],
    Egresados: ["CONSULTA", "CREACION", "EDICION", "ELIMINACION"],
    Administración: ["CONSULTA", "CREACION", "EDICION", "ELIMINACION"],
    Talento: ["CONSULTA", "CREACION", "EDICION", "ELIMINACION"],
  },
  [ROL_EXTERNO_ESTUDIANTE]: {
    Emprendimiento: [
      "CONSULTA",
      "CREACION",
      "EDICION",
      "ELIMINACION",
      "POSTULACION",
    ],
    Egresados: ["CONSULTA", "CREACION", "EDICION", "ELIMINACION"],
    Ferias: ["CONSULTA", "PROPUESTA", "EDICION_PROPIA"],
    Talento: ["CONSULTA", "CREACION", "EDICION", "ELIMINACION"],
  },
  [ROL_EXTERNO_EGRESADO]: {
    Egresados: ["CONSULTA", "CREACION", "EDICION", "ELIMINACION"],
    Talento: ["CONSULTA", "CREACION", "EDICION", "ELIMINACION"],
    Emprendimiento: ["CONSULTA", "POSTULACION"],
    Ferias: ["CONSULTA"],
  },
  [ROL_EXTERNO_EMPRESA]: {
    Emprendimiento: ["CONSULTA", "POSTULACION"],
    Ferias: ["CONSULTA"],
  },
};

async function findAuthUserIdByEmail(
  email: string,
): Promise<string | undefined> {
  const admin = createSupabaseAdminClient();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`Supabase listUsers: ${error.message}`);
    }
    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (match) {
      return match.id;
    }
    if (data.users.length < perPage) {
      return undefined;
    }
    page += 1;
  }
}

/** Crea o actualiza usuario en Supabase Auth (idempotente). */
async function ensureSupabaseAuthUser(
  usuario: string,
  password: string,
): Promise<string> {
  const admin = createSupabaseAdminClient();
  const email = authEmailForUsuario(usuario);
  const existingId = await findAuthUserIdByEmail(email);

  if (existingId) {
    const { error } = await admin.auth.admin.updateUserById(existingId, {
      password,
      email_confirm: true,
    });
    if (error) {
      throw new Error(
        `Supabase updateUser (${usuario}): ${error.message}`,
      );
    }
    return existingId;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(
      `Supabase createUser (${usuario}): ${error?.message ?? "sin usuario"}`,
    );
  }
  return data.user.id;
}

async function seedUsuarioConAuth(params: {
  usuario: string;
  password: string;
  descripcion: string;
  nivel: NivelUsuario;
  tipo: TipoUsuario;
  correo: string;
  rolId?: number;
}): Promise<void> {
  const authUserId = await ensureSupabaseAuthUser(
    params.usuario,
    params.password,
  );

  await prisma.usuario.upsert({
    where: { usuario: params.usuario },
    update: {
      authUserId,
      clave: CLAVE_MANAGED_BY_SUPABASE,
      descripcion: params.descripcion,
      nivel: params.nivel,
      tipo: params.tipo,
      correo: params.correo,
      activo: true,
      ...(params.rolId !== undefined ? { rolId: params.rolId } : {}),
    },
    create: {
      usuario: params.usuario,
      descripcion: params.descripcion,
      clave: CLAVE_MANAGED_BY_SUPABASE,
      authUserId,
      nivel: params.nivel,
      tipo: params.tipo,
      correo: params.correo,
      activo: true,
      ...(params.rolId !== undefined ? { rolId: params.rolId } : {}),
    },
  });
}

async function main(): Promise<void> {
  await prisma.accion.createMany({
    data: [
      { nombre: "CONSULTA" },
      { nombre: "CREACION" },
      { nombre: "EDICION" },
      { nombre: "ELIMINACION" },
      { nombre: "POSTULACION" },
      { nombre: "PROPUESTA" },
      { nombre: "EDICION_PROPIA" },
    ],
    skipDuplicates: true,
  });

  await prisma.modulo.createMany({
    data: [
      { nombre: "Bienestar" },
      { nombre: "Encuestas" },
      { nombre: "Emprendimiento" },
      { nombre: "Egresados" },
      { nombre: "Administración" },
      { nombre: "Ferias" },
      { nombre: "Talento" },
    ],
    skipDuplicates: true,
  });

  const rolesSeed = [
    {
      codigo: ROL_INTERNO_BASE,
      nombre: "Personal interno (base)",
      activo: true,
    },
    {
      codigo: ROL_EXTERNO_ESTUDIANTE,
      nombre: "Externo — estudiante",
      activo: true,
    },
    {
      codigo: ROL_EXTERNO_EGRESADO,
      nombre: "Externo — egresado",
      activo: true,
    },
    {
      codigo: ROL_EXTERNO_EMPRESA,
      nombre: "Externo — empresa",
      activo: true,
    },
  ] as const;

  for (const r of rolesSeed) {
    await prisma.rol.upsert({
      where: { codigo: r.codigo },
      create: { codigo: r.codigo, nombre: r.nombre, activo: r.activo },
      update: { nombre: r.nombre, activo: r.activo },
    });
  }

  const modulos = await prisma.modulo.findMany();
  const acciones = await prisma.accion.findMany();
  const moduloIdPorNombre = new Map(modulos.map((m) => [m.nombre, m.id]));
  const accionIdPorNombre = new Map(acciones.map((a) => [a.nombre, a.id]));
  const rolesDb = await prisma.rol.findMany();
  const rolIdPorCodigo = new Map(rolesDb.map((r) => [r.codigo, r.id]));

  const filasRolPermiso: {
    rolId: number;
    moduloId: number;
    accionId: number;
  }[] = [];

  for (const [codigoRol, porModulo] of Object.entries(PERMISOS_POR_ROL)) {
    const rolId = rolIdPorCodigo.get(codigoRol);
    if (rolId === undefined) {
      continue;
    }
    for (const [nombreModulo, nombresAccion] of Object.entries(porModulo)) {
      const moduloId = moduloIdPorNombre.get(nombreModulo);
      if (moduloId === undefined) {
        continue;
      }
      for (const nombreAccion of nombresAccion) {
        const accionId = accionIdPorNombre.get(nombreAccion);
        if (accionId === undefined) {
          continue;
        }
        filasRolPermiso.push({ rolId, moduloId, accionId });
      }
    }
  }

  if (filasRolPermiso.length > 0) {
    await prisma.rolPermiso.createMany({
      data: filasRolPermiso,
      skipDuplicates: true,
    });
  }

  const rolEstudianteId = rolIdPorCodigo.get(ROL_EXTERNO_ESTUDIANTE);
  const rolInternoId = rolIdPorCodigo.get(ROL_INTERNO_BASE);

  await seedUsuarioConAuth({
    usuario: SEED_ADMIN_USUARIO,
    password: SEED_ADMIN_PASSWORD,
    descripcion: "Administrador del sistema",
    nivel: NivelUsuario.ADMINISTRADOR,
    tipo: TipoUsuario.INTERNO,
    correo: "admin@empresa.com",
  });

  await seedUsuarioConAuth({
    usuario: "demo_emprendimiento",
    password: SEED_DEMO_PASSWORD,
    descripcion: "Usuario demo módulo Emprendimiento",
    nivel: NivelUsuario.USUARIO,
    tipo: TipoUsuario.EXTERNO,
    correo: "demo_emprendimiento@example.com",
    ...(rolEstudianteId !== undefined ? { rolId: rolEstudianteId } : {}),
  });

  await seedUsuarioConAuth({
    usuario: "demo_ferias_interno",
    password: SEED_DEMO_PASSWORD,
    descripcion: "Usuario demo interno — ferias virtuales (propuestas)",
    nivel: NivelUsuario.USUARIO,
    tipo: TipoUsuario.INTERNO,
    correo: "demo_ferias_interno@example.com",
    ...(rolInternoId !== undefined ? { rolId: rolInternoId } : {}),
  });

  await prisma.estudianteHabilitado.upsert({
    where: {
      identificacion_codigoEstudiantil: {
        identificacion: "0000000000",
        codigoEstudiantil: "DEMO-EST-001",
      },
    },
    update: {},
    create: {
      identificacion: "0000000000",
      codigoEstudiantil: "DEMO-EST-001",
      nombres: "Demo",
      apellidos: "Estudiante",
      programa: "Ingeniería demo",
      semestre: 8,
    },
  });

  await prisma.egresadoHabilitado.upsert({
    where: { identificacion: "0000000001" },
    update: {},
    create: { identificacion: "0000000001" },
  });

  console.log("Seed completado.");
  console.log(
    `  Admin: usuario="${SEED_ADMIN_USUARIO}" clave="${SEED_ADMIN_PASSWORD}"`,
  );
  console.log(
    '  Demo: usuario="demo_emprendimiento" | "demo_ferias_interno" clave="' +
      SEED_DEMO_PASSWORD +
      '"',
  );
  console.log(
    `  Auth email interno: ${authEmailForUsuario(SEED_ADMIN_USUARIO)}`,
  );
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
