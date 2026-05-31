import { fetchApi } from "@/lib/api/fetch-api";
import type {
  LoginInput,
  LoginResponse,
  LogoutResponse,
  RegisterPublicInput,
} from "@/modules/auth/types";

export async function loginRequest(body: LoginInput) {
  return fetchApi<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function logoutRequest() {
  return fetchApi<LogoutResponse>("/api/auth/logout", { method: "POST" });
}

export async function profileRequest() {
  return fetchApi<import("@/modules/auth/types").AuthProfile>(
    "/api/auth/profile",
  );
}

export async function registerPublicRequest(body: RegisterPublicInput) {
  return fetchApi<Record<string, unknown>>("/api/auth/register-public", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
