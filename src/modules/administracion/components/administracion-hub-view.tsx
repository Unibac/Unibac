"use client";

import {
  ClipboardListIcon,
  GraduationCapIcon,
  ShieldIcon,
  UserSquareIcon,
} from "lucide-react";
import Link from "next/link";
import { NavModuleCard } from "@/components/shared/nav-module-card";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const LINKS = [
  {
    href: "/dashboard/administracion/padrones-estudiantes",
    title: "Padrón estudiantes",
    description: "Cédulas y códigos habilitados para registro público.",
    icon: GraduationCapIcon,
  },
  {
    href: "/dashboard/administracion/padrones-egresados",
    title: "Padrón egresados",
    description: "Identificaciones habilitadas para registro como egresado.",
    icon: UserSquareIcon,
  },
  {
    href: "/dashboard/administracion/roles-permisos",
    title: "Roles y permisos",
    description: "Matriz rol × módulo × acción (RBAC).",
    icon: ShieldIcon,
  },
  {
    href: "/dashboard/usuarios",
    title: "Usuarios",
    description: "Cuentas, roles asignados y categoría externa.",
    icon: ClipboardListIcon,
  },
] as const;

export function AdministracionHubView() {
  return (
    <div className="layout-list-grid">
      {LINKS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <NavModuleCard className="h-full">
              <CardHeader className="flex flex-row items-start gap-3">
                <Icon
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </CardHeader>
            </NavModuleCard>
          </Link>
        );
      })}
    </div>
  );
}
