import { jsonError, jsonOk } from "@/lib/server/api-error";
import { requireAdmin } from "@/lib/server/session";
import { findAllRoles } from "@/modules/usuarios/server/usuarios-service";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await findAllRoles());
  } catch (error) {
    return jsonError(error);
  }
}
