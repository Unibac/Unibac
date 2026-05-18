import { describe, expect, it } from "vitest";

import type { AuthProfileResponseDto } from "@/api/generated/models";
import {
  AuthProfileResponseDtoCategoria,
  AuthProfileResponseDtoNivel,
  AuthProfileResponseDtoTipo,
} from "@/api/generated/models";

import {
  feriasCanBrowse,
  feriasCanPostular,
  isStaffFullUx,
} from "@/modules/auth/lib/profile-capabilities";

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

describe("ferias Política B — profile-capabilities", () => {
  it("admin e interno pueden browse pero no postular", () => {
    const admin = profile({
      tipo: AuthProfileResponseDtoTipo.INTERNO,
      nivel: AuthProfileResponseDtoNivel.ADMINISTRADOR,
    });
    const interno = profile({ tipo: AuthProfileResponseDtoTipo.INTERNO });
    expect(feriasCanBrowse(admin)).toBe(true);
    expect(feriasCanBrowse(interno)).toBe(true);
    expect(feriasCanPostular(admin)).toBe(false);
    expect(feriasCanPostular(interno)).toBe(false);
    expect(isStaffFullUx(interno)).toBe(true);
  });

  it("externo estudiante puede browse y postular", () => {
    const estudiante = profile({
      tipo: AuthProfileResponseDtoTipo.EXTERNO,
      categoria: AuthProfileResponseDtoCategoria.ESTUDIANTE,
    });
    expect(feriasCanBrowse(estudiante)).toBe(true);
    expect(feriasCanPostular(estudiante)).toBe(true);
  });

  it("externo egresado y empresa pueden browse pero no postular", () => {
    const egresado = profile({
      tipo: AuthProfileResponseDtoTipo.EXTERNO,
      categoria: AuthProfileResponseDtoCategoria.EGRESADO,
    });
    const empresa = profile({
      tipo: AuthProfileResponseDtoTipo.EXTERNO,
      categoria: AuthProfileResponseDtoCategoria.EMPRESA,
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
      tipo: AuthProfileResponseDtoTipo.EXTERNO,
      categoria: AuthProfileResponseDtoCategoria.ESTUDIANTE,
    });
    expect(feriasCanAccessModule(estudiante)).toBe(feriasCanBrowse(estudiante));
  });
});
