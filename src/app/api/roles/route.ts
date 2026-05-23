import { jsonError, jsonOk } from "@/lib/server/api-error";
import { requireAdmin } from "@/lib/server/session";
import { findAllRolesWithStats } from "@/modules/administracion/server/roles-admin-service";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await findAllRolesWithStats());
  } catch (error) {
    return jsonError(error);
  }
}
