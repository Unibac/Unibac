import Link from "next/link";

import { UnibacLogo } from "@/components/shared/unibac-logo";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <Link
          href="/"
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Inicio Unibac Contigo"
        >
          <UnibacLogo priority imgClassName="max-h-10 sm:max-h-12" />
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" asChild>
            <a
              href="https://unibac.edu.co/webnueva/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sitio institucional
            </a>
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button type="button" size="sm" asChild>
            <Link href="/register">Registrarse</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
