import * as XLSX from "xlsx";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../src/public/templates");
mkdirSync(outDir, { recursive: true });

const wb = XLSX.utils.book_new();

/** Columnas alineadas a EstudianteHabilitado + joins del importador. */
const programas = [
  ["codigo_programa", "nombre_programa", "semestres_plan"],
  ["10", "INGENIERIA DE SISTEMA", "10"],
  ["20", "MUSICA", "10"],
];

const estudiantes = [
  ["identificacion", "codigo_estudiantil", "nombres", "apellidos"],
  ["73123456", "EST-73123456", "Jose", "Martinez Sanchez"],
];

const matricula = [
  ["identificacion", "codigo_programa", "semestre"],
  ["73123456", "20", "3"],
];

XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet(programas),
  "PROGRAMAS",
);
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet(estudiantes),
  "ESTUDIANTES",
);
XLSX.utils.book_append_sheet(
  wb,
  XLSX.utils.aoa_to_sheet(matricula),
  "MATRICULA",
);

const outPath = join(outDir, "padron-carga-masiva.xlsx");
writeFileSync(outPath, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
console.log("Written:", outPath);
