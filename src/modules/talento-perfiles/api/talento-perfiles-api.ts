import type {
  CreateTalentoPerfilDto,
  UpdateTalentoPerfilDto,
} from "@/api/generated/models";
import { getTalentoPerfiles } from "@/api/generated/talento-perfiles/talento-perfiles";

const api = getTalentoPerfiles();

export async function listTalentoPerfiles() {
  return api.talentoPerfilesControllerFindAll();
}

export async function getTalentoPerfil(id: number) {
  return api.talentoPerfilesControllerFindOne(id);
}

export async function createTalentoPerfil(body: CreateTalentoPerfilDto) {
  return api.talentoPerfilesControllerCreate(body);
}

export async function updateTalentoPerfil(
  id: number,
  body: UpdateTalentoPerfilDto,
) {
  return api.talentoPerfilesControllerUpdate(id, body);
}

export async function deleteTalentoPerfil(id: number) {
  return api.talentoPerfilesControllerRemove(id);
}
