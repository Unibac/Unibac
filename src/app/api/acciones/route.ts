import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody } from "@/lib/server/route-helpers";
import { requireAdmin } from "@/lib/server/session";
import {
  createAccion,
  findAllAcciones,
} from "@/modules/permisos/server/admin-catalog-service";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await findAllAcciones());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await parseJsonBody<{ nombre: string }>(request);
    return jsonOk(await createAccion(body), 201);
  } catch (error) {
    return jsonError(error);
  }
}
