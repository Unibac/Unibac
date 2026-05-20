import type { EstadoPropuestaFeria } from "@/modules/shared/types/api-models";
import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseIdParam, parseJsonBody } from "@/lib/server/route-helpers";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import {
  createPropuesta,
  findPropuestasPorFeria,
} from "@/modules/ferias/server/ferias-service";

type RouteContext = { params: Promise<{ feriaId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Ferias", "CONSULTA");
    const { feriaId } = await context.params;
    const estadoRaw = new URL(request.url).searchParams.get("estado");
    const estado = estadoRaw ? (estadoRaw as EstadoPropuestaFeria) : undefined;
    return jsonOk(
      await findPropuestasPorFeria(
        parseIdParam(feriaId, "feriaId"),
        { estado },
        toAuthProfile(user),
      ),
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Ferias", "PROPUESTA");
    const { feriaId } = await context.params;
    const body =
      await parseJsonBody<Parameters<typeof createPropuesta>[1]>(request);
    return jsonOk(
      await createPropuesta(
        parseIdParam(feriaId, "feriaId"),
        body,
        toAuthProfile(user),
      ),
      201,
    );
  } catch (error) {
    return jsonError(error);
  }
}
