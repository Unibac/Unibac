"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";

import {
  CreatePropuestaFeriaDtoAreaCreativa,
  type PropuestaFeriaResponseDto,
} from "@/api/generated/models";
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
  useCreatePropuestaMutation,
  useUpdateMisPropuestaMutation,
  useUploadPropuestaImagenMutation,
} from "@/modules/ferias/hooks/use-ferias-mutations";
import {
  buildCreatePropuestaFeriaDto,
  buildUpdatePropuestaFeriaDto,
  emptyPropuestaFeriaFormValues,
  type PropuestaFeriaFormValues,
  propuestaFeriaFormSchema,
  propuestaFeriaResponseToFormValues,
} from "@/modules/ferias/schemas/propuesta-feria-schema";

const textareaClassName = cn(
  "min-h-[88px] w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-2 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
);

const AREA_LABELS: Record<CreatePropuestaFeriaDtoAreaCreativa, string> = {
  [CreatePropuestaFeriaDtoAreaCreativa.ARTES_PLASTICAS]: "Artes plásticas",
  [CreatePropuestaFeriaDtoAreaCreativa.MUSICA]: "Música",
  [CreatePropuestaFeriaDtoAreaCreativa.DISENO]: "Diseño",
  [CreatePropuestaFeriaDtoAreaCreativa.AUDIOVISUAL]: "Audiovisual",
};

export type PropuestaFeriaFormSheetProps = {
  feriaId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  row: PropuestaFeriaResponseDto | null;
};

export function PropuestaFeriaFormSheet({
  feriaId,
  open,
  onOpenChange,
  mode,
  row,
}: PropuestaFeriaFormSheetProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const imagenInputRef = useRef<HTMLInputElement>(null);
  const createMut = useCreatePropuestaMutation();
  const updateMut = useUpdateMisPropuestaMutation();
  const uploadImagenMut = useUploadPropuestaImagenMutation(feriaId);

  const form = useForm<PropuestaFeriaFormValues>({
    resolver: zodResolver(
      propuestaFeriaFormSchema,
    ) as Resolver<PropuestaFeriaFormValues>,
    defaultValues: emptyPropuestaFeriaFormValues(),
  });

  useEffect(() => {
    if (!open) {
      setApiError(null);
      return;
    }
    if (mode === "create") {
      form.reset(emptyPropuestaFeriaFormValues());
      return;
    }
    if (row) {
      form.reset(propuestaFeriaResponseToFormValues(row));
    }
  }, [open, mode, row, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onImagenSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setApiError(null);
    try {
      const res = await uploadImagenMut.mutateAsync(file);
      form.setValue("imagenUrl", res.imagenUrl, { shouldValidate: true });
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
    if (imagenInputRef.current) imagenInputRef.current.value = "";
  }

  async function onSubmit(values: PropuestaFeriaFormValues) {
    setApiError(null);
    try {
      if (mode === "create") {
        await createMut.mutateAsync({
          feriaId,
          body: buildCreatePropuestaFeriaDto(values),
        });
      } else if (row) {
        await updateMut.mutateAsync({
          propuestaId: row.id,
          body: buildUpdatePropuestaFeriaDto(values),
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
            {mode === "create" ? "Registrar propuesta" : "Editar mi propuesta"}
          </SheetTitle>
          <SheetDescription>
            Datos del emprendimiento para esta feria. La moderación la realiza
            un administrador.
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
            <FieldLegend variant="label">Emprendimiento</FieldLegend>
            <FieldGroup className="gap-4">
              <Field
                data-invalid={!!form.formState.errors.nombreEmprendimiento}
              >
                <FieldLabel htmlFor="prop-nombre">
                  Nombre del emprendimiento
                </FieldLabel>
                <Input
                  id="prop-nombre"
                  aria-invalid={!!form.formState.errors.nombreEmprendimiento}
                  {...form.register("nombreEmprendimiento")}
                />
                <FieldError
                  errors={[form.formState.errors.nombreEmprendimiento]}
                />
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
                            CreatePropuestaFeriaDtoAreaCreativa,
                          ) as CreatePropuestaFeriaDtoAreaCreativa[]
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
                <FieldLabel htmlFor="prop-desc">
                  Descripción corta (máx. 500)
                </FieldLabel>
                <textarea
                  id="prop-desc"
                  className={textareaClassName}
                  aria-invalid={!!form.formState.errors.descripcionCorta}
                  {...form.register("descripcionCorta")}
                />
                <FieldError errors={[form.formState.errors.descripcionCorta]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="prop-img-file">
                  Imagen (archivo, opcional)
                </FieldLabel>
                <Input
                  ref={imagenInputRef}
                  id="prop-img-file"
                  type="file"
                  accept="image/*"
                  disabled={uploadImagenMut.isPending}
                  className="text-xs"
                  onChange={(e) => void onImagenSelected(e.target.files)}
                />
                {uploadImagenMut.isPending ? (
                  <p className="text-xs text-muted-foreground">Subiendo…</p>
                ) : null}
              </Field>

              <Field data-invalid={!!form.formState.errors.imagenUrl}>
                <FieldLabel htmlFor="prop-img-url">
                  URL de imagen (opcional)
                </FieldLabel>
                <Input
                  id="prop-img-url"
                  type="url"
                  placeholder="https://"
                  {...form.register("imagenUrl")}
                />
                <FieldError errors={[form.formState.errors.imagenUrl]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.correo}>
                <FieldLabel htmlFor="prop-correo">Correo</FieldLabel>
                <Input
                  id="prop-correo"
                  type="email"
                  autoComplete="email"
                  {...form.register("correo")}
                />
                <FieldError errors={[form.formState.errors.correo]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.celular}>
                <FieldLabel htmlFor="prop-cel">Celular (opcional)</FieldLabel>
                <Input
                  id="prop-cel"
                  type="tel"
                  autoComplete="tel"
                  {...form.register("celular")}
                />
                <FieldError errors={[form.formState.errors.celular]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.redesContacto}>
                <FieldLabel htmlFor="prop-redes">
                  Redes / contacto (opcional)
                </FieldLabel>
                <Input id="prop-redes" {...form.register("redesContacto")} />
                <FieldError errors={[form.formState.errors.redesContacto]} />
              </Field>
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
