import { describe, expect, it } from "vitest";

import type { AuthProfile } from "@/modules/auth/types";
import {
  CategoriaUsuarioExterno,
  NivelUsuario,
  TipoUsuario,
} from "@/modules/shared/types/enums";

import {
  feriasCanBrowse,
  feriasCanManageEventos,
  feriasCanPostular,
  feriasIsAdmin,
} from "@/modules/ferias/utils/ferias-permissions";

function profile(
  partial: Partial<AuthProfile> & Pick<AuthProfile, "tipo">,
): AuthProfile {
  return {
    id: 1,
    usuario: "demo",
    nivel: NivelUsuario.USUARIO,
    ...partial,
  };
}

describe("ferias-permissions", () => {
  it("feriasCanBrowse delega en profile-capabilities", () => {
    const estudiante = profile({
      tipo: TipoUsuario.EXTERNO,
      categoria: CategoriaUsuarioExterno.ESTUDIANTE,
    });
    expect(feriasCanBrowse(estudiante)).toBe(true);
  });

  it("feriasCanPostular solo externo estudiante", () => {
    expect(
      feriasCanPostular(
        profile({
          tipo: TipoUsuario.EXTERNO,
          categoria: CategoriaUsuarioExterno.ESTUDIANTE,
        }),
      ),
    ).toBe(true);
    expect(feriasCanPostular(profile({ tipo: TipoUsuario.INTERNO }))).toBe(
      false,
    );
  });

  it("feriasCanManageEventos para admin e interno", () => {
    expect(
      feriasCanManageEventos(
        profile({
          tipo: TipoUsuario.INTERNO,
          nivel: NivelUsuario.ADMINISTRADOR,
        }),
      ),
    ).toBe(true);
    expect(feriasCanManageEventos(profile({ tipo: TipoUsuario.INTERNO }))).toBe(
      true,
    );
    expect(
      feriasCanManageEventos(
        profile({
          tipo: TipoUsuario.EXTERNO,
          categoria: CategoriaUsuarioExterno.ESTUDIANTE,
        }),
      ),
    ).toBe(false);
  });

  it("feriasIsAdmin solo nivel administrador", () => {
    expect(
      feriasIsAdmin(
        profile({
          tipo: TipoUsuario.INTERNO,
          nivel: NivelUsuario.ADMINISTRADOR,
        }),
      ),
    ).toBe(true);
    expect(feriasIsAdmin(profile({ tipo: TipoUsuario.INTERNO }))).toBe(false);
  });
});
