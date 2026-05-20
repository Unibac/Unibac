import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody } from "@/lib/server/route-helpers";
import { requireAdmin } from "@/lib/server/session";
import {
  createEgresadoHabilitado,
  findAllEgresadosHabilitados,
} from "@/modules/permisos/server/admin-catalog-service";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await findAllEgresadosHabilitados());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await parseJsonBody<{ identificacion: string }>(request);
    return jsonOk(await createEgresadoHabilitado(body), 201);
  } catch (error) {
    return jsonError(error);
  }
}
