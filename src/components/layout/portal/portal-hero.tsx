import type { CategoriaUsuarioExterno } from "@/modules/shared/types/enums";

import { portalCategoriaLabel } from "@/modules/auth/lib/portal-ux";

type PortalHeroProps = {
  categoria: CategoriaUsuarioExterno;
};

export function PortalHero({ categoria }: PortalHeroProps) {
  const roleLabel = portalCategoriaLabel(categoria);

  return (
    <section
      className="layout-portal-hero relative flex flex-col items-center justify-center px-4 py-12 text-center"
      aria-labelledby="portal-hero-title"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-muted"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-foreground/60"
        aria-hidden
      />
      <div className="relative flex flex-col items-center gap-2">
        <p className="text-lg text-primary-foreground/90">Servicios para</p>
        <h1
          id="portal-hero-title"
          className="font-heading text-4xl font-semibold tracking-tight text-primary-foreground sm:text-5xl"
        >
          {roleLabel}
        </h1>
      </div>
    </section>
  );
}
