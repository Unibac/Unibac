import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logoutRequest } from "@/modules/auth/api/auth-api";
import { authKeys } from "@/modules/auth/query-keys";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutRequest(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}
