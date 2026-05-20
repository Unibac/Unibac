import { jsonError, jsonOk, jsonNoContent } from "@/lib/server/api-error";
import { parseIdParam, parseJsonBody } from "@/lib/server/route-helpers";
import { requireAdmin } from "@/lib/server/session";
import {
  findOneEstudianteHabilitado,
  removeEstudianteHabilitado,
  updateEstudianteHabilitado,
} from "@/modules/permisos/server/admin-catalog-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    return jsonOk(await findOneEstudianteHabilitado(parseIdParam(id)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body =
      await parseJsonBody<Parameters<typeof updateEstudianteHabilitado>[1]>(
        request,
      );
    return jsonOk(await updateEstudianteHabilitado(parseIdParam(id), body));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await removeEstudianteHabilitado(parseIdParam(id));
    return jsonNoContent();
  } catch (error) {
    return jsonError(error);
  }
}
