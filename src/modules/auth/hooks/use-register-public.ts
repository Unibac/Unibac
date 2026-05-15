import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  profileRequest,
  registerPublicRequest,
} from "@/modules/auth/api/auth-api";
import { authKeys } from "@/modules/auth/query-keys";
import {
  type RegisterPublicFormValues,
  toRegisterPublicDto,
} from "@/modules/auth/schemas/register-public-schema";

export type RegisterPublicMutationResult =
  | { kind: "session" }
  | { kind: "registered" };

export function useRegisterPublic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      values: RegisterPublicFormValues,
    ): Promise<RegisterPublicMutationResult> => {
      await registerPublicRequest(toRegisterPublicDto(values));
      void queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      try {
        await profileRequest();
        return { kind: "session" };
      } catch {
        return { kind: "registered" };
      }
    },
  });
}
