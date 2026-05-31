import { useQuery } from "@tanstack/react-query";

import { getDashboardResumen } from "@/modules/dashboard/api/dashboard-api";
import { dashboardKeys } from "@/modules/dashboard/query-keys";

export function useDashboardResumenQuery(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.resumen(),
    queryFn: getDashboardResumen,
    enabled,
  });
}
