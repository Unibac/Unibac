import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody, parseOptionalBool } from "@/lib/server/route-helpers";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import {
  createPublicacion,
  findAllPublicaciones,
} from "@/modules/convocatorias-emprendimiento/server/convocatorias-service";

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

export async function GET(request: Request) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Emprendimiento", "CONSULTA");
    const params = new URL(request.url).searchParams;
    const query = {
      activo: parseOptionalBool(params.get("activo")),
      tipoConvocatoria: params.get("tipoConvocatoria") ?? undefined,
    };
    return jsonOk(await findAllPublicaciones(query, toAuthProfile(user)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Emprendimiento", "CREACION");
    const body = await parseJsonBody<{
      titulo: string;
      descripcion: string;
      tipoConvocatoria: string;
      convocados: string;
      fechaLimite: string;
      montoTipoApoyo?: string;
      linkExterno?: string;
      activo?: boolean;
    }>(request);
    const dto = parseFechaLimite(body) as Parameters<
      typeof createPublicacion
    >[0];
    return jsonOk(await createPublicacion(dto), 201);
  } catch (error) {
    return jsonError(error);
  }
}
