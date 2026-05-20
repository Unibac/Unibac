import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseIdParam, parseJsonBody } from "@/lib/server/route-helpers";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import { updateEstadoPostulacion } from "@/modules/convocatorias-emprendimiento/server/convocatorias-service";

type RouteContext = { params: Promise<{ postulacionId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Emprendimiento", "EDICION");
    const { postulacionId } = await context.params;
    const body = await parseJsonBody<{ estado: "APROBADO" | "RECHAZADO" }>(
      request,
    );
    return jsonOk(
      await updateEstadoPostulacion(
        parseIdParam(postulacionId, "postulacionId"),
        body,
        toAuthProfile(user),
      ),
    );
  } catch (error) {
    return jsonError(error);
  }
}
