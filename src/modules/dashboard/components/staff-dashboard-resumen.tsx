"use client";

import Link from "next/link";

import { PageCallout } from "@/components/shared/page-callout";
import { NavModuleCard } from "@/components/shared/nav-module-card";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useDashboardResumenQuery } from "@/modules/dashboard/hooks/use-dashboard-resumen";

const METRICS = [
  {
    key: "postulacionesConvocatoriaPendientes" as const,
    label: "Postulaciones pendientes",
    description: "Convocatorias por revisar",
    href: "/dashboard/convocatorias",
  },
  {
    key: "propuestasFeriaPendientes" as const,
    label: "Propuestas de feria pendientes",
    description: "Por moderar",
    href: "/dashboard/ferias",
  },
  {
    key: "convocatoriasAbiertas" as const,
    label: "Convocatorias abiertas",
    description: "Activas con plazo vigente",
    href: "/dashboard/convocatorias",
  },
  {
    key: "feriasVigentes" as const,
    label: "Ferias vigentes",
    description: "Próximas o en curso",
    href: "/dashboard/ferias",
  },
  {
    key: "egresadosSinFicha" as const,
    label: "Egresados sin ficha",
    description: "Cuentas sin completar perfil",
    href: "/dashboard/egresados?sinFicha=true",
  },
] as const;

export function StaffDashboardResumen() {
  const query = useDashboardResumenQuery();

  if (query.isPending) {
    return <Skeleton className="h-36 w-full" />;
  }

  if (query.isError) {
    return (
      <PageCallout variant="destructive" title="No se pudo cargar el resumen">
        {getApiErrorMessage(query.error)}
      </PageCallout>
    );
  }

  const data = query.data;
  if (!data) return null;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Resumen operativo
        </h2>
        <p className="text-xs text-muted-foreground">
          Indicadores para priorizar moderación y seguimiento.
        </p>
      </div>
      <div className="layout-list-grid">
        {METRICS.map((metric) => (
          <Link
            key={metric.key}
            href={metric.href}
            className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <NavModuleCard className="h-full">
              <CardHeader className="flex flex-col gap-1">
                <p className="text-2xl font-semibold tabular-nums text-foreground">
                  {data[metric.key]}
                </p>
                <CardTitle className="text-sm">{metric.label}</CardTitle>
                <CardDescription>{metric.description}</CardDescription>
              </CardHeader>
            </NavModuleCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
