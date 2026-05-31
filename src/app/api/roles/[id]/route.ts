import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseIdParam, parseJsonBody } from "@/lib/server/route-helpers";
import { requireAdmin } from "@/lib/server/session";
import { updateRol } from "@/modules/administracion/server/roles-admin-service";
import type { UpdateRolDto } from "@/modules/shared/types/api-models";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await parseJsonBody<UpdateRolDto>(request);
    return jsonOk(await updateRol(parseIdParam(id), body));
  } catch (error) {
    return jsonError(error);
  }
}
