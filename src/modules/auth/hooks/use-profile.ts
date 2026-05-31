import { type UseQueryOptions, useQuery } from "@tanstack/react-query";

import { profileRequest } from "@/modules/auth/api/auth-api";
import { authKeys } from "@/modules/auth/query-keys";

type ProfileData = Awaited<ReturnType<typeof profileRequest>>;

type ProfileQueryOpts = Omit<
  UseQueryOptions<ProfileData, Error>,
  "queryKey" | "queryFn"
>;

export function useProfile(options?: ProfileQueryOpts) {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => profileRequest(),
    retry: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
