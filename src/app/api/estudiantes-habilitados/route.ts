import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody } from "@/lib/server/route-helpers";
import { requireAdmin } from "@/lib/server/session";
import {
  createEstudianteHabilitado,
  findAllEstudiantesHabilitados,
} from "@/modules/permisos/server/admin-catalog-service";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await findAllEstudiantesHabilitados());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body =
      await parseJsonBody<Parameters<typeof createEstudianteHabilitado>[0]>(
        request,
      );
    return jsonOk(await createEstudianteHabilitado(body), 201);
  } catch (error) {
    return jsonError(error);
  }
}
