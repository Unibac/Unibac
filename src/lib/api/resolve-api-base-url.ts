/** Quita barras finales para concatenar rutas de forma segura. */
export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Base URL del cliente HTTP (Orval/axios).
 * - Ruta relativa (p. ej. `/api-proxy`): peticiones same-origin; la cookie `access_token`
 *   la fija el backend vía rewrite y el middleware de Next puede leerla.
 * - URL absoluta: peticiones cross-origin al API; requiere CORS + `withCredentials`.
 */
export function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  if (!configured) {
    return "";
  }
  if (configured.startsWith("/")) {
    return normalizeBaseUrl(configured);
  }
  return normalizeBaseUrl(configured);
}

/** Destino del rewrite `/api-proxy/*` (solo build/servidor; ver `next.config.ts`). */
export function resolveApiProxyTarget(): string {
  const target = process.env.API_PROXY_TARGET?.trim() ?? "";
  if (!target || target.startsWith("/")) {
    return "";
  }
  return normalizeBaseUrl(target);
}
