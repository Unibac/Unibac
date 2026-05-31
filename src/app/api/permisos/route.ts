import { ApiError, jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody } from "@/lib/server/route-helpers";
import { requireAdmin } from "@/lib/server/session";
import {
  createRolPermiso,
  findAllPermisos,
} from "@/modules/permisos/server/admin-catalog-service";

function parseOptionalUsuarioId(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const id = Number(value);
  if (!Number.isFinite(id) || id <= 0) {
    throw new ApiError(400, "usuarioId debe ser un número entero");
  }
  return id;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const usuarioId = parseOptionalUsuarioId(
      new URL(request.url).searchParams.get("usuarioId"),
    );
    return jsonOk(await findAllPermisos(usuarioId));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await parseJsonBody<{
      rolId: number;
      moduloId: number;
      accionId: number;
    }>(request);
    return jsonOk(await createRolPermiso(body), 201);
  } catch (error) {
    return jsonError(error);
  }
}
