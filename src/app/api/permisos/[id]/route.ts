import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseIdParam } from "@/lib/server/route-helpers";
import { requireAdmin } from "@/lib/server/session";
import { removePermiso } from "@/modules/permisos/server/admin-catalog-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    return jsonOk(await removePermiso(parseIdParam(id)));
  } catch (error) {
    return jsonError(error);
  }
}
