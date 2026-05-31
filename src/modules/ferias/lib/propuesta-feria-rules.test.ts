import { describe, expect, it } from "vitest";

import {
  FeriaPeriodo,
  EstadoPropuestaFeria,
  type PropuestaFeriaResponseDto,
} from "@/modules/shared/types/api-models";

import {
  canEditMisPropuesta,
  feriaPermitePostulacion,
} from "@/modules/ferias/lib/propuesta-feria-rules";

describe("feriaPermitePostulacion", () => {
  it("permite próxima y activa", () => {
    expect(feriaPermitePostulacion(FeriaPeriodo.proxima)).toBe(true);
    expect(feriaPermitePostulacion(FeriaPeriodo.activa)).toBe(true);
  });

  it("no permite finalizada ni indefinido", () => {
    expect(feriaPermitePostulacion(FeriaPeriodo.finalizada)).toBe(false);
    expect(feriaPermitePostulacion(undefined)).toBe(false);
  });
});

describe("canEditMisPropuesta", () => {
  const row = {
    id: 1,
    usuarioId: 8,
    estado: EstadoPropuestaFeria.POSTULADO,
  } as PropuestaFeriaResponseDto;

  it("permite editar en feria próxima", () => {
    expect(
      canEditMisPropuesta(row, {
        canPostular: true,
        usuarioId: 8,
        feriaPeriodo: FeriaPeriodo.proxima,
      }),
    ).toBe(true);
  });

  it("no permite editar en feria finalizada", () => {
    expect(
      canEditMisPropuesta(row, {
        canPostular: true,
        usuarioId: 8,
        feriaPeriodo: FeriaPeriodo.finalizada,
      }),
    ).toBe(false);
  });
});
