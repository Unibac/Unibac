"use client";

import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfile } from "@/modules/auth/hooks/use-profile";

const quickLinks = [
  { href: "/dashboard/usuarios", label: "Usuarios" },
  { href: "/dashboard/permisos", label: "Permisos" },
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
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {data.usuario}
        </h1>
        <p className="text-sm text-muted-foreground">
          Nivel {data.nivel} · {data.tipo}
        </p>
      </div>
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
