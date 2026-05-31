import { jsonError, jsonOk } from "@/lib/server/api-error";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import { findMisPropuestas } from "@/modules/ferias/server/ferias-service";

export async function GET() {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Ferias", "CONSULTA");
    return jsonOk(await findMisPropuestas(toAuthProfile(user)));
  } catch (error) {
    return jsonError(error);
  }
}
