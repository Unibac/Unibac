import { jsonError, jsonOk } from "@/lib/server/api-error";
import { registerPublicUser } from "@/modules/auth/server/auth-service";
import type { RegisterPublicInput } from "@/modules/auth/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterPublicInput;
    const user = await registerPublicUser(body);
    return jsonOk(user, 201);
  } catch (error) {
    return jsonError(error);
  }
}
