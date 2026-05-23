/**
 * Contratos JSON de la API interna (`/api/*`).
 * Enums de dominio re-exportados desde prisma-enums; tipos alineados con Route Handlers + Prisma.
 */

export {
  AreaCreativaEmprendimiento,
  AreaTalento,
  CategoriaUsuarioExterno,
  EstadoLaboralEgresado,
  EstadoPostulacionConvocatoria,
  EstadoPropuestaFeria,
  NivelUsuario,
  TipoConvocatoriaEmprendimiento,
  TipoPerfilTalento,
  TipoUsuario,
} from "@/modules/shared/types/prisma-enums";

import type {
  AreaCreativaEmprendimiento,
  AreaTalento,
  CategoriaUsuarioExterno,
  EstadoLaboralEgresado,
  EstadoPostulacionConvocatoria,
  EstadoPropuestaFeria,
  NivelUsuario,
  TipoConvocatoriaEmprendimiento,
  TipoPerfilTalento,
  TipoUsuario,
} from "@/modules/shared/types/prisma-enums";

// --- Enums específicos de API (no Prisma) ---

/** Periodo calculado de una feria respecto a la fecha del servidor. */
export const FeriaPeriodo = {
  proxima: "proxima",
  activa: "activa",
  finalizada: "finalizada",
} as const;
export type FeriaPeriodo = (typeof FeriaPeriodo)[keyof typeof FeriaPeriodo];

/** Estados permitidos al moderar una propuesta (solo desde POSTULADO). */
export const ModerarPropuestaFeriaEstado = {
  ACEPTADO: "ACEPTADO",
  RECHAZADO: "RECHAZADO",
} as const;
export type ModerarPropuestaFeriaEstado = Exclude<
  EstadoPropuestaFeria,
  "POSTULADO"
>;

/** Estados permitidos al resolver una postulación a convocatoria. */
export const ResolverPostulacionEstado = {
  APROBADO: "APROBADO",
  RECHAZADO: "RECHAZADO",
} as const;
export type ResolverPostulacionEstado = Exclude<
  EstadoPostulacionConvocatoria,
  "POSTULADO"
>;

// --- RBAC ---

export type AccionResponseDto = {
  id: number;
  nombre: string;
};

export type ModuloResponseDto = {
  id: number;
  nombre: string;
  activo: boolean;
};

export type PermisoEnUsuarioResponseDto = {
  id: number;
  usuarioId: number;
  moduloId: number;
  accionId: number;
  modulo: ModuloResponseDto;
  accion: AccionResponseDto;
  /** Presente en `/api/permisos`: `usuario.id` es el rolId (legacy del mapper). */
  usuario?: UsuarioResponseDto;
};

export type RolResponseDto = {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
};

export type CreateRolPermisoDto = {
  rolId: number;
  moduloId: number;
  accionId: number;
};

export type RolWithStatsResponseDto = RolResponseDto & {
  usuariosCount: number;
  permisosCount: number;
};

export type UpdateRolDto = {
  nombre?: string;
  activo?: boolean;
};

export type CreateModuloDto = {
  nombre: string;
  activo?: boolean;
};

export type UpdateModuloDto = {
  nombre?: string;
  activo?: boolean;
};

export type CreateAccionDto = {
  nombre: string;
};

export type UpdateAccionDto = {
  nombre?: string;
};

export type DashboardResumenResponseDto = {
  postulacionesConvocatoriaPendientes: number;
  propuestasFeriaPendientes: number;
  convocatoriasAbiertas: number;
  feriasVigentes: number;
  egresadosSinFicha: number;
};

// --- Padrones de registro público ---

export type EstudianteHabilitadoResponseDto = {
  id: number;
  identificacion: string;
  codigoEstudiantil: string;
  nombres: string;
  apellidos: string;
  programa?: string | null;
  semestre?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateEstudianteHabilitadoDto = {
  identificacion: string;
  codigoEstudiantil: string;
  nombres: string;
  apellidos: string;
  programa?: string;
  semestre?: number;
};

export type UpdateEstudianteHabilitadoDto = {
  identificacion?: string;
  codigoEstudiantil?: string;
  nombres?: string;
  apellidos?: string;
  programa?: string;
  semestre?: number;
};

export type EgresadoHabilitadoResponseDto = {
  id: number;
  identificacion: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEgresadoHabilitadoDto = {
  identificacion: string;
};

export type UpdateEgresadoHabilitadoDto = {
  identificacion?: string;
};

// --- Usuarios ---

export type UsuarioResponseDto = {
  id: number;
  usuario: string;
  descripcion?: string | null;
  activo: boolean;
  nivel: NivelUsuario;
  tipo: TipoUsuario;
  correo?: string | null;
  celular?: string | null;
  rolId?: number | null;
  categoria?: CategoriaUsuarioExterno | null;
};

export type UsuarioWithPermisosResponseDto = UsuarioResponseDto & {
  permisos: PermisoEnUsuarioResponseDto[];
};

export type CreateUsuarioDto = {
  usuario: string;
  descripcion?: string;
  clave: string;
  activo?: boolean;
  nivel: NivelUsuario;
  tipo: TipoUsuario;
  correo?: string;
  celular?: string;
  rolId?: number;
  categoria?: CategoriaUsuarioExterno;
};

export type UpdateUsuarioDto = {
  usuario?: string;
  descripcion?: string;
  clave?: string;
  activo?: boolean;
  nivel?: NivelUsuario;
  tipo?: TipoUsuario;
  correo?: string;
  celular?: string;
  rolId?: number;
  categoria?: CategoriaUsuarioExterno | null;
};

// --- Ferias ---

export type FeriaResponseDto = {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  imagenBannerUrl?: string | null;
  periodo: FeriaPeriodo;
  createdAt: string;
  updatedAt: string;
};

export type CreateFeriaDto = {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  imagenBannerUrl?: string;
};

export type UpdateFeriaDto = {
  nombre?: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  imagenBannerUrl?: string;
};

export type FeriaBannerUploadResponseDto = {
  imagenBannerUrl: string;
};

export type PropuestaFeriaResponseDto = {
  id: number;
  usuarioId: number;
  feriaId: number;
  nombreEmprendimiento: string;
  descripcionCorta: string;
  imagenUrl?: string | null;
  areaCreativa: AreaCreativaEmprendimiento;
  redesContacto?: string | null;
  correo: string;
  celular?: string | null;
  estado: EstadoPropuestaFeria;
  createdAt: string;
  updatedAt: string;
  feria?: FeriaResponseDto;
};

export type CreatePropuestaFeriaDto = {
  nombreEmprendimiento: string;
  descripcionCorta: string;
  imagenUrl?: string;
  areaCreativa: AreaCreativaEmprendimiento;
  redesContacto?: string;
  correo: string;
  celular?: string;
};

export type UpdatePropuestaFeriaPropietarioDto = {
  nombreEmprendimiento?: string;
  descripcionCorta?: string;
  imagenUrl?: string;
  areaCreativa?: AreaCreativaEmprendimiento;
  redesContacto?: string;
  correo?: string;
  celular?: string;
};

export type ModerarPropuestaFeriaDto = {
  estado: ModerarPropuestaFeriaEstado;
};

export type FeriaPropuestaImagenUploadResponseDto = {
  imagenUrl: string;
};

export type FindPropuestasPorFeriaParams = {
  estado?: EstadoPropuestaFeria;
};

// --- Directorio emprendimientos ---

export type DirectorioEmprendimientoResponseDto = {
  id: number;
  usuarioId: number;
  nombreProyecto: string;
  descripcionCorta: string;
  imagenUrl?: string | null;
  correo?: string | null;
  redes?: string | null;
  sitioWeb?: string | null;
  areaCreativa: AreaCreativaEmprendimiento;
  perfilActivo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateDirectorioEmprendimientoDto = {
  nombreProyecto: string;
  descripcionCorta: string;
  imagenUrl?: string;
  correo?: string;
  redes?: string;
  sitioWeb?: string;
  areaCreativa: AreaCreativaEmprendimiento;
  perfilActivo?: boolean;
};

export type UpdateDirectorioEmprendimientoDto = {
  nombreProyecto?: string;
  descripcionCorta?: string;
  imagenUrl?: string;
  correo?: string;
  redes?: string;
  sitioWeb?: string;
  areaCreativa?: AreaCreativaEmprendimiento;
  perfilActivo?: boolean;
};

export type DirectorioImagenUploadResponseDto = {
  imagenUrl: string;
};

// --- Egresados ---

export type EgresadoVinculosDto = {
  talentoPerfilId?: number | null;
  directorioEmprendimientoId?: number | null;
};

export type EgresadoResponseDto = {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  identificacion: string;
  telefono?: string | null;
  correo: string;
  anioEgreso: number;
  programaCarrera: string;
  estadoLaboral: EstadoLaboralEgresado;
  brevePerfilProfesional: string;
  informacionEmprendimiento?: string | null;
  createdAt: string;
  updatedAt: string;
  vinculos?: EgresadoVinculosDto;
};

export type CreateEgresadoDto = {
  nombreCompleto: string;
  identificacion: string;
  telefono?: string;
  correo: string;
  anioEgreso: number;
  programaCarrera: string;
  estadoLaboral: EstadoLaboralEgresado;
  brevePerfilProfesional: string;
  informacionEmprendimiento?: string;
};

export type UpdateEgresadoDto = {
  nombreCompleto?: string;
  identificacion?: string;
  telefono?: string;
  correo?: string;
  anioEgreso?: number;
  programaCarrera?: string;
  estadoLaboral?: EstadoLaboralEgresado;
  brevePerfilProfesional?: string;
  informacionEmprendimiento?: string;
};

/** Cuenta EGRESADO activa sin fila en `EGRESADOS` (ficha pendiente). */
export type EgresadoSinFichaResponseDto = {
  usuarioId: number;
  usuario: string;
  descripcion?: string | null;
  correo?: string | null;
  celular?: string | null;
};

export type FindEgresadosParams = {
  nombre?: string;
  anioEgreso?: number;
  programaCarrera?: string;
  estadoLaboral?: EstadoLaboralEgresado;
  /** Solo staff: listar cuentas sin ficha de egresado. */
  sinFicha?: boolean;
};

// --- Empresa (cuenta propia) ---

export type EmpresaMineResponseDto = {
  id: number;
  usuarioId: number;
  nit: string;
  razonSocial: string;
  nombreContacto?: string | null;
  correoContacto?: string | null;
  telefono?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateEmpresaMeDto = {
  nombreContacto?: string;
  correoContacto?: string;
  telefono?: string;
};

export type UpdateMeUsuarioDto = {
  descripcion?: string;
  correo?: string;
  celular?: string;
};

// --- Talento ---

export type TalentoPerfilResponseDto = {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  area: AreaTalento;
  habilidades: string;
  portafolioUrl?: string | null;
  telefono?: string | null;
  correoContacto?: string | null;
  perfilActivo: boolean;
  tipoPerfil: TipoPerfilTalento;
  createdAt: string;
  updatedAt: string;
};

export type CreateTalentoPerfilDto = {
  nombreCompleto: string;
  area: AreaTalento;
  habilidades: string;
  portafolioUrl?: string;
  telefono?: string;
  correoContacto?: string;
  tipoPerfil: TipoPerfilTalento;
  perfilActivo?: boolean;
};

export type UpdateTalentoPerfilDto = {
  nombreCompleto?: string;
  area?: AreaTalento;
  habilidades?: string;
  portafolioUrl?: string;
  telefono?: string;
  correoContacto?: string;
  tipoPerfil?: TipoPerfilTalento;
  perfilActivo?: boolean;
};

// --- Convocatorias ---

export type PublicacionEmprendimientoResponseDto = {
  id: number;
  titulo: string;
  descripcion: string;
  tipoConvocatoria: TipoConvocatoriaEmprendimiento;
  convocados: string;
  fechaLimite: string;
  montoTipoApoyo?: string | null;
  linkExterno?: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatePublicacionConvocatoriaDto = {
  titulo: string;
  descripcion: string;
  tipoConvocatoria: TipoConvocatoriaEmprendimiento;
  convocados: string;
  fechaLimite: string;
  montoTipoApoyo?: string;
  linkExterno?: string;
  activo?: boolean;
};

export type UpdatePublicacionConvocatoriaDto = {
  titulo?: string;
  descripcion?: string;
  tipoConvocatoria?: TipoConvocatoriaEmprendimiento;
  convocados?: string;
  fechaLimite?: string;
  montoTipoApoyo?: string;
  linkExterno?: string;
  activo?: boolean;
};

export type PostulacionUsuarioResumenDto = {
  id: number;
  usuario: string;
  correo?: string | null;
};

export type PostulacionConvocatoriaResponseDto = {
  id: number;
  usuarioId: number;
  publicacionId: number;
  fechaPostulacion: string;
  estadoPostulacion: EstadoPostulacionConvocatoria;
  publicacion?: PublicacionEmprendimientoResponseDto;
  usuario?: PostulacionUsuarioResumenDto;
};

export type UpdateEstadoPostulacionDto = {
  estado: ResolverPostulacionEstado;
};

export type FindConvocatoriasParams = {
  tipoConvocatoria?: TipoConvocatoriaEmprendimiento;
  activo?: boolean;
};
