import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody } from "@/lib/server/route-helpers";
import { requireAdmin } from "@/lib/server/session";
import {
  createUsuario,
  findAllUsuarios,
} from "@/modules/usuarios/server/usuarios-service";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(await findAllUsuarios());
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body =
      await parseJsonBody<Parameters<typeof createUsuario>[0]>(request);
    return jsonOk(await createUsuario(body), 201);
  } catch (error) {
    return jsonError(error);
  }
}
