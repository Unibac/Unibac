import { describe, expect, it } from "vitest";

import type { AuthProfile } from "@/modules/auth/types";
import {
  CategoriaUsuarioExterno,
  NivelUsuario,
  TipoUsuario,
} from "@/modules/shared/types/enums";

import {
  feriasCanBrowse,
  feriasCanPostular,
  isStaffFullUx,
} from "@/modules/auth/lib/profile-capabilities";

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

describe("ferias Política B — profile-capabilities", () => {
  it("admin e interno pueden browse pero no postular", () => {
    const admin = profile({
      tipo: TipoUsuario.INTERNO,
      nivel: NivelUsuario.ADMINISTRADOR,
    });
    const interno = profile({ tipo: TipoUsuario.INTERNO });
    expect(feriasCanBrowse(admin)).toBe(true);
    expect(feriasCanBrowse(interno)).toBe(true);
    expect(feriasCanPostular(admin)).toBe(false);
    expect(feriasCanPostular(interno)).toBe(false);
    expect(isStaffFullUx(interno)).toBe(true);
  });

  it("externo estudiante puede browse y postular", () => {
    const estudiante = profile({
      tipo: TipoUsuario.EXTERNO,
      categoria: CategoriaUsuarioExterno.ESTUDIANTE,
    });
    expect(feriasCanBrowse(estudiante)).toBe(true);
    expect(feriasCanPostular(estudiante)).toBe(true);
  });

  it("externo egresado y empresa pueden browse pero no postular", () => {
    const egresado = profile({
      tipo: TipoUsuario.EXTERNO,
      categoria: CategoriaUsuarioExterno.EGRESADO,
    });
    const empresa = profile({
      tipo: TipoUsuario.EXTERNO,
      categoria: CategoriaUsuarioExterno.EMPRESA,
    });
    expect(feriasCanBrowse(egresado)).toBe(true);
    expect(feriasCanBrowse(empresa)).toBe(true);
    expect(feriasCanPostular(egresado)).toBe(false);
    expect(feriasCanPostular(empresa)).toBe(false);
  });

  it("feriasCanAccessModule delega en feriasCanBrowse", async () => {
    const { feriasCanAccessModule } = await import(
      "@/modules/auth/lib/profile-capabilities"
    );
    const estudiante = profile({
      tipo: TipoUsuario.EXTERNO,
      categoria: CategoriaUsuarioExterno.ESTUDIANTE,
    });
    expect(feriasCanAccessModule(estudiante)).toBe(feriasCanBrowse(estudiante));
  });
});
