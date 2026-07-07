import { ApiError } from "@/lib/server/api-error";

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, "Cuerpo JSON inválido");
  }
}

export function parseIdParam(param: string | undefined, label = "ID"): number {
  const id = Number(param);
  if (!Number.isFinite(id) || id <= 0) {
    throw new ApiError(400, `${label} inválido`);
  }
  return id;
}

export function parseOptionalBool(value: string | null): boolean | undefined {
  if (value === null || value === "") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

const UPLOAD_MIME_TO_EXT = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const UPLOAD_MAX_BYTES = 3 * 1024 * 1024;
const SETUP_IMPORT_MAX_BYTES = 10 * 1024 * 1024;

/** Lee campo `archivo` de multipart/form-data para subidas Traiker. */
export async function parseMultipartArchivo(request: Request): Promise<{
  buffer: Buffer;
  mimeType: string;
}> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    throw new ApiError(400, "Cuerpo multipart inválido");
  }

  const raw = formData.get("archivo");
  if (!(raw instanceof File)) {
    throw new ApiError(400, "Se requiere el campo archivo con una imagen");
  }

  const mimeType = raw.type || "application/octet-stream";
  if (!UPLOAD_MIME_TO_EXT.has(mimeType)) {
    throw new ApiError(
      400,
      "Tipo de imagen no permitido. Use JPEG, PNG o WebP.",
    );
  }

  const buffer = Buffer.from(await raw.arrayBuffer());
  if (buffer.length === 0) {
    throw new ApiError(400, "El archivo está vacío");
  }
  if (buffer.length > UPLOAD_MAX_BYTES) {
    throw new ApiError(
      400,
      `La imagen supera el tamaño máximo permitido (${UPLOAD_MAX_BYTES} bytes).`,
    );
  }

  return { buffer, mimeType };
}

/** Lee campo `archivo` y `dryRun` de multipart para importación Excel de setup. */
export async function parseMultipartSetupImport(request: Request): Promise<{
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  dryRun: boolean;
}> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    throw new ApiError(400, "Cuerpo multipart inválido");
  }

  const raw = formData.get("archivo");
  if (!(raw instanceof File)) {
    throw new ApiError(400, "Se requiere el campo archivo con un Excel");
  }

  const dryRunRaw = formData.get("dryRun");
  const dryRun =
    dryRunRaw === "true" || dryRunRaw === "1" || dryRunRaw === "yes";

  const mimeType = raw.type || "application/octet-stream";
  const fileName = raw.name || "import.xlsx";
  const buffer = Buffer.from(await raw.arrayBuffer());

  if (buffer.length === 0) {
    throw new ApiError(400, "El archivo está vacío");
  }
  if (buffer.length > SETUP_IMPORT_MAX_BYTES) {
    throw new ApiError(
      400,
      `El archivo supera el tamaño máximo permitido (${SETUP_IMPORT_MAX_BYTES} bytes).`,
    );
  }

  return { buffer, mimeType, fileName, dryRun };
}
