import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody } from "@/lib/server/route-helpers";
import { isAdmin, requireSessionUsuario } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import {
  createDirectorio,
  findAllDirectorio,
} from "@/modules/directorio-emprendimientos/server/directorio-service";

export async function GET() {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Emprendimiento", "CONSULTA");
    return jsonOk(await findAllDirectorio(user.id, isAdmin(user)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Emprendimiento", "CREACION");
    const body =
      await parseJsonBody<Parameters<typeof createDirectorio>[0]>(request);
    return jsonOk(await createDirectorio(body, user.id), 201);
  } catch (error) {
    return jsonError(error);
  }
}
