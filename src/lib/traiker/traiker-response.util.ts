/**
 * Helpers para interpretar el envelope Traiker (st / ms / data) según
 * docs/integracion-api.md y tolerar variantes reales de la API.
 */

export type TraikerJson = Record<string, unknown>;

const UPLOAD_URL_KEYS = [
  "uploadUrl",
  "upload_url",
  "uploadURL",
  "signedUrl",
  "signed_url",
] as const;

const FILE_URL_KEYS = ["url", "URL"] as const;

const TRAIKER_OBJECT_ID_PATTERN = /[a-fA-F0-9]{24}/;

const PRIMARY_ARCHIVO_ID_KEYS = ["id", "_id"] as const;
const SECONDARY_ARCHIVO_ID_KEYS = [
  "archivoId",
  "archivo_id",
  "fileId",
  "file_id",
] as const;

export function asTraikerRecord(value: unknown): TraikerJson | undefined {
  if (value === null || value === undefined || typeof value !== "object") {
    return undefined;
  }
  if (Array.isArray(value)) {
    return undefined;
  }
  return value as TraikerJson;
}

/** Éxito Traiker: st "0.0", "0.2", numérico 0.x, o "0" según documentación. */
export function isTraikerSuccessSt(st: unknown): boolean {
  if (st === undefined || st === null) {
    return false;
  }
  const normalized = String(st).trim();
  if (normalized === "0") {
    return true;
  }
  return /^0\./.test(normalized);
}

export function getTraikerData(envelope: TraikerJson): TraikerJson | undefined {
  return asTraikerRecord(envelope.data);
}

/** Capas donde buscar campos (raíz, data, hijos directos de data). */
export function collectTraikerSearchLayers(
  envelope: TraikerJson,
): TraikerJson[] {
  const layers: TraikerJson[] = [envelope];
  const data = getTraikerData(envelope);
  if (data) {
    layers.push(data);
    for (const value of Object.values(data)) {
      const nested = asTraikerRecord(value);
      if (nested) {
        layers.push(nested);
      }
    }
  }
  return layers;
}

export function describeTraikerKeysForLog(envelope: TraikerJson): string {
  const parts = [`root=[${Object.keys(envelope).join(",")}]`];
  const data = getTraikerData(envelope);
  if (data) {
    parts.push(`data=[${Object.keys(data).join(",")}]`);
  }
  return parts.join(" ");
}

export function readStringField(
  source: TraikerJson | undefined,
  ...keys: string[]
): string | undefined {
  if (!source) {
    return undefined;
  }
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

function readHttpUrlField(
  source: TraikerJson | undefined,
  ...keys: string[]
): string | undefined {
  const raw = readStringField(source, ...keys);
  if (!raw) {
    return undefined;
  }
  return /^https?:\/\//i.test(raw) ? raw : undefined;
}

/** ObjectId Mongo (24 hex) según OpenAPI Traiker. */
export function normalizeTraikerObjectId(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (/^[a-fA-F0-9]{24}$/.test(trimmed)) {
    return trimmed;
  }
  const match = TRAIKER_OBJECT_ID_PATTERN.exec(trimmed);
  return match?.[0];
}

export function extractObjectIdFromPath(path: string): string | undefined {
  const match = TRAIKER_OBJECT_ID_PATTERN.exec(path);
  return match?.[0];
}

function readArchivoIdCandidate(
  source: TraikerJson | undefined,
  ...keys: string[]
): string | undefined {
  if (!source) {
    return undefined;
  }
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(Math.trunc(value));
    }
    const nested = asTraikerRecord(value);
    if (nested) {
      const oid = readStringField(nested, "$oid", "oid");
      if (oid) {
        return oid;
      }
    }
  }
  return undefined;
}

/**
 * Resuelve el id de archivo para confirmar / upload-status.
 * Prioriza id/_id, luego archivoId, y por último el ObjectId embebido en rutas GCS.
 */
export function extractTraikerArchivoId(
  envelope: TraikerJson,
  hints?: { uploadUrl?: string; nombreGcs?: string },
): string | undefined {
  const candidates: string[] = [];
  const layers = collectTraikerSearchLayers(envelope);

  for (const layer of layers) {
    const primary = readArchivoIdCandidate(layer, ...PRIMARY_ARCHIVO_ID_KEYS);
    if (primary) {
      candidates.push(primary);
    }
  }
  for (const layer of layers) {
    const secondary = readArchivoIdCandidate(
      layer,
      ...SECONDARY_ARCHIVO_ID_KEYS,
    );
    if (secondary) {
      candidates.push(secondary);
    }
  }
  if (hints?.nombreGcs) {
    candidates.push(hints.nombreGcs);
  }
  if (hints?.uploadUrl) {
    candidates.push(hints.uploadUrl);
  }

  for (const candidate of candidates) {
    const normalized = normalizeTraikerObjectId(candidate);
    if (normalized) {
      return normalized;
    }
  }
  return undefined;
}

export function buildTraikerConfirmarBody(archivoId: string): TraikerJson {
  return { id: archivoId, archivoId };
}

/** Body real de POST /archivos/upload-status (arreglo archivoIds). */
export function buildTraikerUploadStatusBody(archivoId: string): TraikerJson {
  return { archivoIds: [archivoId] };
}

export function extractFileUrlFromEnvelope(
  envelope: TraikerJson,
): string | undefined {
  for (const layer of collectTraikerSearchLayers(envelope)) {
    const url = extractFileUrl(layer);
    if (url) {
      return url;
    }
  }
  return undefined;
}

/** Confirmación aceptada sin URL en body (p. ej. HTTP 202 + ms "Upload confirmado"). */
export function isTraikerConfirmAccepted(
  res: Response,
  envelope: TraikerJson,
): boolean {
  if (!res.ok) {
    return false;
  }
  if (extractFileUrlFromEnvelope(envelope)) {
    return true;
  }
  const ms = readStringField(envelope, "ms", "message");
  if (ms && /confirmado|guardado/i.test(ms)) {
    return true;
  }
  const st = envelope.st;
  return st === undefined || st === null || isTraikerSuccessSt(st);
}

export function extractAccessToken(envelope: TraikerJson): string | undefined {
  for (const layer of collectTraikerSearchLayers(envelope)) {
    const token = readStringField(layer, "access_token", "accessToken");
    if (token) {
      return token;
    }
  }
  return undefined;
}

export function extractRefreshToken(envelope: TraikerJson): string | undefined {
  for (const layer of collectTraikerSearchLayers(envelope)) {
    const token = readStringField(layer, "refresh_token", "refreshToken");
    if (token) {
      return token;
    }
  }
  return undefined;
}

export function extractUploadToken(envelope: TraikerJson): string | undefined {
  for (const layer of collectTraikerSearchLayers(envelope)) {
    const token = readStringField(layer, "uploadToken", "upload_token");
    if (token) {
      return token;
    }
  }
  return undefined;
}

export function extractSignedUrlFields(envelope: TraikerJson):
  | {
      id: string;
      uploadUrl: string;
      contentType?: string;
      earlyFileUrl?: string;
    }
  | undefined {
  let uploadUrl: string | undefined;
  let contentType: string | undefined;
  let nombreGcs: string | undefined;
  let earlyFileUrl: string | undefined;

  for (const layer of collectTraikerSearchLayers(envelope)) {
    if (!uploadUrl) {
      uploadUrl =
        readHttpUrlField(layer, ...UPLOAD_URL_KEYS) ??
        readHttpUrlField(layer, ...FILE_URL_KEYS);
    }
    if (!contentType) {
      contentType = readStringField(
        layer,
        "contentType",
        "content_type",
        "tipo",
        "mimeType",
        "mime_type",
      );
    }
    if (!nombreGcs) {
      nombreGcs = readStringField(layer, "nombreGCS", "nombre_gcs", "loc");
    }
    if (!earlyFileUrl) {
      earlyFileUrl = readHttpUrlField(layer, ...FILE_URL_KEYS);
    }
  }

  if (!uploadUrl) {
    return undefined;
  }

  const id = extractTraikerArchivoId(envelope, { uploadUrl, nombreGcs });
  if (!id) {
    return undefined;
  }

  return {
    id,
    uploadUrl,
    contentType,
    earlyFileUrl: earlyFileUrl !== uploadUrl ? earlyFileUrl : undefined,
  };
}

export function extractFileUrl(data: TraikerJson): string | undefined {
  return (
    readHttpUrlField(data, ...FILE_URL_KEYS) ??
    readStringField(data, ...FILE_URL_KEYS)
  );
}

/** Rate limit u otros errores sin envelope st/ms (OpenAPI). */
export function isTraikerRateLimitBody(body: TraikerJson): boolean {
  return (
    typeof body.error === "string" &&
    typeof body.message === "string" &&
    body.st === undefined
  );
}

export function traikerErrorMessage(
  body: TraikerJson | undefined,
  fallback: string,
): string {
  if (!body) {
    return fallback;
  }
  if (isTraikerRateLimitBody(body)) {
    return String(body.message);
  }
  const ms = readStringField(body, "ms", "message");
  if (ms) {
    return ms;
  }
  return fallback;
}

function hasTraikerPayload(body: TraikerJson): boolean {
  if (getTraikerData(body)) {
    return true;
  }
  return collectTraikerSearchLayers(body).some(
    (layer) =>
      Boolean(
        readArchivoIdCandidate(
          layer,
          ...PRIMARY_ARCHIVO_ID_KEYS,
          ...SECONDARY_ARCHIVO_ID_KEYS,
        ),
      ) ||
      Boolean(readStringField(layer, "access_token", "accessToken")) ||
      Boolean(readStringField(layer, "uploadToken", "upload_token")),
  );
}

export function assertTraikerEnvelopeSuccess(
  res: Response,
  json: unknown,
  options: {
    fallback: string;
    requireData?: boolean;
  },
): TraikerJson {
  const body = asTraikerRecord(json);
  if (!body) {
    throw new TraikerResponseError(
      "Respuesta inválida del servicio de archivos.",
    );
  }
  if (!res.ok) {
    throw new TraikerResponseError(traikerErrorMessage(body, options.fallback));
  }
  if (isTraikerRateLimitBody(body)) {
    throw new TraikerResponseError(traikerErrorMessage(body, options.fallback));
  }
  const st = body.st;
  if (st !== undefined && st !== null && !isTraikerSuccessSt(st)) {
    throw new TraikerResponseError(traikerErrorMessage(body, options.fallback));
  }
  if (options.requireData && !hasTraikerPayload(body)) {
    throw new TraikerResponseError(traikerErrorMessage(body, options.fallback));
  }
  return body;
}

export class TraikerResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TraikerResponseError";
  }
}
