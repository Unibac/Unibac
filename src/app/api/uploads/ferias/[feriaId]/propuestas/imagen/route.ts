import { ApiError, jsonError, jsonOk } from "@/lib/server/api-error";
import {
  parseIdParam,
  parseMultipartArchivo,
} from "@/lib/server/route-helpers";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import { traikerStorage } from "@/lib/traiker/storage";
import { findFeriaParaUploadPropuesta } from "@/modules/ferias/server/ferias-service";
import { assertPermission } from "@/modules/shared/server/authorization";

type RouteContext = { params: Promise<{ feriaId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Ferias", "PROPUESTA");
    const profile = toAuthProfile(user);
    const { feriaId } = await context.params;
    const id = parseIdParam(feriaId, "feriaId");
    await findFeriaParaUploadPropuesta(id, profile);

    if (!traikerStorage.isConfigured()) {
      throw new ApiError(
        503,
        "El servicio de imágenes no está configurado. Defina TRAIKER_API_BASE_URL, TRAIKER_USR y TRAIKER_PSW.",
      );
    }

    const { buffer, mimeType } = await parseMultipartArchivo(request);
    const imagenUrl = await traikerStorage.uploadPropuestaFeriaImagen({
      buffer,
      mimeType,
      usuarioId: user.id,
    });
    return jsonOk({ imagenUrl });
  } catch (error) {
    return jsonError(error);
  }
}
