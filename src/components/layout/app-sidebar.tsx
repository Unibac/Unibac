"use client";

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
import { useProfile } from "@/modules/auth/hooks/use-profile";
import { getDashboardNavItemsForProfile } from "@/modules/auth/lib/dashboard-nav-items";

export function AppSidebar() {
  const pathname = usePathname();
  const profile = useProfile();

  const navItems =
    profile.data != null ? getDashboardNavItemsForProfile(profile.data) : [];

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
