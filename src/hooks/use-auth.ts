import {
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { getAuth } from "@/api/generated/auth/auth";
import type { LoginDto } from "@/api/generated/models";

const authApi = getAuth();

/**
 * Login: el API fija la cookie HttpOnly `access_token` (no devuelve JWT en el cuerpo).
 * Las siguientes peticiones vía `apiClient` envían la cookie gracias a `withCredentials`.
 */
export function useLogin() {
  return useMutation({
    mutationFn: (loginDto: LoginDto) => authApi.authControllerLogin(loginDto),
  });
}

/** Cierra sesión en el servidor y elimina la cookie `access_token`. */
export function useLogout() {
  return useMutation({
    mutationFn: () => authApi.authControllerLogout(),
  });
}

type ProfileQueryOpts = Omit<
  UseQueryOptions<Awaited<ReturnType<typeof authApi.authControllerGetProfile>>>,
  "queryKey" | "queryFn"
>;

/** Perfil del usuario autenticado (requiere cookie). Usa `enabled: false` hasta saber que hay sesión si quieres evitar 401 en público. */
export function useProfile(options?: ProfileQueryOpts) {
  return useQuery({
    queryKey: ["auth", "profile"],
    queryFn: () => authApi.authControllerGetProfile(),
    retry: false,
    ...options,
  });
}
