import axios from "axios";

import { resolveApiBaseUrl } from "@/lib/api/resolve-api-base-url";

/**
 * Cliente HTTP hacia el API Nest. Tras POST /auth/login el backend fija la cookie
 * HttpOnly `access_token`. En producción conviene `NEXT_PUBLIC_API_URL=/api-proxy` +
 * `API_PROXY_TARGET` para que la cookie quede en el mismo origen que el frontend
 * (middleware y navegación a `/dashboard`). No usar Authorization desde localStorage.
 */
export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Permitir boundary multipart; no sobrescribir con application/json del default. */
apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData && config.headers) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    }
  }
  return config;
});
