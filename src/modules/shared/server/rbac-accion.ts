/** Acciones persistidas en RolPermiso (solo CRUD). */
export const ACCIONES_CRUD = new Set([
  "CONSULTA",
  "CREACION",
  "EDICION",
  "ELIMINACION",
]);

export function normalizarAccionRbac(nombreAccion: string): string {
  const n = nombreAccion.trim();
  if (ACCIONES_CRUD.has(n)) return n;
  switch (n) {
    case "POSTULACION":
      return "CONSULTA";
    case "PROPUESTA":
      return "CREACION";
    case "EDICION_PROPIA":
      return "EDICION";
    default:
      return n;
  }
}
