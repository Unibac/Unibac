import type { LucideIcon } from "lucide-react";
import { SettingsIcon } from "lucide-react";

import { isAdministrador } from "@/modules/auth/lib/profile-capabilities";
import type { AuthProfile } from "@/modules/auth/types";

export type AdminNavHref = "/dashboard/administracion";

export type AdminNavItemData = {
  href: AdminNavHref;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEM_DATA = [
  {
    href: "/dashboard/administracion",
    label: "Administración",
    icon: SettingsIcon,
  },
] as const satisfies readonly AdminNavItemData[];

export function getAdminNavItemsForProfile(
  profile: AuthProfile,
): AdminNavItemData[] {
  if (!isAdministrador(profile)) {
    return [];
  }
  return [...ADMIN_NAV_ITEM_DATA];
}
