import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody } from "@/lib/server/route-helpers";
import { isAdmin, requireSessionUsuario } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import {
  createTalento,
  findAllTalento,
} from "@/modules/talento-perfiles/server/talento-service";

export async function GET() {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Talento", "CONSULTA");
    return jsonOk(await findAllTalento(user.id, isAdmin(user)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Talento", "CREACION");
    const body =
      await parseJsonBody<Parameters<typeof createTalento>[0]>(request);
    return jsonOk(await createTalento(body, user.id), 201);
  } catch (error) {
    return jsonError(error);
  }
}
