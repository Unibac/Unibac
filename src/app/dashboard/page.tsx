"use client";

import Link from "next/link";

import { DashboardPage } from "@/components/layout/dashboard-page";
import { PortalHero } from "@/components/layout/portal/portal-hero";
import { PortalServiceGrid } from "@/components/layout/portal/portal-service-grid";
import { PageHeader } from "@/components/layout/page-header";
import { NavModuleCard } from "@/components/shared/nav-module-card";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/modules/auth/hooks/use-profile";
import { getDashboardNavItemsForProfile } from "@/modules/auth/lib/dashboard-nav-items";
import { isStaffFullUx } from "@/modules/auth/lib/profile-capabilities";
import { isPortalExternoUx } from "@/modules/auth/lib/portal-ux";
import { StaffDashboardResumen } from "@/modules/dashboard/components/staff-dashboard-resumen";

export default function DashboardHomePage() {
  const { data } = useProfile();

  if (!data) {
    return null;
  }

  if (isPortalExternoUx(data) && data.categoria != null) {
    const serviceItems = getDashboardNavItemsForProfile(data).filter(
      (item) => item.href !== "/dashboard",
    );

    return (
      <>
        <PortalHero categoria={data.categoria} />
        <div className="layout-portal-home">
          <PortalServiceGrid items={serviceItems} />
        </div>
      </>
    );
  }

  const navItems = getDashboardNavItemsForProfile(data).filter(
    (item) => item.href !== "/dashboard",
  );

  return (
    <DashboardPage>
      <PageHeader
        title={`Hola, ${data.usuario}`}
        description={`Nivel ${data.nivel} · ${data.tipo}`}
      />
      <div className="flex flex-col gap-8">
        {isStaffFullUx(data) ? <StaffDashboardResumen /> : null}
        {navItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay módulos disponibles para tu cuenta.
          </p>
        ) : (
          <div className="layout-list-grid">
            {navItems.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <NavModuleCard className="h-full">
                  <CardHeader className="flex flex-col gap-2">
                    <CardTitle className="text-base">{link.label}</CardTitle>
                    <CardDescription>Ir al módulo</CardDescription>
                  </CardHeader>
                </NavModuleCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardPage>
  );
}
