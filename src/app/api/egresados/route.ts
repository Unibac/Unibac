import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody } from "@/lib/server/route-helpers";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import { assertPermission } from "@/modules/shared/server/authorization";
import {
  createEgresado,
  findAllEgresados,
} from "@/modules/egresados/server/egresados-service";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Egresados", "CONSULTA");
    const params = new URL(request.url).searchParams;
    const anioRaw = params.get("anioEgreso");
    const query = {
      nombre: params.get("nombre") ?? undefined,
      anioEgreso:
        anioRaw !== null && anioRaw !== "" ? Number(anioRaw) : undefined,
      programaCarrera: params.get("programaCarrera") ?? undefined,
      estadoLaboral: params.get("estadoLaboral") ?? undefined,
    };
    return jsonOk(await findAllEgresados(query));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Egresados", "CREACION");
    const body =
      await parseJsonBody<Parameters<typeof createEgresado>[0]>(request);
    return jsonOk(await createEgresado(body, user.id), 201);
  } catch (error) {
    return jsonError(error);
  }
}
