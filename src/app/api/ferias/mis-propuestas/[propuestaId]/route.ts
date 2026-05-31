import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseIdParam, parseJsonBody } from "@/lib/server/route-helpers";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import { updatePropuestaPropietario } from "@/modules/ferias/server/ferias-service";

type RouteContext = { params: Promise<{ propuestaId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Ferias", "EDICION_PROPIA");
    const { propuestaId } = await context.params;
    const body =
      await parseJsonBody<Parameters<typeof updatePropuestaPropietario>[1]>(
        request,
      );
    return jsonOk(
      await updatePropuestaPropietario(
        parseIdParam(propuestaId, "propuestaId"),
        body,
        toAuthProfile(user),
      ),
    );
  } catch (error) {
    return jsonError(error);
  }
}
