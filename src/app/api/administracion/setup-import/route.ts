import { jsonError, jsonOk } from "@/lib/server/api-error";
import { parseMultipartSetupImport } from "@/lib/server/route-helpers";
import { requireAdmin } from "@/lib/server/session";
import {
  assertSetupImportMime,
  processSetupImport,
} from "@/modules/administracion/server/setup-import-service";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { buffer, mimeType, fileName, dryRun } =
      await parseMultipartSetupImport(request);
    assertSetupImportMime(mimeType, fileName);
    return jsonOk(await processSetupImport(buffer, dryRun));
  } catch (error) {
    return jsonError(error);
  }
}
