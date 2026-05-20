import { jsonError, jsonOk } from "@/lib/server/api-error";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";

export async function GET() {
  try {
    const user = await requireSessionUsuario();
    return jsonOk(toAuthProfile(user));
  } catch (error) {
    return jsonError(error);
  }
}
