import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseIdParam } from "@/lib/server/route-helpers";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import {
  createPostulacion,
  findPostulacionesPorConvocatoria,
} from "@/modules/convocatorias-emprendimiento/server/convocatorias-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Emprendimiento", "CONSULTA");
    const { id } = await context.params;
    return jsonOk(
      await findPostulacionesPorConvocatoria(
        parseIdParam(id),
        toAuthProfile(user),
      ),
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Emprendimiento", "POSTULACION");
    const { id } = await context.params;
    return jsonOk(
      await createPostulacion(parseIdParam(id), toAuthProfile(user)),
      201,
    );
  } catch (error) {
    return jsonError(error);
  }
}
