import axios from "axios";

function normalizeBaseUrl(url: string | undefined) {
  if (!url) {
    return "";
  }
  return url.replace(/\/+$/, "");
}

/**
 * Cliente HTTP hacia el API Nest. Tras POST /auth/login el backend fija la cookie
 * HttpOnly `access_token`; el navegador la reenvía solo si `withCredentials` es true
 * (peticiones cross-origin). No usar Authorization desde localStorage.
 */
export const apiClient = axios.create({
  baseURL: normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL),
  timeout: 10_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
