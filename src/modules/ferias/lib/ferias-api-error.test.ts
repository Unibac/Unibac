import axios from "axios";
import { describe, expect, it } from "vitest";

import { getFeriasPropuestaErrorMessage } from "@/modules/ferias/lib/ferias-api-error";

describe("getFeriasPropuestaErrorMessage", () => {
  it("mapea 409 en create", () => {
    const err = new axios.AxiosError("Conflict", "ERR", undefined, undefined, {
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: {} as never,
      data: {},
    });
    expect(getFeriasPropuestaErrorMessage(err, "create")).toBe(
      "Ya registraste una propuesta en esta feria.",
    );
  });

  it("mapea 503 en uploadImagen", () => {
    const err = new axios.AxiosError(
      "Unavailable",
      "ERR",
      undefined,
      undefined,
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: {},
        config: {} as never,
        data: {},
      },
    );
    expect(getFeriasPropuestaErrorMessage(err, "uploadImagen")).toContain(
      "servicio de archivos",
    );
  });
});
