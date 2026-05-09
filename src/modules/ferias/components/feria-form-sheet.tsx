"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

import type { FeriaResponseDto } from "@/api/generated/models";
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
  useCreateFeriaMutation,
  useUpdateFeriaMutation,
  useUploadFeriaBannerMutation,
} from "@/modules/ferias/hooks/use-ferias-mutations";
import {
  buildCreateFeriaDto,
  buildUpdateFeriaDto,
  emptyFeriaFormValues,
  type FeriaFormValues,
  feriaFormSchema,
  feriaResponseToFormValues,
} from "@/modules/ferias/schemas/feria-schema";

const textareaClassName = cn(
  "min-h-[88px] w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-2 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
);

export type FeriaFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  row: FeriaResponseDto | null;
};

export function FeriaFormSheet({
  open,
  onOpenChange,
  mode,
  row,
}: FeriaFormSheetProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const createMut = useCreateFeriaMutation();
  const updateMut = useUpdateFeriaMutation();
  const uploadBannerMut = useUploadFeriaBannerMutation();

  const form = useForm<FeriaFormValues>({
    resolver: zodResolver(feriaFormSchema) as Resolver<FeriaFormValues>,
    defaultValues: emptyFeriaFormValues(),
  });

  useEffect(() => {
    if (!open) {
      setApiError(null);
      return;
    }
    if (mode === "create") {
      form.reset(emptyFeriaFormValues());
      return;
    }
    if (row) {
      form.reset(feriaResponseToFormValues(row));
    }
  }, [open, mode, row, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onBannerSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setApiError(null);
    try {
      const res = await uploadBannerMut.mutateAsync(file);
      form.setValue("imagenBannerUrl", res.imagenBannerUrl, {
        shouldValidate: true,
      });
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  }

  async function onSubmit(values: FeriaFormValues) {
    setApiError(null);
    try {
      if (mode === "create") {
        await createMut.mutateAsync(buildCreateFeriaDto(values));
      } else if (row) {
        await updateMut.mutateAsync({
          id: row.id,
          body: buildUpdateFeriaDto(values),
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
            {mode === "create" ? "Nueva feria virtual" : "Editar feria"}
          </SheetTitle>
          <SheetDescription>
            Definí fechas inclusivas, descripción y opcionalmente un banner.
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
            <FieldLegend variant="label">Datos generales</FieldLegend>
            <FieldGroup className="gap-4">
              <Field data-invalid={!!form.formState.errors.nombre}>
                <FieldLabel htmlFor="feria-nombre">Nombre</FieldLabel>
                <Input
                  id="feria-nombre"
                  aria-invalid={!!form.formState.errors.nombre}
                  {...form.register("nombre")}
                />
                <FieldError errors={[form.formState.errors.nombre]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.descripcion}>
                <FieldLabel htmlFor="feria-desc">Descripción</FieldLabel>
                <textarea
                  id="feria-desc"
                  className={textareaClassName}
                  aria-invalid={!!form.formState.errors.descripcion}
                  {...form.register("descripcion")}
                />
                <FieldError errors={[form.formState.errors.descripcion]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.fechaInicioLocal}>
                <FieldLabel htmlFor="feria-inicio">
                  Inicio (fecha y hora local)
                </FieldLabel>
                <Input
                  id="feria-inicio"
                  type="datetime-local"
                  aria-invalid={!!form.formState.errors.fechaInicioLocal}
                  {...form.register("fechaInicioLocal")}
                />
                <FieldError errors={[form.formState.errors.fechaInicioLocal]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.fechaFinLocal}>
                <FieldLabel htmlFor="feria-fin">
                  Fin (fecha y hora local)
                </FieldLabel>
                <Input
                  id="feria-fin"
                  type="datetime-local"
                  aria-invalid={!!form.formState.errors.fechaFinLocal}
                  {...form.register("fechaFinLocal")}
                />
                <FieldError errors={[form.formState.errors.fechaFinLocal]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="feria-banner-file">
                  Banner (archivo, opcional)
                </FieldLabel>
                <Input
                  ref={bannerInputRef}
                  id="feria-banner-file"
                  type="file"
                  accept="image/*"
                  disabled={uploadBannerMut.isPending}
                  className="text-xs"
                  onChange={(e) => void onBannerSelected(e.target.files)}
                />
                {uploadBannerMut.isPending ? (
                  <p className="text-xs text-muted-foreground">Subiendo…</p>
                ) : null}
              </Field>

              <Field data-invalid={!!form.formState.errors.imagenBannerUrl}>
                <FieldLabel htmlFor="feria-banner-url">
                  URL del banner (opcional)
                </FieldLabel>
                <Input
                  id="feria-banner-url"
                  type="url"
                  placeholder="https://"
                  {...form.register("imagenBannerUrl")}
                />
                <FieldError errors={[form.formState.errors.imagenBannerUrl]} />
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
              {mode === "create" ? "Crear" : "Guardar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
