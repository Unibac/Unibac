import { fetchApi } from "@/lib/api/fetch-api";
import type { DashboardResumenResponseDto } from "@/modules/shared/types/api-models";

export async function getDashboardResumen() {
  return fetchApi<DashboardResumenResponseDto>("/api/dashboard/resumen");
}
