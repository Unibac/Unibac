import { jsonError, jsonOk, jsonNoContent } from "@/lib/server/api-error";
import { parseIdParam, parseJsonBody } from "@/lib/server/route-helpers";
import { isAdmin, requireSessionUsuario } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import {
  findOneTalento,
  removeTalento,
  updateTalento,
} from "@/modules/talento-perfiles/server/talento-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Talento", "CONSULTA");
    const { id } = await context.params;
    return jsonOk(
      await findOneTalento(parseIdParam(id), user.id, isAdmin(user)),
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Talento", "EDICION");
    const { id } = await context.params;
    const body =
      await parseJsonBody<Parameters<typeof updateTalento>[1]>(request);
    return jsonOk(
      await updateTalento(parseIdParam(id), body, user.id, isAdmin(user)),
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Talento", "ELIMINACION");
    const { id } = await context.params;
    await removeTalento(parseIdParam(id), user.nivel);
    return jsonNoContent();
  } catch (error) {
    return jsonError(error);
  }
}
