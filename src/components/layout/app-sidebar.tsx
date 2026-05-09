"use client";

import {
  BriefcaseIcon,
  BuildingsIcon,
  CalendarDotsIcon,
  HouseIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  SquaresFourIcon,
  TreeStructureIcon,
  UsersIcon,
  UserSquareIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: HouseIcon },
  { href: "/dashboard/usuarios", label: "Usuarios", icon: UsersIcon },
  { href: "/dashboard/permisos", label: "Permisos", icon: ShieldCheckIcon },
  { href: "/dashboard/acciones", label: "Acciones", icon: SquaresFourIcon },
  { href: "/dashboard/modulos", label: "Módulos", icon: TreeStructureIcon },
  { href: "/dashboard/egresados", label: "Egresados", icon: UserSquareIcon },
  {
    href: "/dashboard/directorio-emprendimientos",
    label: "Directorio emprendimientos",
    icon: BuildingsIcon,
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
  { href: "/dashboard/ferias", label: "Ferias", icon: CalendarDotsIcon },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="flex flex-col gap-2 border-b border-sidebar-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/80">
          Unibac
        </p>
        <p className="truncate text-xs text-sidebar-foreground/60">
          Panel administración
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
