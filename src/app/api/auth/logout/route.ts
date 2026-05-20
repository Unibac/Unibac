import { jsonError, jsonOk } from "@/lib/server/api-error";
import { logoutSession } from "@/modules/auth/server/auth-service";

export async function POST() {
  try {
    const result = await logoutSession();
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
