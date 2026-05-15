import type { LucideIcon } from "lucide-react";
import {
  BriefcaseIcon,
  Building2Icon,
  CalendarDaysIcon,
  HomeIcon,
  MegaphoneIcon,
  UserSquareIcon,
  UsersIcon,
} from "lucide-react";

/** Rutas registradas en `app/dashboard/...`. */
export type DashboardNavHref =
  | "/dashboard"
  | "/dashboard/usuarios"
  | "/dashboard/egresados"
  | "/dashboard/directorio-emprendimientos"
  | "/dashboard/convocatorias"
  | "/dashboard/talento-perfiles"
  | "/dashboard/ferias";

export type DashboardNavItemData = {
  href: DashboardNavHref;
  label: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEM_DATA = [
  { href: "/dashboard", label: "Inicio", icon: HomeIcon },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: UsersIcon },
  { href: "/dashboard/egresados", label: "Egresados", icon: UserSquareIcon },
  {
    href: "/dashboard/directorio-emprendimientos",
    label: "Directorio emprendimientos",
    icon: Building2Icon,
  },
  {
    href: "/dashboard/convocatorias",
    label: "Convocatorias",
    icon: MegaphoneIcon,
  },
  {
    href: "/dashboard/talento-perfiles",
    label: "Talento",
    icon: BriefcaseIcon,
  },
  { href: "/dashboard/ferias", label: "Ferias", icon: CalendarDaysIcon },
] as const satisfies readonly DashboardNavItemData[];
