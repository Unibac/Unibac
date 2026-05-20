import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseJsonBody } from "@/lib/server/route-helpers";
import { requireSessionUsuario, toAuthProfile } from "@/lib/server/session";
import {
  getEmpresaMine,
  updateEmpresaMine,
} from "@/modules/empresa/server/empresa-service";

export async function GET() {
  try {
    const user = await requireSessionUsuario();
    return jsonOk(await getEmpresaMine(toAuthProfile(user)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUsuario();
    const body =
      await parseJsonBody<Parameters<typeof updateEmpresaMine>[1]>(request);
    return jsonOk(await updateEmpresaMine(toAuthProfile(user), body));
  } catch (error) {
    return jsonError(error);
  }
}
