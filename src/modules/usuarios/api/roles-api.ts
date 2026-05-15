import { getRoles } from "@/api/generated/roles/roles";

const roles = getRoles();

export async function listRolesCatalog() {
  return roles.rolesControllerFindAll();
}
