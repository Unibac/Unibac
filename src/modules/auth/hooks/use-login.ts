import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loginRequest } from "@/modules/auth/api/auth-api";
import { authKeys } from "@/modules/auth/query-keys";

import type { LoginFormValues } from "@/modules/auth/schemas/login-schema";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LoginFormValues) =>
      loginRequest({ usuario: values.usuario, clave: values.clave }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}
