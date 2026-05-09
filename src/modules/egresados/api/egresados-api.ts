import { getEgresados } from "@/api/generated/egresados/egresados";
import type {
  CreateEgresadoDto,
  EgresadosControllerFindAllParams,
  UpdateEgresadoDto,
} from "@/api/generated/models";

const api = getEgresados();

export async function listEgresados(params?: EgresadosControllerFindAllParams) {
  return api.egresadosControllerFindAll(params);
}

export async function getEgresado(id: number) {
  return api.egresadosControllerFindOne(id);
}

export async function getEgresadoMe() {
  return api.egresadosControllerFindMe();
}

export async function createEgresado(body: CreateEgresadoDto) {
  return api.egresadosControllerCreate(body);
}

export async function updateEgresado(id: number, body: UpdateEgresadoDto) {
  return api.egresadosControllerUpdate(id, body);
}

export async function deleteEgresado(id: number) {
  return api.egresadosControllerRemove(id);
}
