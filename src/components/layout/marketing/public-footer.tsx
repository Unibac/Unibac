export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground lg:px-6">
        <p className="font-medium text-foreground">
          Institución Universitaria Bellas Artes y Ciencias de Bolívar
        </p>
        <p>Cartagena — Bolívar. Carrera 9 No. 39-12, Barrio San Diego</p>
        <p>Teléfono: (605) 672 4603</p>
        <p>
          Correo:{" "}
          <a
            href="mailto:info@unibac.edu.co"
            className="underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
          >
            info@unibac.edu.co
          </a>
        </p>
        <p className="text-xs">Vigilada MinEducación</p>
      </div>
    </footer>
  );
}
