import { jsonError, jsonOk, jsonNoContent } from "@/lib/server/api-error";
import { parseIdParam, parseJsonBody } from "@/lib/server/route-helpers";
import { requireSessionUsuario } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import {
  findOneFeria,
  removeFeria,
  updateFeria,
} from "@/modules/ferias/server/ferias-service";

type RouteContext = { params: Promise<{ id: string }> };

function parseFeriaDates<T extends { fechaInicio?: string; fechaFin?: string }>(
  body: T,
): Omit<T, "fechaInicio" | "fechaFin"> & {
  fechaInicio?: Date;
  fechaFin?: Date;
} {
  const { fechaInicio, fechaFin, ...rest } = body;
  return {
    ...rest,
    ...(fechaInicio !== undefined
      ? { fechaInicio: new Date(fechaInicio) }
      : {}),
    ...(fechaFin !== undefined ? { fechaFin: new Date(fechaFin) } : {}),
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Ferias", "CONSULTA");
    const { id } = await context.params;
    return jsonOk(await findOneFeria(parseIdParam(id)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Ferias", "EDICION");
    const { id } = await context.params;
    const body = await parseJsonBody<
      Parameters<typeof updateFeria>[1] & {
        fechaInicio?: string;
        fechaFin?: string;
      }
    >(request);
    const dto = parseFeriaDates(body);
    return jsonOk(await updateFeria(parseIdParam(id), dto));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Ferias", "ELIMINACION");
    const { id } = await context.params;
    await removeFeria(parseIdParam(id), user.nivel);
    return jsonNoContent();
  } catch (error) {
    return jsonError(error);
  }
}
