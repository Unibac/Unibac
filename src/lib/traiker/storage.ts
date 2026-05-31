import { randomUUID } from "node:crypto";

import { ApiError } from "@/lib/server/api-error";
import {
  assertTraikerEnvelopeSuccess,
  asTraikerRecord,
  buildTraikerConfirmarBody,
  buildTraikerUploadStatusBody,
  extractAccessToken,
  extractFileUrlFromEnvelope,
  extractRefreshToken,
  extractSignedUrlFields,
  extractUploadToken,
  isTraikerConfirmAccepted,
  type TraikerJson,
  TraikerResponseError,
  traikerErrorMessage,
} from "./traiker-response.util";

const MIME_TO_EXT = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const MAX_BYTES = 3 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 30_000;
const GCS_PUT_TIMEOUT_MS = 90_000;
const ACCESS_TOKEN_SKEW_SEC = 300;

const TRAIKER_LOGIN_FAIL =
  "Credenciales Traiker rechazadas o servicio no disponible.";

function decodeJwtExpSec(token: string): number | undefined {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return undefined;
    }
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : undefined;
  } catch {
    return undefined;
  }
}

function toServiceUnavailable(error: unknown, fallback: string): never {
  if (error instanceof ApiError) throw error;
  if (error instanceof TraikerResponseError) {
    throw new ApiError(503, error.message);
  }
  throw new ApiError(503, fallback);
}

class TraikerSessionExpiredError extends Error {
  constructor() {
    super("Traiker session expired");
    this.name = "TraikerSessionExpiredError";
  }
}

class TraikerStorage {
  private readonly apiBase: string | undefined;
  private readonly usr: string | undefined;
  private readonly psw: string | undefined;
  private readonly configured: boolean;

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private authInflight: Promise<void> | null = null;

  constructor() {
    this.apiBase = this.normalizeApiBase(process.env.TRAIKER_API_BASE_URL);
    this.usr = process.env.TRAIKER_USR?.trim();
    this.psw = process.env.TRAIKER_PSW?.trim();
    this.configured = Boolean(this.apiBase && this.usr && this.psw);
  }

  isConfigured(): boolean {
    return this.configured;
  }

  private normalizeApiBase(raw: string | undefined): string | undefined {
    if (raw === undefined) {
      return undefined;
    }
    const t = raw.trim();
    if (t === "") {
      return undefined;
    }
    return t.replace(/\/$/, "");
  }

  private assertTraikerConfigured(): void {
    if (!this.configured || !this.apiBase || !this.usr || !this.psw) {
      throw new ApiError(
        503,
        "El servicio de imágenes no está configurado. Defina TRAIKER_API_BASE_URL, TRAIKER_USR y TRAIKER_PSW.",
      );
    }
  }

  private isAccessTokenExpiredOrNear(): boolean {
    if (!this.accessToken) {
      return true;
    }
    const exp = decodeJwtExpSec(this.accessToken);
    if (exp === undefined) {
      return false;
    }
    const now = Math.floor(Date.now() / 1000);
    return exp - now <= ACCESS_TOKEN_SKEW_SEC;
  }

  private invalidateSession(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }

  private async ensureAccessToken(): Promise<string> {
    this.assertTraikerConfigured();
    if (this.accessToken && !this.isAccessTokenExpiredOrNear()) {
      return this.accessToken;
    }
    if (!this.authInflight) {
      this.authInflight = this.refreshOrLogin().finally(() => {
        this.authInflight = null;
      });
    }
    await this.authInflight;
    if (!this.accessToken) {
      throw new ApiError(503, "No se pudo obtener token de acceso Traiker.");
    }
    return this.accessToken;
  }

  private async refreshOrLogin(): Promise<void> {
    if (this.refreshToken) {
      try {
        const url = `${this.apiBase}/usuarios/refresh/`;
        const res = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${this.refreshToken}` },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        const json = await this.parseJsonBody(res);
        const body = assertTraikerEnvelopeSuccess(res, json, {
          fallback: "No se pudo refrescar el token Traiker.",
        });
        const accessToken = extractAccessToken(body);
        if (accessToken) {
          this.accessToken = accessToken;
          const refreshedRefresh = extractRefreshToken(body);
          if (refreshedRefresh) {
            this.refreshToken = refreshedRefresh;
          }
          return;
        }
      } catch {
        // refresh falló; continuar con login
      }
    }
    await this.login();
  }

  private async login(): Promise<void> {
    const url = `${this.apiBase}/usuarios/`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usr: this.usr, psw: this.psw }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const json = await this.parseJsonBody(res);
    try {
      const body = assertTraikerEnvelopeSuccess(res, json, {
        fallback: TRAIKER_LOGIN_FAIL,
      });
      const accessToken = extractAccessToken(body);
      if (!accessToken) {
        throw new ApiError(503, traikerErrorMessage(body, TRAIKER_LOGIN_FAIL));
      }
      this.accessToken = accessToken;
      this.refreshToken = extractRefreshToken(body) ?? null;
    } catch (e) {
      toServiceUnavailable(e, TRAIKER_LOGIN_FAIL);
    }
  }

  private async parseJsonBody(res: Response): Promise<unknown> {
    const text = await res.text();
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new ApiError(503, "Respuesta inválida del servicio de archivos.");
    }
  }

  private traikerFailure(json: unknown, fallback: string): never {
    const body =
      json !== null && typeof json === "object" && !Array.isArray(json)
        ? (json as TraikerJson)
        : undefined;
    throw new ApiError(503, traikerErrorMessage(body, fallback));
  }

  private async requestUploadToken(accessToken: string): Promise<string> {
    const url = `${this.apiBase}/archivos/upload-token`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const json = await this.parseJsonBody(res);
    if (res.status === 401) {
      this.invalidateSession();
      throw new TraikerSessionExpiredError();
    }
    try {
      const body = assertTraikerEnvelopeSuccess(res, json, {
        fallback: "No se pudo obtener token de subida Traiker.",
        requireData: true,
      });
      const uploadToken = extractUploadToken(body);
      if (!uploadToken) {
        this.traikerFailure(
          json,
          "No se pudo obtener token de subida Traiker.",
        );
      }
      return uploadToken;
    } catch (e) {
      toServiceUnavailable(e, "No se pudo obtener token de subida Traiker.");
    }
  }

  private async requestSignedUrl(
    uploadToken: string,
    body: {
      nombre: string;
      tipo: string;
      peso: number;
      public: boolean;
    },
  ): Promise<{
    id: string;
    uploadUrl: string;
    contentType?: string;
    earlyFileUrl?: string;
  }> {
    const url = `${this.apiBase}/archivos/upload-url`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${uploadToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const json = await this.parseJsonBody(res);
    if (res.status === 401) {
      this.invalidateSession();
      throw new TraikerSessionExpiredError();
    }
    try {
      const envelope = assertTraikerEnvelopeSuccess(res, json, {
        fallback: "No se pudo solicitar URL firmada Traiker.",
      });
      const signed = extractSignedUrlFields(envelope);
      if (!signed) {
        this.traikerFailure(json, "No se pudo solicitar URL firmada Traiker.");
      }
      return signed;
    } catch (e) {
      toServiceUnavailable(e, "No se pudo solicitar URL firmada Traiker.");
    }
  }

  private async putToSignedUrl(
    uploadUrl: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body: new Uint8Array(buffer),
      headers: { "Content-Type": contentType },
      signal: AbortSignal.timeout(GCS_PUT_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new ApiError(503, "No se pudo completar la subida del archivo.");
    }
  }

  private async notifyUploadStatus(
    uploadToken: string,
    archivoId: string,
  ): Promise<void> {
    const url = `${this.apiBase}/archivos/upload-status`;
    try {
      await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${uploadToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildTraikerUploadStatusBody(archivoId)),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch {
      // no bloquea el flujo principal
    }
  }

  private async fetchArchivoUrlById(
    accessToken: string,
    archivoId: string,
  ): Promise<string> {
    const url = `${this.apiBase}/archivos/${archivoId}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const json = await this.parseJsonBody(res);
    if (res.status === 401) {
      this.invalidateSession();
      throw new TraikerSessionExpiredError();
    }
    const envelope = assertTraikerEnvelopeSuccess(res, json, {
      fallback: "No se pudo obtener la URL del archivo en Traiker.",
    });
    const fileUrl = extractFileUrlFromEnvelope(envelope);
    if (!fileUrl) {
      throw new ApiError(
        503,
        traikerErrorMessage(
          envelope,
          "No se pudo obtener la URL del archivo en Traiker.",
        ),
      );
    }
    return fileUrl;
  }

  private async confirmarUpload(
    accessToken: string,
    uploadToken: string,
    archivoId: string,
    fallbacks: { earlyFileUrl?: string },
  ): Promise<string> {
    const url = `${this.apiBase}/archivos/confirmar`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${uploadToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildTraikerConfirmarBody(archivoId)),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const json = await this.parseJsonBody(res);
    if (res.status === 401) {
      this.invalidateSession();
      throw new TraikerSessionExpiredError();
    }
    const envelope = asTraikerRecord(json);
    if (!envelope) {
      throw new ApiError(503, "Respuesta inválida del servicio de archivos.");
    }
    if (!isTraikerConfirmAccepted(res, envelope)) {
      this.traikerFailure(json, "No se pudo confirmar el archivo en Traiker.");
    }

    const fileUrl = extractFileUrlFromEnvelope(envelope);
    if (fileUrl) {
      return fileUrl;
    }

    if (fallbacks.earlyFileUrl) {
      return fallbacks.earlyFileUrl;
    }

    return this.fetchArchivoUrlById(accessToken, archivoId);
  }

  private validateImageBuffer(buffer: Buffer, mimeType: string): string {
    if (buffer.length > MAX_BYTES) {
      throw new ApiError(
        400,
        `La imagen supera el tamaño máximo permitido (${MAX_BYTES} bytes).`,
      );
    }
    const ext = MIME_TO_EXT.get(mimeType);
    if (!ext) {
      throw new ApiError(
        400,
        "Tipo de imagen no permitido. Use JPEG, PNG o WebP.",
      );
    }
    return ext;
  }

  private async uploadViaTraiker(params: {
    buffer: Buffer;
    mimeType: string;
    nombre: string;
  }): Promise<string> {
    this.assertTraikerConfigured();
    const ext = this.validateImageBuffer(params.buffer, params.mimeType);
    const nombre =
      params.nombre.endsWith(`.${ext}`) || params.nombre.includes(".")
        ? params.nombre
        : `${params.nombre}.${ext}`;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const access = await this.ensureAccessToken();
        const uploadToken = await this.requestUploadToken(access);
        const signed = await this.requestSignedUrl(uploadToken, {
          nombre,
          tipo: params.mimeType,
          peso: params.buffer.length,
          public: true,
        });
        const contentType = signed.contentType ?? params.mimeType;
        await this.putToSignedUrl(signed.uploadUrl, params.buffer, contentType);
        await this.notifyUploadStatus(uploadToken, signed.id);
        return await this.confirmarUpload(access, uploadToken, signed.id, {
          earlyFileUrl: signed.earlyFileUrl,
        });
      } catch (e) {
        if (e instanceof TraikerSessionExpiredError && attempt === 0) {
          this.invalidateSession();
          continue;
        }
        throw e;
      }
    }
    throw new ApiError(503, "No se pudo subir el archivo tras reintento.");
  }

  async uploadDirectorioImagen(params: {
    buffer: Buffer;
    mimeType: string;
    usuarioId: number;
  }): Promise<string> {
    const nombre = `directorio-${params.usuarioId}-${randomUUID()}`;
    return this.uploadViaTraiker({
      buffer: params.buffer,
      mimeType: params.mimeType,
      nombre,
    });
  }

  async uploadFeriaBanner(params: {
    buffer: Buffer;
    mimeType: string;
  }): Promise<string> {
    const nombre = `feria-banner-${randomUUID()}`;
    return this.uploadViaTraiker({
      buffer: params.buffer,
      mimeType: params.mimeType,
      nombre,
    });
  }

  async uploadPropuestaFeriaImagen(params: {
    buffer: Buffer;
    mimeType: string;
    usuarioId: number;
  }): Promise<string> {
    const nombre = `feria-propuesta-${params.usuarioId}-${randomUUID()}`;
    return this.uploadViaTraiker({
      buffer: params.buffer,
      mimeType: params.mimeType,
      nombre,
    });
  }
}

export const traikerStorage = new TraikerStorage();
