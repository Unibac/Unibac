import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseIdParam, parseJsonBody } from "@/lib/server/route-helpers";
import { requireAdmin } from "@/lib/server/session";
import {
  findOneUsuario,
  removeUsuario,
  updateUsuario,
} from "@/modules/usuarios/server/usuarios-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    return jsonOk(await findOneUsuario(parseIdParam(id)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body =
      await parseJsonBody<Parameters<typeof updateUsuario>[1]>(request);
    return jsonOk(await updateUsuario(parseIdParam(id), body));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    return jsonOk(await removeUsuario(parseIdParam(id)));
  } catch (error) {
    return jsonError(error);
  }
}
