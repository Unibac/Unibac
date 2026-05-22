import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-12 lg:px-6 lg:py-16">
      <div className="flex max-w-2xl flex-col gap-4">
        <p className="text-sm font-medium text-muted-foreground">
          Portal de servicios digitales
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Unibac Contigo
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Accedé a convocatorias de emprendimiento, ferias virtuales, banco de
          talento y directorio de emprendimientos. Estudiantes, egresados y
          empresas pueden registrarse y gestionar su perfil en un solo lugar.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" asChild>
          <Link href="/login">Iniciar sesión</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/register">Crear cuenta externa</Link>
        </Button>
        <Button type="button" variant="secondary" asChild>
          <Link href="/dashboard">Ir al panel</Link>
        </Button>
      </div>
    </section>
  );
}
