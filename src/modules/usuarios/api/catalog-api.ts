import { getAcciones } from "@/api/generated/acciones/acciones";
import { getModulos } from "@/api/generated/modulos/modulos";

/** Catálogo para el formulario de usuarios (asignación de permisos). */
export async function listModulosCatalog() {
  return getModulos().modulosControllerFindAll();
}

export async function listAccionesCatalog() {
  return getAcciones().accionesControllerFindAll();
}
