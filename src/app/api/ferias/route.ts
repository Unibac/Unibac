import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody } from "@/lib/server/route-helpers";
import { requireSessionUsuario } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import {
  createFeria,
  findAllFerias,
} from "@/modules/ferias/server/ferias-service";

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

export async function GET() {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Ferias", "CONSULTA");
    return jsonOk(await findAllFerias());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Ferias", "CREACION");
    const body = await parseJsonBody<{
      nombre: string;
      descripcion: string;
      fechaInicio: string;
      fechaFin: string;
      imagenBannerUrl?: string;
    }>(request);
    const dto = parseFeriaDates(body) as Parameters<typeof createFeria>[0];
    return jsonOk(await createFeria(dto), 201);
  } catch (error) {
    return jsonError(error);
  }
}
