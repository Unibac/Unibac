/**
 * Normaliza URLs de imagen devueltas por la API (string o valor JSON del DTO).
 * Solo acepta http(s) para uso seguro en `<img>` / `next/image`.
 */
export function parsePublicImageUrl(value: unknown): string | null {
  if (value == null) return null;

  let raw: string;
  if (typeof value === "string") {
    raw = value.trim();
  } else {
    try {
      const s = JSON.stringify(value);
      if (s === "{}" || s === "null") return null;
      raw = s.replace(/^"|"$/g, "").trim();
    } catch {
      raw = String(value).trim();
    }
  }

  if (!raw || raw === "—") return null;
  return /^https?:\/\//i.test(raw) ? raw : null;
}
