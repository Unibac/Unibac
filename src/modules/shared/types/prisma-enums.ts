/** Enums de dominio (valores alineados con Prisma). Seguros para cliente. */

export const TipoUsuario = {
  INTERNO: "INTERNO",
  EXTERNO: "EXTERNO",
} as const;
export type TipoUsuario = (typeof TipoUsuario)[keyof typeof TipoUsuario];

export const NivelUsuario = {
  USUARIO: "USUARIO",
  ADMINISTRADOR: "ADMINISTRADOR",
} as const;
export type NivelUsuario = (typeof NivelUsuario)[keyof typeof NivelUsuario];

export const CategoriaUsuarioExterno = {
  ESTUDIANTE: "ESTUDIANTE",
  EGRESADO: "EGRESADO",
  EMPRESA: "EMPRESA",
} as const;
export type CategoriaUsuarioExterno =
  (typeof CategoriaUsuarioExterno)[keyof typeof CategoriaUsuarioExterno];

export const AreaTalento = {
  MUSICA: "MUSICA",
  ARTES_PLASTICAS: "ARTES_PLASTICAS",
  DISENO: "DISENO",
  AUDIOVISUAL: "AUDIOVISUAL",
  ARTES_ESCENICAS: "ARTES_ESCENICAS",
} as const;
export type AreaTalento = (typeof AreaTalento)[keyof typeof AreaTalento];

export const TipoPerfilTalento = {
  ESTUDIANTE: "ESTUDIANTE",
  EGRESADO: "EGRESADO",
  EMPRENDEDOR: "EMPRENDEDOR",
} as const;
export type TipoPerfilTalento =
  (typeof TipoPerfilTalento)[keyof typeof TipoPerfilTalento];

export const AreaCreativaEmprendimiento = {
  ARTES_PLASTICAS: "ARTES_PLASTICAS",
  MUSICA: "MUSICA",
  DISENO: "DISENO",
  AUDIOVISUAL: "AUDIOVISUAL",
} as const;
export type AreaCreativaEmprendimiento =
  (typeof AreaCreativaEmprendimiento)[keyof typeof AreaCreativaEmprendimiento];

export const EstadoLaboralEgresado = {
  EMPLEADO: "EMPLEADO",
  EMPRENDEDOR: "EMPRENDEDOR",
  DESEMPLEADO: "DESEMPLEADO",
  ESTUDIANDO: "ESTUDIANDO",
} as const;
export type EstadoLaboralEgresado =
  (typeof EstadoLaboralEgresado)[keyof typeof EstadoLaboralEgresado];

export const TipoConvocatoriaEmprendimiento = {
  FINANCIAMIENTO: "FINANCIAMIENTO",
  FORMACION: "FORMACION",
  PRACTICAS: "PRACTICAS",
} as const;
export type TipoConvocatoriaEmprendimiento =
  (typeof TipoConvocatoriaEmprendimiento)[keyof typeof TipoConvocatoriaEmprendimiento];

export const EstadoPostulacionConvocatoria = {
  POSTULADO: "POSTULADO",
  RECHAZADO: "RECHAZADO",
  APROBADO: "APROBADO",
} as const;
export type EstadoPostulacionConvocatoria =
  (typeof EstadoPostulacionConvocatoria)[keyof typeof EstadoPostulacionConvocatoria];

export const EstadoPropuestaFeria = {
  POSTULADO: "POSTULADO",
  RECHAZADO: "RECHAZADO",
  ACEPTADO: "ACEPTADO",
} as const;
export type EstadoPropuestaFeria =
  (typeof EstadoPropuestaFeria)[keyof typeof EstadoPropuestaFeria];
