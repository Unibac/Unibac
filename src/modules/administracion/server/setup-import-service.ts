import * as XLSX from "xlsx";

import { ApiError } from "@/lib/server/api-error";
import { prisma } from "@/lib/prisma";
import {
  type EstudianteSheetRow,
  type MatriculaSheetRow,
  type PadronImportRow,
  type ProgramaSheetRow,
  estudianteSheetRowSchema,
  matriculaSheetRowSchema,
  padronImportRowSchema,
  programaSheetRowSchema,
} from "@/modules/administracion/schemas/setup-import-schemas";
import type {
  SetupImportResultDto,
  SetupImportRowPreview,
} from "@/modules/shared/types/api-models";

const REQUIRED_SHEETS = ["PROGRAMAS", "ESTUDIANTES", "MATRICULA"] as const;
const MAX_MATRICULA_ROWS = 2000;

const SETUP_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/octet-stream",
]);

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "_");
}

function normalizeSheetName(name: string): string {
  return name.trim().toUpperCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

function parseSheetRows<T>(
  sheet: XLSX.WorkSheet,
  schema: {
    safeParse: (data: unknown) => {
      success: boolean;
      data?: T;
      error?: { issues: { message: string }[] };
    };
  },
  sheetLabel: string,
): { rows: T[]; errors: string[] } {
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as unknown[][];

  if (matrix.length === 0) {
    return { rows: [], errors: [] };
  }

  const headerRow = matrix[0] ?? [];
  const headers = headerRow.map((h) => normalizeHeader(h));
  const rows: T[] = [];
  const errors: string[] = [];

  for (let i = 1; i < matrix.length; i++) {
    const line = matrix[i] ?? [];
    const isEmpty = line.every((cell) => cellToString(cell) === "");
    if (isEmpty) continue;

    const record: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key) continue;
      record[key] = cellToString(line[c]);
    }

    const parsed = schema.safeParse(record);
    if (parsed.success && parsed.data) {
      rows.push(parsed.data);
    } else {
      const msg =
        parsed.error?.issues.map((issue) => issue.message).join("; ") ??
        "Fila inválida";
      errors.push(`${sheetLabel} fila ${i + 1}: ${msg}`);
    }
  }

  return { rows, errors };
}

function findSheet(
  workbook: XLSX.WorkBook,
  expectedName: string,
): XLSX.WorkSheet | null {
  const target = normalizeSheetName(expectedName);
  for (const name of workbook.SheetNames) {
    if (normalizeSheetName(name) === target) {
      return workbook.Sheets[name] ?? null;
    }
  }
  return null;
}

function padronKey(identificacion: string, codigoEstudiantil: string): string {
  return `${identificacion.trim()}::${codigoEstudiantil.trim()}`;
}

export function assertSetupImportMime(mimeType: string, fileName: string) {
  const ext = fileName.toLowerCase();
  const validExt = ext.endsWith(".xlsx") || ext.endsWith(".xls");
  if (!SETUP_MIME_TYPES.has(mimeType) && !validExt) {
    throw new ApiError(
      400,
      "Tipo de archivo no permitido. Use Excel (.xlsx o .xls).",
    );
  }
}

export async function processSetupImport(
  buffer: Buffer,
  dryRun: boolean,
): Promise<SetupImportResultDto> {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });

  for (const sheetName of REQUIRED_SHEETS) {
    if (!findSheet(workbook, sheetName)) {
      throw new ApiError(400, `Falta la hoja requerida: ${sheetName}`);
    }
  }

  const programasSheet = findSheet(workbook, "PROGRAMAS");
  const estudiantesSheet = findSheet(workbook, "ESTUDIANTES");
  const matriculaSheet = findSheet(workbook, "MATRICULA");
  if (!programasSheet || !estudiantesSheet || !matriculaSheet) {
    throw new ApiError(400, "Faltan hojas requeridas en el archivo");
  }
  const hojaVariablesOmitida = findSheet(workbook, "VARIABLES") != null;

  const programasParsed = parseSheetRows<ProgramaSheetRow>(
    programasSheet,
    programaSheetRowSchema,
    "PROGRAMAS",
  );
  const estudiantesParsed = parseSheetRows<EstudianteSheetRow>(
    estudiantesSheet,
    estudianteSheetRowSchema,
    "ESTUDIANTES",
  );
  const matriculaParsed = parseSheetRows<MatriculaSheetRow>(
    matriculaSheet,
    matriculaSheetRowSchema,
    "MATRICULA",
  );

  if (matriculaParsed.rows.length > MAX_MATRICULA_ROWS) {
    throw new ApiError(
      400,
      `El archivo supera el máximo de ${MAX_MATRICULA_ROWS} filas en MATRICULA.`,
    );
  }

  const programasByCodigo = new Map<string, ProgramaSheetRow>();
  for (const p of programasParsed.rows) {
    programasByCodigo.set(p.codigo_programa.trim(), p);
  }

  const estudiantesById = new Map<string, EstudianteSheetRow>();
  for (const e of estudiantesParsed.rows) {
    estudiantesById.set(e.identificacion.trim(), e);
  }

  const filas: SetupImportRowPreview[] = [];
  const seenKeys = new Set<string>();
  const validRows: PadronImportRow[] = [];

  let filaNum = 0;
  for (const m of matriculaParsed.rows) {
    filaNum += 1;
    const identificacion = m.identificacion.trim();
    const codigoPrograma = m.codigo_programa.trim();

    const estudiante = estudiantesById.get(identificacion);
    if (!estudiante) {
      filas.push({
        fila: filaNum,
        identificacion,
        codigoEstudiantil: "",
        nombres: "",
        apellidos: "",
        estado: "error",
        mensaje: `No hay estudiante con identificación ${identificacion} en ESTUDIANTES`,
      });
      continue;
    }

    const programa = programasByCodigo.get(codigoPrograma);
    if (!programa) {
      filas.push({
        fila: filaNum,
        identificacion,
        codigoEstudiantil: estudiante.codigo_estudiantil.trim(),
        nombres: estudiante.nombres.trim(),
        apellidos: estudiante.apellidos.trim(),
        estado: "error",
        mensaje: `Código de programa ${codigoPrograma} no existe en PROGRAMAS`,
      });
      continue;
    }

    const semestre = m.semestre ?? programa.semestres_plan;
    const candidate: PadronImportRow = {
      identificacion,
      codigoEstudiantil: estudiante.codigo_estudiantil.trim(),
      nombres: estudiante.nombres.trim(),
      apellidos: estudiante.apellidos.trim(),
      programa: programa.nombre_programa.trim(),
      semestre,
    };

    const validated = padronImportRowSchema.safeParse(candidate);
    if (!validated.success) {
      filas.push({
        fila: filaNum,
        identificacion,
        codigoEstudiantil: candidate.codigoEstudiantil,
        nombres: candidate.nombres,
        apellidos: candidate.apellidos,
        programa: candidate.programa,
        semestre: candidate.semestre,
        estado: "error",
        mensaje: validated.error.issues.map((i) => i.message).join("; "),
      });
      continue;
    }

    const key = padronKey(
      validated.data.identificacion,
      validated.data.codigoEstudiantil,
    );
    if (seenKeys.has(key)) {
      filas.push({
        fila: filaNum,
        identificacion: validated.data.identificacion,
        codigoEstudiantil: validated.data.codigoEstudiantil,
        nombres: validated.data.nombres,
        apellidos: validated.data.apellidos,
        programa: validated.data.programa,
        semestre: validated.data.semestre,
        estado: "duplicado",
        mensaje: "Duplicado en el mismo archivo",
      });
      continue;
    }
    seenKeys.add(key);
    validRows.push(validated.data);

    filas.push({
      fila: filaNum,
      identificacion: validated.data.identificacion,
      codigoEstudiantil: validated.data.codigoEstudiantil,
      nombres: validated.data.nombres,
      apellidos: validated.data.apellidos,
      programa: validated.data.programa,
      semestre: validated.data.semestre,
      estado: "ok",
    });
  }

  const sheetErrors = [
    ...programasParsed.errors,
    ...estudiantesParsed.errors,
    ...matriculaParsed.errors,
  ];
  for (const err of sheetErrors) {
    filas.push({
      fila: 0,
      identificacion: "",
      codigoEstudiantil: "",
      nombres: "",
      apellidos: "",
      estado: "error",
      mensaje: err,
    });
  }

  let creadas = 0;

  if (validRows.length > 0) {
    const existing = await prisma.estudianteHabilitado.findMany({
      where: {
        OR: validRows.map((r) => ({
          identificacion: r.identificacion,
          codigoEstudiantil: r.codigoEstudiantil,
        })),
      },
      select: { identificacion: true, codigoEstudiantil: true },
    });
    const existingKeys = new Set(
      existing.map((e) => padronKey(e.identificacion, e.codigoEstudiantil)),
    );

    for (const row of filas) {
      if (row.estado !== "ok") continue;
      const key = padronKey(row.identificacion, row.codigoEstudiantil);
      if (existingKeys.has(key)) {
        row.estado = "duplicado";
        row.mensaje = "Ya existe en el padrón";
      }
    }

    const toInsert = validRows.filter(
      (r) =>
        !existingKeys.has(padronKey(r.identificacion, r.codigoEstudiantil)),
    );

    if (!dryRun && toInsert.length > 0) {
      const result = await prisma.estudianteHabilitado.createMany({
        data: toInsert.map((r) => ({
          identificacion: r.identificacion,
          codigoEstudiantil: r.codigoEstudiantil,
          nombres: r.nombres,
          apellidos: r.apellidos,
          programa: r.programa ?? null,
          semestre: r.semestre ?? null,
        })),
        skipDuplicates: true,
      });
      creadas = result.count;
    }
  }

  const duplicadas = filas.filter((f) => f.estado === "duplicado").length;
  const errores = filas.filter((f) => f.estado === "error").length;
  const filasValidas = filas.filter((f) => f.estado === "ok").length;

  return {
    dryRun,
    resumen: {
      programasLeidos: programasParsed.rows.length,
      estudiantesLeidos: estudiantesParsed.rows.length,
      matriculasLeidas: matriculaParsed.rows.length,
      filasValidas,
      creadas: dryRun ? 0 : creadas,
      duplicadas,
      errores,
      hojaVariablesOmitida,
    },
    filas,
  };
}
