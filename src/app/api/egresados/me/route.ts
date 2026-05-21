import { CategoriaUsuarioExterno } from "@/generated/prisma/client";
import { ApiError, jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody } from "@/lib/server/route-helpers";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import {
  createEgresadoMine,
  findEgresadoMe,
  updateEgresadoMine,
} from "@/modules/egresados/server/egresados-service";
import { assertPermission } from "@/modules/shared/server/authorization";
import type {
  CreateEgresadoDto,
  UpdateEgresadoDto,
} from "@/modules/shared/types/api-models";

export async function GET() {
  try {
    const user = await requireSessionUsuario();
    const profile = toAuthProfile(user);
    if (profile.categoria !== CategoriaUsuarioExterno.EGRESADO) {
      await assertPermission(user, "Egresados", "CONSULTA");
    }
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

export async function POST(request: Request) {
  try {
    const user = await requireSessionUsuario();
    const profile = toAuthProfile(user);
    const body = await parseJsonBody<CreateEgresadoDto>(request);
    return jsonOk(await createEgresadoMine(profile, body), 201);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUsuario();
    const profile = toAuthProfile(user);
    const body = await parseJsonBody<UpdateEgresadoDto>(request);
    return jsonOk(await updateEgresadoMine(profile, body));
  } catch (error) {
    return jsonError(error);
  }
}
