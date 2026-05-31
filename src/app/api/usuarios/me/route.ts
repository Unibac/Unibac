import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody } from "@/lib/server/route-helpers";
import { requireSessionUsuario } from "@/lib/server/session";
import {
  findMeUsuario,
  updateMeUsuario,
} from "@/modules/usuarios/server/usuarios-service";

export async function GET() {
  try {
    const user = await requireSessionUsuario();
    return jsonOk(await findMeUsuario(user.id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUsuario();
    const body = await parseJsonBody<{
      descripcion?: string;
      correo?: string;
      celular?: string;
    }>(request);
    return jsonOk(await updateMeUsuario(user.id, body));
  } catch (error) {
    return jsonError(error);
  }
}
