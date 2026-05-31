import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseIdParam, parseJsonBody } from "@/lib/server/route-helpers";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import { moderarPropuesta } from "@/modules/ferias/server/ferias-service";

type RouteContext = { params: Promise<{ propuestaId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Ferias", "EDICION");
    const { propuestaId } = await context.params;
    const body = await parseJsonBody<{ estado: "ACEPTADO" | "RECHAZADO" }>(
      request,
    );
    return jsonOk(
      await moderarPropuesta(
        parseIdParam(propuestaId, "propuestaId"),
        body,
        toAuthProfile(user),
      ),
    );
  } catch (error) {
    return jsonError(error);
  }
}
