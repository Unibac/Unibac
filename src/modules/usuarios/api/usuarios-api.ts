import type {
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from "@/api/generated/models";
import { getUsuarios } from "@/api/generated/usuarios/usuarios";

const usuarios = getUsuarios();

export async function listUsuarios() {
  return usuarios.usuariosControllerFindAll();
}

export async function getUsuario(id: number) {
  return usuarios.usuariosControllerFindOne(id);
}

export async function createUsuario(body: CreateUsuarioDto) {
  return usuarios.usuariosControllerCreate(body);
}

export async function updateUsuario(id: number, body: UpdateUsuarioDto) {
  return usuarios.usuariosControllerUpdate(id, body);
}

export async function deleteUsuario(id: number) {
  return usuarios.usuariosControllerRemove(id);
}
