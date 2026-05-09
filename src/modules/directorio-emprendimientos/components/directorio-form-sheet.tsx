"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";

import type { DirectorioEmprendimientoResponseDto } from "@/api/generated/models";
import { CreateDirectorioEmprendimientoDtoAreaCreativa } from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { cn } from "@/lib/utils";
import {
  useCreateDirectorioMutation,
  useUpdateDirectorioMutation,
} from "@/modules/directorio-emprendimientos/hooks/use-directorio-mutations";
import {
  buildCreateDirectorioDto,
  buildUpdateDirectorioDto,
  directorioFormSchema,
  directorioResponseToFormValues,
  emptyDirectorioFormValues,
  type DirectorioFormValues,
} from "@/modules/directorio-emprendimientos/schemas/directorio-schema";

const textareaClassName = cn(
  "min-h-[88px] w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-2 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
);

const AREA_LABELS: Record<
  CreateDirectorioEmprendimientoDtoAreaCreativa,
  string
> = {
  [CreateDirectorioEmprendimientoDtoAreaCreativa.ARTES_PLASTICAS]:
    "Artes plásticas",
  [CreateDirectorioEmprendimientoDtoAreaCreativa.MUSICA]: "Música",
  [CreateDirectorioEmprendimientoDtoAreaCreativa.DISENO]: "Diseño",
  [CreateDirectorioEmprendimientoDtoAreaCreativa.AUDIOVISUAL]: "Audiovisual",
};

export type DirectorioFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  row: DirectorioEmprendimientoResponseDto | null;
};

export function DirectorioFormSheet({
  open,
  onOpenChange,
  mode,
  row,
}: DirectorioFormSheetProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const createMut = useCreateDirectorioMutation();
  const updateMut = useUpdateDirectorioMutation();

  const form = useForm<DirectorioFormValues>({
    resolver: zodResolver(
      directorioFormSchema,
    ) as Resolver<DirectorioFormValues>,
    defaultValues: emptyDirectorioFormValues(),
  });

  useEffect(() => {
    if (!open) {
      setApiError(null);
      return;
    }
    if (mode === "create") {
      form.reset(emptyDirectorioFormValues());
      return;
    }
    if (row) {
      form.reset(directorioResponseToFormValues(row));
    }
  }, [open, mode, row, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: DirectorioFormValues) {
    setApiError(null);
    try {
      if (mode === "create") {
        await createMut.mutateAsync(buildCreateDirectorioDto(values));
      } else if (row) {
        await updateMut.mutateAsync({
          id: row.id,
          body: buildUpdateDirectorioDto(values),
        });
      }
      onOpenChange(false);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-lg flex-col gap-0 overflow-y-auto sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle>
            {mode === "create"
              ? "Registrar emprendimiento"
              : "Editar emprendimiento"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "El registro quedará asociado a tu cuenta de usuario."
              : "Actualizá los datos del emprendimiento."}
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-1 flex-col gap-4 px-4 py-4"
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        >
          {apiError ? (
            <p
              role="alert"
              className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {apiError}
            </p>
          ) : null}

          <FieldSet className="space-y-4 border-none p-0">
            <FieldLegend variant="label">Perfil del proyecto</FieldLegend>
            <FieldGroup className="gap-4">
              <Field data-invalid={!!form.formState.errors.nombreProyecto}>
                <FieldLabel htmlFor="dir-nombre">
                  Nombre del proyecto
                </FieldLabel>
                <Input
                  id="dir-nombre"
                  aria-invalid={!!form.formState.errors.nombreProyecto}
                  {...form.register("nombreProyecto")}
                />
                <FieldError errors={[form.formState.errors.nombreProyecto]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.areaCreativa}>
                <FieldLabel>Área creativa</FieldLabel>
                <Controller
                  control={form.control}
                  name="areaCreativa"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger size="default" className="w-full">
                        <SelectValue placeholder="Área" />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.values(
                            CreateDirectorioEmprendimientoDtoAreaCreativa,
                          ) as CreateDirectorioEmprendimientoDtoAreaCreativa[]
                        ).map((v) => (
                          <SelectItem key={v} value={v}>
                            {AREA_LABELS[v]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.areaCreativa]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.descripcionCorta}>
                <FieldLabel htmlFor="dir-desc">
                  Descripción corta (máx. 500)
                </FieldLabel>
                <textarea
                  id="dir-desc"
                  className={textareaClassName}
                  aria-invalid={!!form.formState.errors.descripcionCorta}
                  {...form.register("descripcionCorta")}
                />
                <FieldError errors={[form.formState.errors.descripcionCorta]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.imagenUrl}>
                <FieldLabel htmlFor="dir-img">Imagen URL (opcional)</FieldLabel>
                <Input id="dir-img" {...form.register("imagenUrl")} />
                <FieldError errors={[form.formState.errors.imagenUrl]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.correo}>
                <FieldLabel htmlFor="dir-correo">Correo (opcional)</FieldLabel>
                <Input
                  id="dir-correo"
                  type="email"
                  autoComplete="email"
                  {...form.register("correo")}
                />
                <FieldError errors={[form.formState.errors.correo]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.sitioWeb}>
                <FieldLabel htmlFor="dir-web">Sitio web (opcional)</FieldLabel>
                <Input id="dir-web" {...form.register("sitioWeb")} />
                <FieldError errors={[form.formState.errors.sitioWeb]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.redes}>
                <FieldLabel htmlFor="dir-redes">Redes (opcional)</FieldLabel>
                <Input
                  id="dir-redes"
                  placeholder="Instagram, Facebook, etc."
                  {...form.register("redes")}
                />
                <FieldError errors={[form.formState.errors.redes]} />
              </Field>

              <Controller
                control={form.control}
                name="perfilActivo"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor="dir-activo">Perfil activo</FieldLabel>
                    <input
                      id="dir-activo"
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t border-border bg-popover p-4">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {mode === "create" ? "Registrar" : "Guardar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
