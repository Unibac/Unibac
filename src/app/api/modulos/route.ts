import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody, parseOptionalBool } from "@/lib/server/route-helpers";
import { requireAdmin } from "@/lib/server/session";
import {
  createModulo,
  findAllModulos,
} from "@/modules/permisos/server/admin-catalog-service";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const activo = parseOptionalBool(
      new URL(request.url).searchParams.get("activo"),
    );
    return jsonOk(await findAllModulos(activo));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await parseJsonBody<{ nombre: string; activo?: boolean }>(
      request,
    );
    return jsonOk(await createModulo(body), 201);
  } catch (error) {
    return jsonError(error);
  }
}
