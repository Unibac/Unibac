"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";

import type { PublicacionEmprendimientoResponseDto } from "@/api/generated/models";
import { CreatePublicacionConvocatoriaDtoTipoConvocatoria } from "@/api/generated/models";
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
  useCreateConvocatoriaMutation,
  useUpdateConvocatoriaMutation,
} from "@/modules/convocatorias-emprendimiento/hooks/use-convocatorias-mutations";
import {
  buildCreateConvocatoriaDto,
  buildUpdateConvocatoriaDto,
  convocatoriaFormSchema,
  convocatoriaResponseToFormValues,
  emptyConvocatoriaFormValues,
  type ConvocatoriaFormValues,
} from "@/modules/convocatorias-emprendimiento/schemas/convocatoria-schema";

const textareaClassName = cn(
  "min-h-[88px] w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-2 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
);

const TIPO_LABELS: Record<
  CreatePublicacionConvocatoriaDtoTipoConvocatoria,
  string
> = {
  [CreatePublicacionConvocatoriaDtoTipoConvocatoria.FINANCIAMIENTO]:
    "Financiamiento",
  [CreatePublicacionConvocatoriaDtoTipoConvocatoria.FORMACION]: "Formación",
  [CreatePublicacionConvocatoriaDtoTipoConvocatoria.PRACTICAS]: "Prácticas",
};

export type ConvocatoriaFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  row: PublicacionEmprendimientoResponseDto | null;
};

export function ConvocatoriaFormSheet({
  open,
  onOpenChange,
  mode,
  row,
}: ConvocatoriaFormSheetProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const createMut = useCreateConvocatoriaMutation();
  const updateMut = useUpdateConvocatoriaMutation();

  const form = useForm<ConvocatoriaFormValues>({
    resolver: zodResolver(
      convocatoriaFormSchema,
    ) as Resolver<ConvocatoriaFormValues>,
    defaultValues: emptyConvocatoriaFormValues(),
  });

  useEffect(() => {
    if (!open) {
      setApiError(null);
      return;
    }
    if (mode === "create") {
      form.reset(emptyConvocatoriaFormValues());
      return;
    }
    if (row) {
      form.reset(convocatoriaResponseToFormValues(row));
    }
  }, [open, mode, row, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: ConvocatoriaFormValues) {
    setApiError(null);
    try {
      if (mode === "create") {
        await createMut.mutateAsync(buildCreateConvocatoriaDto(values));
      } else if (row) {
        await updateMut.mutateAsync({
          id: row.id,
          body: buildUpdateConvocatoriaDto(values),
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
            {mode === "create" ? "Nueva convocatoria" : "Editar convocatoria"}
          </SheetTitle>
          <SheetDescription>
            Definí el contenido, fecha límite y visibilidad.
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
            <FieldLegend variant="label">Contenido</FieldLegend>
            <FieldGroup className="gap-4">
              <Field data-invalid={!!form.formState.errors.titulo}>
                <FieldLabel htmlFor="cv-titulo">Título</FieldLabel>
                <Input
                  id="cv-titulo"
                  aria-invalid={!!form.formState.errors.titulo}
                  {...form.register("titulo")}
                />
                <FieldError errors={[form.formState.errors.titulo]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.tipoConvocatoria}>
                <FieldLabel>Tipo de convocatoria</FieldLabel>
                <Controller
                  control={form.control}
                  name="tipoConvocatoria"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger size="default" className="w-full">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.values(
                            CreatePublicacionConvocatoriaDtoTipoConvocatoria,
                          ) as CreatePublicacionConvocatoriaDtoTipoConvocatoria[]
                        ).map((v) => (
                          <SelectItem key={v} value={v}>
                            {TIPO_LABELS[v]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.tipoConvocatoria]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.descripcion}>
                <FieldLabel htmlFor="cv-desc">Descripción</FieldLabel>
                <textarea
                  id="cv-desc"
                  className={textareaClassName}
                  aria-invalid={!!form.formState.errors.descripcion}
                  {...form.register("descripcion")}
                />
                <FieldError errors={[form.formState.errors.descripcion]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.convocados}>
                <FieldLabel htmlFor="cv-convocados">
                  Convocados (texto)
                </FieldLabel>
                <textarea
                  id="cv-convocados"
                  className={textareaClassName}
                  aria-invalid={!!form.formState.errors.convocados}
                  {...form.register("convocados")}
                />
                <FieldError errors={[form.formState.errors.convocados]} />
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet className="space-y-4 border-none p-0">
            <FieldLegend variant="label">Publicación</FieldLegend>
            <FieldGroup className="gap-4">
              <Field data-invalid={!!form.formState.errors.fechaLimite}>
                <FieldLabel htmlFor="cv-fecha">Fecha límite (ISO)</FieldLabel>
                <Input
                  id="cv-fecha"
                  placeholder="2026-05-08T00:00:00.000Z"
                  aria-invalid={!!form.formState.errors.fechaLimite}
                  {...form.register("fechaLimite")}
                />
                <FieldError errors={[form.formState.errors.fechaLimite]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.montoTipoApoyo}>
                <FieldLabel htmlFor="cv-monto">
                  Monto / tipo de apoyo (opcional)
                </FieldLabel>
                <Input id="cv-monto" {...form.register("montoTipoApoyo")} />
                <FieldError errors={[form.formState.errors.montoTipoApoyo]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.linkExterno}>
                <FieldLabel htmlFor="cv-link">
                  Link externo (opcional)
                </FieldLabel>
                <Input id="cv-link" {...form.register("linkExterno")} />
                <FieldError errors={[form.formState.errors.linkExterno]} />
              </Field>

              <Controller
                control={form.control}
                name="activo"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor="cv-activo">Activa</FieldLabel>
                    <input
                      id="cv-activo"
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
              {mode === "create" ? "Crear" : "Guardar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
