import {
  CategoriaUsuarioExterno,
  NivelUsuario,
  TipoUsuario,
} from "@/modules/shared/types/enums";

/** Perfil autenticado para UI y autorización. */
export type AuthProfile = {
  id: number;
  usuario: string;
  nivel: NivelUsuario;
  tipo: TipoUsuario;
  rolId?: number | null;
  categoria?: CategoriaUsuarioExterno | null;
};

export type LoginResponse = {
  message: string;
  usuario: AuthProfile;
};

export type LogoutResponse = {
  message: string;
};

export type RegisterPublicInput = {
  categoria: CategoriaUsuarioExterno;
  usuario: string;
  clave: string;
  correo?: string;
  celular?: string;
  descripcion?: string;
  identificacion?: string;
  codigoEstudiantil?: string;
  nit?: string;
  razonSocial?: string;
  nombreContacto?: string;
  correoContacto?: string;
  telefono?: string;
};

export type LoginInput = {
  usuario: string;
  clave: string;
};
