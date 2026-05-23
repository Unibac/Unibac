/** Rutas donde el listado no usa cards/tabla compartido o el toggle no aporta. */
const LIST_LAYOUT_TOGGLE_HIDDEN_EXACT = new Set([
  "/dashboard",
  "/dashboard/perfil",
  "/dashboard/usuarios",
  "/dashboard/egresados",
]);

const LIST_LAYOUT_TOGGLE_HIDDEN_PREFIX = "/dashboard/administracion";

export function isListLayoutToggleVisible(pathname: string): boolean {
  if (LIST_LAYOUT_TOGGLE_HIDDEN_EXACT.has(pathname)) {
    return false;
  }
  if (
    pathname === LIST_LAYOUT_TOGGLE_HIDDEN_PREFIX ||
    pathname.startsWith(`${LIST_LAYOUT_TOGGLE_HIDDEN_PREFIX}/`)
  ) {
    return false;
  }
  return true;
}
