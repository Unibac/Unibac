import Link from "next/link";

import { NavModuleCard } from "@/components/shared/nav-module-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EstudiantePerfilLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Más sobre tu perfil
        </CardTitle>
        <CardDescription>
          Como estudiante puedes ampliar tu presencia en Talento y en el
          Directorio de emprendimientos desde esos módulos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="layout-list-grid">
          <Link
            href="/dashboard/talento-perfiles"
            className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <NavModuleCard className="h-full">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="text-base">Talento</CardTitle>
                <CardDescription>
                  Crea o edita tu perfil de talento
                </CardDescription>
              </CardHeader>
            </NavModuleCard>
          </Link>
          <Link
            href="/dashboard/directorio-emprendimientos"
            className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <NavModuleCard className="h-full">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="text-base">
                  Directorio emprendimientos
                </CardTitle>
                <CardDescription>
                  Publica o actualiza tu emprendimiento
                </CardDescription>
              </CardHeader>
            </NavModuleCard>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
