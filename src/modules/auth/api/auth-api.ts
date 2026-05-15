import { getAuth } from "@/api/generated/auth/auth";
import type { LoginDto, RegisterPublicDto } from "@/api/generated/models";

const auth = getAuth();

export async function loginRequest(body: LoginDto) {
  return auth.authControllerLogin(body);
}

export async function logoutRequest() {
  return auth.authControllerLogout();
}

export async function profileRequest() {
  return auth.authControllerGetProfile();
}

export async function registerPublicRequest(body: RegisterPublicDto) {
  return auth.authControllerRegisterPublic(body);
}
