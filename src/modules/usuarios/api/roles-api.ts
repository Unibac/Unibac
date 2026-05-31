import type { RolResponseDto } from "@/modules/shared/types/api-models";
import { fetchApi } from "@/lib/api/fetch-api";

export async function listRolesCatalog() {
  return fetchApi<RolResponseDto[]>("/api/roles");
}
