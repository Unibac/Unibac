"use client";

import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfile } from "@/modules/auth/hooks/use-profile";

const quickLinks = [
  { href: "/dashboard/usuarios", label: "Usuarios" },
  { href: "/dashboard/egresados", label: "Egresados" },
  { href: "/dashboard/convocatorias", label: "Convocatorias" },
] as const;

export default function DashboardHomePage() {
  const { data } = useProfile();

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Hola, ${data.usuario}`}
        description={`Nivel ${data.nivel} · ${data.tipo}`}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="text-base">{link.label}</CardTitle>
                <CardDescription>Ir al módulo</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
