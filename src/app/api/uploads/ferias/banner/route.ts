import { ApiError, jsonError, jsonOk } from "@/lib/server/api-error";
import { parseMultipartArchivo } from "@/lib/server/route-helpers";
import { requireSessionUsuario } from "@/lib/server/session";
import { traikerStorage } from "@/lib/traiker/storage";
import { assertPermission } from "@/modules/shared/server/authorization";

export async function POST(request: Request) {
  try {
    const user = await requireSessionUsuario();
    await assertPermission(user, "Ferias", "CREACION");

    if (!traikerStorage.isConfigured()) {
      throw new ApiError(
        503,
        "El servicio de imágenes no está configurado. Defina TRAIKER_API_BASE_URL, TRAIKER_USR y TRAIKER_PSW.",
      );
    }

    const { buffer, mimeType } = await parseMultipartArchivo(request);
    const imagenBannerUrl = await traikerStorage.uploadFeriaBanner({
      buffer,
      mimeType,
    });
    return jsonOk({ imagenBannerUrl });
  } catch (error) {
    return jsonError(error);
  }
}
