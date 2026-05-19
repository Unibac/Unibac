import { describe, expect, it } from "vitest";

import {
  FeriaResponseDtoPeriodo,
  PropuestaFeriaResponseDtoEstado,
  type PropuestaFeriaResponseDto,
} from "@/api/generated/models";

import {
  canEditMisPropuesta,
  feriaPermitePostulacion,
} from "@/modules/ferias/lib/propuesta-feria-rules";

describe("feriaPermitePostulacion", () => {
  it("permite próxima y activa", () => {
    expect(feriaPermitePostulacion(FeriaResponseDtoPeriodo.proxima)).toBe(true);
    expect(feriaPermitePostulacion(FeriaResponseDtoPeriodo.activa)).toBe(true);
  });

  it("no permite finalizada ni indefinido", () => {
    expect(feriaPermitePostulacion(FeriaResponseDtoPeriodo.finalizada)).toBe(
      false,
    );
    expect(feriaPermitePostulacion(undefined)).toBe(false);
  });
});

describe("canEditMisPropuesta", () => {
  const row = {
    id: 1,
    usuarioId: 8,
    estado: PropuestaFeriaResponseDtoEstado.POSTULADO,
  } as PropuestaFeriaResponseDto;

  it("permite editar en feria próxima", () => {
    expect(
      canEditMisPropuesta(row, {
        canPostular: true,
        usuarioId: 8,
        feriaPeriodo: FeriaResponseDtoPeriodo.proxima,
      }),
    ).toBe(true);
  });

  it("no permite editar en feria finalizada", () => {
    expect(
      canEditMisPropuesta(row, {
        canPostular: true,
        usuarioId: 8,
        feriaPeriodo: FeriaResponseDtoPeriodo.finalizada,
      }),
    ).toBe(false);
  });
});
