import { jsonError, jsonOk, jsonNoContent } from "@/lib/server/api-error";
import { parseIdParam, parseJsonBody } from "@/lib/server/route-helpers";
import { isAdmin, requireSessionUsuario } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import {
  findOneEgresado,
  removeEgresado,
  updateEgresado,
} from "@/modules/egresados/server/egresados-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Egresados", "CONSULTA");
    const { id } = await context.params;
    return jsonOk(await findOneEgresado(parseIdParam(id)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Egresados", "EDICION");
    const { id } = await context.params;
    const body =
      await parseJsonBody<Parameters<typeof updateEgresado>[1]>(request);
    return jsonOk(
      await updateEgresado(parseIdParam(id), body, user.id, isAdmin(user)),
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Egresados", "ELIMINACION");
    const { id } = await context.params;
    await removeEgresado(parseIdParam(id), user.nivel);
    return jsonNoContent();
  } catch (error) {
    return jsonError(error);
  }
}
