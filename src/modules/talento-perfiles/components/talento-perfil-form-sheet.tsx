"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, type Resolver, useForm } from "react-hook-form";

import type { TalentoPerfilResponseDto } from "@/api/generated/models";
import {
  CreateTalentoPerfilDtoArea,
  CreateTalentoPerfilDtoTipoPerfil,
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
  useCreateTalentoMutation,
  useUpdateTalentoMutation,
} from "@/modules/talento-perfiles/hooks/use-talento-mutations";
import {
  buildCreateTalentoDto,
  buildUpdateTalentoDto,
  emptyTalentoPerfilFormValues,
  type TalentoPerfilFormValues,
  talentoPerfilFormSchema,
  talentoResponseToFormValues,
} from "@/modules/talento-perfiles/schemas/talento-perfil-schema";

const textareaClassName = cn(
  "min-h-[88px] w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-2 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
);

const AREA_LABELS: Record<CreateTalentoPerfilDtoArea, string> = {
  [CreateTalentoPerfilDtoArea.MUSICA]: "Música",
  [CreateTalentoPerfilDtoArea.ARTES_PLASTICAS]: "Artes plásticas",
  [CreateTalentoPerfilDtoArea.DISENO]: "Diseño",
  [CreateTalentoPerfilDtoArea.AUDIOVISUAL]: "Audiovisual",
  [CreateTalentoPerfilDtoArea.ARTES_ESCENICAS]: "Artes escénicas",
};

const TIPO_PERFIL_LABELS: Record<CreateTalentoPerfilDtoTipoPerfil, string> = {
  [CreateTalentoPerfilDtoTipoPerfil.ESTUDIANTE]: "Estudiante",
  [CreateTalentoPerfilDtoTipoPerfil.EGRESADO]: "Egresado",
  [CreateTalentoPerfilDtoTipoPerfil.EMPRENDEDOR]: "Emprendedor",
};

export type TalentoPerfilFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  row: TalentoPerfilResponseDto | null;
};

export function TalentoPerfilFormSheet({
  open,
  onOpenChange,
  mode,
  row,
}: TalentoPerfilFormSheetProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const createMut = useCreateTalentoMutation();
  const updateMut = useUpdateTalentoMutation();

  const form = useForm<TalentoPerfilFormValues>({
    resolver: zodResolver(
      talentoPerfilFormSchema,
    ) as Resolver<TalentoPerfilFormValues>,
    defaultValues: emptyTalentoPerfilFormValues(),
  });

  useEffect(() => {
    if (!open) {
      setApiError(null);
      return;
    }
    if (mode === "create") {
      form.reset(emptyTalentoPerfilFormValues());
      return;
    }
    if (row) {
      form.reset(talentoResponseToFormValues(row));
    }
  }, [open, mode, row, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: TalentoPerfilFormValues) {
    setApiError(null);
    try {
      if (mode === "create") {
        await createMut.mutateAsync(buildCreateTalentoDto(values));
      } else if (row) {
        await updateMut.mutateAsync({
          id: row.id,
          body: buildUpdateTalentoDto(values),
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
              ? "Registrar perfil de talento"
              : "Editar perfil de talento"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "El perfil quedará asociado a tu cuenta de usuario."
              : "Actualizá los datos del perfil."}
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
            <FieldLegend variant="label">Datos del perfil</FieldLegend>
            <FieldGroup className="gap-4">
              <Field data-invalid={!!form.formState.errors.nombreCompleto}>
                <FieldLabel htmlFor="talento-nombre">
                  Nombre completo
                </FieldLabel>
                <Input
                  id="talento-nombre"
                  aria-invalid={!!form.formState.errors.nombreCompleto}
                  {...form.register("nombreCompleto")}
                />
                <FieldError errors={[form.formState.errors.nombreCompleto]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.area}>
                <FieldLabel>Área</FieldLabel>
                <Controller
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger size="default" className="w-full">
                        <SelectValue placeholder="Área" />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.values(
                            CreateTalentoPerfilDtoArea,
                          ) as CreateTalentoPerfilDtoArea[]
                        ).map((v) => (
                          <SelectItem key={v} value={v}>
                            {AREA_LABELS[v]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.area]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.tipoPerfil}>
                <FieldLabel>Tipo de perfil</FieldLabel>
                <Controller
                  control={form.control}
                  name="tipoPerfil"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger size="default" className="w-full">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.values(
                            CreateTalentoPerfilDtoTipoPerfil,
                          ) as CreateTalentoPerfilDtoTipoPerfil[]
                        ).map((v) => (
                          <SelectItem key={v} value={v}>
                            {TIPO_PERFIL_LABELS[v]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.tipoPerfil]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.habilidades}>
                <FieldLabel htmlFor="talento-habilidades">
                  Habilidades
                </FieldLabel>
                <textarea
                  id="talento-habilidades"
                  className={textareaClassName}
                  aria-invalid={!!form.formState.errors.habilidades}
                  {...form.register("habilidades")}
                />
                <FieldError errors={[form.formState.errors.habilidades]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.portafolioUrl}>
                <FieldLabel htmlFor="talento-portafolio">
                  Portafolio (URL, opcional)
                </FieldLabel>
                <Input
                  id="talento-portafolio"
                  type="url"
                  inputMode="url"
                  placeholder="https://"
                  {...form.register("portafolioUrl")}
                />
                <FieldError errors={[form.formState.errors.portafolioUrl]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.telefono}>
                <FieldLabel htmlFor="talento-telefono">
                  Teléfono (opcional)
                </FieldLabel>
                <Input
                  id="talento-telefono"
                  type="tel"
                  autoComplete="tel"
                  {...form.register("telefono")}
                />
                <FieldError errors={[form.formState.errors.telefono]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.correoContacto}>
                <FieldLabel htmlFor="talento-correo">
                  Correo de contacto (opcional)
                </FieldLabel>
                <Input
                  id="talento-correo"
                  type="email"
                  autoComplete="email"
                  {...form.register("correoContacto")}
                />
                <FieldError errors={[form.formState.errors.correoContacto]} />
              </Field>

              <Controller
                control={form.control}
                name="perfilActivo"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor="talento-activo">
                      Perfil activo
                    </FieldLabel>
                    <input
                      id="talento-activo"
                      type="checkbox"
                      className="size-4 accent-primary transition-colors duration-150"
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
