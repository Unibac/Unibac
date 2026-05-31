/** Marcador en USUARIOS.CLAVE cuando la credencial vive en Supabase Auth. */
export const CLAVE_MANAGED_BY_SUPABASE = "SUPABASE_AUTH";

const AUTH_EMAIL_DOMAIN =
  process.env.AUTH_EMAIL_DOMAIN?.trim() || "auth.unibac.local";

/** Email determinístico para Supabase Auth a partir del login `usuario`. */
export function authEmailForUsuario(usuario: string): string {
  const normalized = usuario.trim().toLowerCase();
  if (normalized.length < 3) {
    throw new Error("Usuario inválido para email interno");
  }
  const safe = normalized.replace(/[^a-z0-9._-]/g, "_");
  return `${safe}@${AUTH_EMAIL_DOMAIN}`;
}
