import { jsonError, jsonOk } from "@/lib/server/api-error";
import { requireStaff } from "@/lib/server/session";
import { getDashboardResumen } from "@/modules/dashboard/server/dashboard-resumen-service";

export async function GET() {
  try {
    await requireStaff();
    return jsonOk(await getDashboardResumen());
  } catch (error) {
    return jsonError(error);
  }
}
