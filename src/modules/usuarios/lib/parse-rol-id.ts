/** Normaliza `rolId` tal como viene del OpenAPI (p. ej. `unknown` en tipos generados). */
export function parseOptionalRolId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}
