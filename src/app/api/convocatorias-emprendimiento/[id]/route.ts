import { jsonError, jsonOk, jsonNoContent } from "@/lib/server/api-error";
import { parseIdParam, parseJsonBody } from "@/lib/server/route-helpers";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import {
  findOnePublicacion,
  removePublicacion,
  updatePublicacion,
} from "@/modules/convocatorias-emprendimiento/server/convocatorias-service";

type RouteContext = { params: Promise<{ id: string }> };

function parseFechaLimite<T extends { fechaLimite?: string }>(
  body: T,
): Omit<T, "fechaLimite"> & { fechaLimite?: Date } {
  const { fechaLimite, ...rest } = body;
  return {
    ...rest,
    ...(fechaLimite !== undefined
      ? { fechaLimite: new Date(fechaLimite) }
      : {}),
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Emprendimiento", "CONSULTA");
    const { id } = await context.params;
    return jsonOk(
      await findOnePublicacion(parseIdParam(id), toAuthProfile(user)),
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Emprendimiento", "EDICION");
    const { id } = await context.params;
    const body = await parseJsonBody<
      Parameters<typeof updatePublicacion>[1] & { fechaLimite?: string }
    >(request);
    const dto = parseFechaLimite(body);
    return jsonOk(await updatePublicacion(parseIdParam(id), dto));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Emprendimiento", "ELIMINACION");
    const { id } = await context.params;
    await removePublicacion(parseIdParam(id), user.nivel);
    return jsonNoContent();
  } catch (error) {
    return jsonError(error);
  }
}
