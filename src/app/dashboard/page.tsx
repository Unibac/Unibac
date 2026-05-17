"use client";

import Link from "next/link";

import { PortalHero } from "@/components/layout/portal/portal-hero";
import { PortalServiceGrid } from "@/components/layout/portal/portal-service-grid";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfile } from "@/modules/auth/hooks/use-profile";
import { getDashboardNavItemsForProfile } from "@/modules/auth/lib/dashboard-nav-items";
import { isPortalExternoUx } from "@/modules/auth/lib/portal-ux";

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
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Hola, ${data.usuario}`}
        description={`Nivel ${data.nivel} · ${data.tipo}`}
      />
      {navItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay módulos disponibles para tu cuenta.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navItems.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="transition-colors duration-150 hover:bg-accent/50">
                <CardHeader className="flex flex-col gap-2">
                  <CardTitle className="text-base">{link.label}</CardTitle>
                  <CardDescription>Ir al módulo</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
