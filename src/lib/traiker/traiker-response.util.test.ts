import { describe, expect, it } from "vitest";

import {
  asTraikerRecord,
  buildTraikerConfirmarBody,
  buildTraikerUploadStatusBody,
  extractAccessToken,
  extractFileUrlFromEnvelope,
  extractObjectIdFromPath,
  extractRefreshToken,
  extractSignedUrlFields,
  extractTraikerArchivoId,
  extractUploadToken,
  isTraikerConfirmAccepted,
  isTraikerRateLimitBody,
  isTraikerSuccessSt,
  normalizeTraikerObjectId,
  traikerErrorMessage,
} from "./traiker-response.util";

describe("traiker-response.util", () => {
  describe("isTraikerSuccessSt", () => {
    it("acepta códigos documentados", () => {
      expect(isTraikerSuccessSt("0.0")).toBe(true);
      expect(isTraikerSuccessSt("0.2")).toBe(true);
      expect(isTraikerSuccessSt(0.2)).toBe(true);
      expect(isTraikerSuccessSt("0")).toBe(true);
    });

    it("rechaza errores", () => {
      expect(isTraikerSuccessSt("1.0")).toBe(false);
      expect(isTraikerSuccessSt("2.0")).toBe(false);
      expect(isTraikerSuccessSt(undefined)).toBe(false);
    });
  });

  describe("extractAccessToken", () => {
    it("lee access_token en data", () => {
      const token = extractAccessToken({
        st: "0.2",
        data: { access_token: "abc", refresh_token: "ref" },
      });
      expect(token).toBe("abc");
    });

    it("lee accessToken camelCase en data", () => {
      const token = extractAccessToken({
        st: "0.2",
        data: { accessToken: "xyz" },
      });
      expect(token).toBe("xyz");
    });

    it("lee access_token en raíz si falta data", () => {
      const token = extractAccessToken({
        st: "0.2",
        access_token: "root",
      });
      expect(token).toBe("root");
    });
  });

  describe("extractUploadToken", () => {
    it("lee uploadToken en data", () => {
      expect(
        extractUploadToken({
          st: "0.0",
          data: { uploadToken: "up" },
        }),
      ).toBe("up");
    });
  });

  describe("extractSignedUrlFields", () => {
    it("lee id y uploadUrl en data (documentación)", () => {
      expect(
        extractSignedUrlFields({
          st: "0.0",
          data: {
            id: "507f1f77bcf86cd799439099",
            uploadUrl: "https://storage.googleapis.com/bucket/x",
            contentType: "image/png",
          },
        }),
      ).toEqual({
        id: "507f1f77bcf86cd799439099",
        uploadUrl: "https://storage.googleapis.com/bucket/x",
        contentType: "image/png",
      });
    });

    it("lee en raíz sin st ni wrapper data", () => {
      expect(
        extractSignedUrlFields({
          id: "507f1f77bcf86cd799439099",
          upload_url: "https://storage.googleapis.com/bucket/y",
        }),
      ).toEqual({
        id: "507f1f77bcf86cd799439099",
        uploadUrl: "https://storage.googleapis.com/bucket/y",
        contentType: undefined,
      });
    });

    it("lee en objeto anidado dentro de data", () => {
      expect(
        extractSignedUrlFields({
          data: {
            archivo: {
              _id: "507f1f77bcf86cd799439099",
              url: "https://storage.googleapis.com/bucket/z",
              tipo: "image/jpeg",
            },
          },
        }),
      ).toEqual({
        id: "507f1f77bcf86cd799439099",
        uploadUrl: "https://storage.googleapis.com/bucket/z",
        contentType: "image/jpeg",
        earlyFileUrl: undefined,
      });
    });

    it("extrae ObjectId desde nombreGCS si id en raíz no es válido", () => {
      const result = extractSignedUrlFields({
        archivoId: "no-es-object-id",
        uploadUrl:
          "https://storage.googleapis.com/bucket/archivos/empresa/2024/507f1f77bcf86cd799439099.jpg",
        nombreGCS: "archivos/empresa/2024/507f1f77bcf86cd799439099.jpg",
      });
      expect(result?.id).toBe("507f1f77bcf86cd799439099");
    });
  });

  describe("normalizeTraikerObjectId", () => {
    it("extrae 24 hex desde ruta GCS", () => {
      expect(
        extractObjectIdFromPath(
          "archivos/empresa/2024/507f1f77bcf86cd799439099.pdf",
        ),
      ).toBe("507f1f77bcf86cd799439099");
      expect(normalizeTraikerObjectId("507f1f77bcf86cd799439099")).toBe(
        "507f1f77bcf86cd799439099",
      );
    });
  });

  describe("buildTraikerConfirmarBody", () => {
    it("incluye id y archivoId", () => {
      expect(buildTraikerConfirmarBody("507f1f77bcf86cd799439099")).toEqual({
        id: "507f1f77bcf86cd799439099",
        archivoId: "507f1f77bcf86cd799439099",
      });
    });
  });

  describe("buildTraikerUploadStatusBody", () => {
    it("envía archivoIds como arreglo", () => {
      expect(buildTraikerUploadStatusBody("507f1f77bcf86cd799439099")).toEqual({
        archivoIds: ["507f1f77bcf86cd799439099"],
      });
    });
  });

  describe("isTraikerConfirmAccepted", () => {
    it("acepta HTTP 202 con ms Upload confirmado sin url", () => {
      const envelope = { ms: "Upload confirmado" };
      const res = { ok: true, status: 202 } as Response;
      expect(isTraikerConfirmAccepted(res, envelope)).toBe(true);
      expect(extractFileUrlFromEnvelope(envelope)).toBeUndefined();
    });
  });

  describe("extractTraikerArchivoId", () => {
    it("ignora archivoId inválido y usa id", () => {
      expect(
        extractTraikerArchivoId({
          archivoId: "corto",
          data: { id: "507f1f77bcf86cd799439099" },
        }),
      ).toBe("507f1f77bcf86cd799439099");
    });
  });

  describe("rate limit", () => {
    it("detecta cuerpo sin st", () => {
      const body = {
        error: "Demasiadas solicitudes",
        message: "Has excedido el límite",
        retry_after: "60 segundos",
      };
      expect(isTraikerRateLimitBody(body)).toBe(true);
      expect(traikerErrorMessage(asTraikerRecord(body), "fallback")).toContain(
        "límite",
      );
    });
  });

  describe("extractRefreshToken", () => {
    it("lee refresh en data", () => {
      expect(
        extractRefreshToken({
          data: { refresh_token: "r1" },
        }),
      ).toBe("r1");
    });
  });
});
