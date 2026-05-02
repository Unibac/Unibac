import { useMutation } from "@tanstack/react-query";
import { getAuth } from "@/api/generated/auth/auth";
import type { LoginDto } from "@/api/generated/models";

const authApi = getAuth();

export function useLogin() {
  return useMutation({
    mutationFn: (loginDto: LoginDto) => authApi.authControllerLogin(loginDto),
  });
}
