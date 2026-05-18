import { describe, expect, it } from "vitest";

import type { AuthProfileResponseDto } from "@/api/generated/models";
import {
  AuthProfileResponseDtoCategoria,
  AuthProfileResponseDtoNivel,
  AuthProfileResponseDtoTipo,
} from "@/api/generated/models";

import {
  feriasCanBrowse,
  feriasCanManageEventos,
  feriasCanPostular,
  feriasIsAdmin,
} from "@/modules/ferias/utils/ferias-permissions";

function profile(
  partial: Partial<AuthProfileResponseDto> &
    Pick<AuthProfileResponseDto, "tipo">,
): AuthProfileResponseDto {
  return {
    id: 1,
    usuario: "demo",
    nivel: AuthProfileResponseDtoNivel.USUARIO,
    ...partial,
  };
}

describe("ferias-permissions", () => {
  it("feriasCanBrowse delega en profile-capabilities", () => {
    const estudiante = profile({
      tipo: AuthProfileResponseDtoTipo.EXTERNO,
      categoria: AuthProfileResponseDtoCategoria.ESTUDIANTE,
    });
    expect(feriasCanBrowse(estudiante)).toBe(true);
  });

  it("feriasCanPostular solo externo estudiante", () => {
    expect(
      feriasCanPostular(
        profile({
          tipo: AuthProfileResponseDtoTipo.EXTERNO,
          categoria: AuthProfileResponseDtoCategoria.ESTUDIANTE,
        }),
      ),
    ).toBe(true);
    expect(
      feriasCanPostular(profile({ tipo: AuthProfileResponseDtoTipo.INTERNO })),
    ).toBe(false);
  });

  it("feriasCanManageEventos para admin e interno", () => {
    expect(
      feriasCanManageEventos(
        profile({
          tipo: AuthProfileResponseDtoTipo.INTERNO,
          nivel: AuthProfileResponseDtoNivel.ADMINISTRADOR,
        }),
      ),
    ).toBe(true);
    expect(
      feriasCanManageEventos(
        profile({ tipo: AuthProfileResponseDtoTipo.INTERNO }),
      ),
    ).toBe(true);
    expect(
      feriasCanManageEventos(
        profile({
          tipo: AuthProfileResponseDtoTipo.EXTERNO,
          categoria: AuthProfileResponseDtoCategoria.ESTUDIANTE,
        }),
      ),
    ).toBe(false);
  });

  it("feriasIsAdmin solo nivel administrador", () => {
    expect(
      feriasIsAdmin(
        profile({
          tipo: AuthProfileResponseDtoTipo.INTERNO,
          nivel: AuthProfileResponseDtoNivel.ADMINISTRADOR,
        }),
      ),
    ).toBe(true);
    expect(
      feriasIsAdmin(profile({ tipo: AuthProfileResponseDtoTipo.INTERNO })),
    ).toBe(false);
  });
});
