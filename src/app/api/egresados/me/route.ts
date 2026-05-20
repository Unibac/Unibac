import { ApiError, jsonError, jsonOk } from "@/lib/server/api-error";
import { requireSessionUsuario } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import { findEgresadoMe } from "@/modules/egresados/server/egresados-service";

export async function GET() {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Egresados", "CONSULTA");
    const row = await findEgresadoMe(user.id);
    if (!row) {
      throw new ApiError(
        404,
        "No hay registro de egresado asociado a esta cuenta",
      );
    }
    return jsonOk(row);
  } catch (error) {
    return jsonError(error);
  }
}
