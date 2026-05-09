import type { AuthProfileResponseDto } from "@/api/generated/models";
import {
  AuthProfileResponseDtoNivel,
  AuthProfileResponseDtoTipo,
} from "@/api/generated/models";

export function feriasIsAdmin(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  return profile?.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR;
}

export function feriasCanPostular(
  profile: AuthProfileResponseDto | undefined,
): boolean {
  if (!profile) return false;
  return (
    profile.tipo === AuthProfileResponseDtoTipo.INTERNO ||
    profile.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR
  );
}
