import { jsonError, jsonOk } from "@/lib/server/api-error";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import { findMisPostulaciones } from "@/modules/convocatorias-emprendimiento/server/convocatorias-service";

export async function GET() {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Emprendimiento", "CONSULTA");
    return jsonOk(await findMisPostulaciones(user.id, toAuthProfile(user)));
  } catch (error) {
    return jsonError(error);
  }
}
