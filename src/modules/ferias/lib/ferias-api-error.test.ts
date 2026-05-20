import { describe, expect, it } from "vitest";

import { ApiClientError } from "@/lib/api/fetch-api";
import { getFeriasPropuestaErrorMessage } from "@/modules/ferias/lib/ferias-api-error";

describe("getFeriasPropuestaErrorMessage", () => {
  it("mapea 409 en create", () => {
    const err = new ApiClientError(409, "Conflict");
    expect(getFeriasPropuestaErrorMessage(err, "create")).toBe(
      "Ya registraste una propuesta en esta feria.",
    );
  });

  it("mapea 503 en uploadImagen", () => {
    const err = new ApiClientError(503, "Service Unavailable");
    expect(getFeriasPropuestaErrorMessage(err, "uploadImagen")).toContain(
      "servicio de archivos",
    );
  });
});
