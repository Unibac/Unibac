"use client";

import {
  BriefcaseIcon,
  Building2Icon,
  CalendarDaysIcon,
  HomeIcon,
  MegaphoneIcon,
  UserSquareIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UnibacLogo } from "@/components/shared/unibac-logo";
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
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="flex flex-col gap-3 border-b border-sidebar-border px-4 py-3">
        <Link
          href="/dashboard"
          className="flex justify-center rounded-md outline-none ring-sidebar-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Ir al inicio del panel"
        >
          <UnibacLogo
            priority
            className="group-data-[collapsible=icon]:p-1"
            imgClassName="max-h-28 group-data-[collapsible=icon]:max-h-9 group-data-[collapsible=icon]:max-w-9"
          />
        </Link>
        <p className="truncate text-center text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
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
                        <Icon className="size-4 shrink-0" />
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
