"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Controller,
  useForm,
  type Resolver,
} from "react-hook-form";

import type { EgresadoResponseDto } from "@/api/generated/models";
import { CreateEgresadoDtoEstadoLaboral } from "@/api/generated/models";
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
  useCreateEgresadoMutation,
  useUpdateEgresadoMutation,
} from "@/modules/egresados/hooks/use-egresado-mutations";
import {
  buildCreateEgresadoDto,
  buildUpdateEgresadoDto,
  egresadoFormSchema,
  egresadoResponseToFormValues,
  emptyEgresadoFormValues,
  type EgresadoFormValues,
} from "@/modules/egresados/schemas/egresado-schema";

const textareaClassName = cn(
  "min-h-[88px] w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-2 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
);

const ESTADO_LABELS: Record<CreateEgresadoDtoEstadoLaboral, string> = {
  [CreateEgresadoDtoEstadoLaboral.EMPLEADO]: "Empleado",
  [CreateEgresadoDtoEstadoLaboral.EMPRENDEDOR]: "Emprendedor",
  [CreateEgresadoDtoEstadoLaboral.DESEMPLEADO]: "Desempleado",
  [CreateEgresadoDtoEstadoLaboral.ESTUDIANDO]: "Estudiando",
};

export type EgresadoFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  egresado: EgresadoResponseDto | null;
};

export function EgresadoFormSheet({
  open,
  onOpenChange,
  mode,
  egresado,
}: EgresadoFormSheetProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const createMut = useCreateEgresadoMutation();
  const updateMut = useUpdateEgresadoMutation();

  const form = useForm<EgresadoFormValues>({
    resolver: zodResolver(egresadoFormSchema) as Resolver<EgresadoFormValues>,
    defaultValues: emptyEgresadoFormValues(),
  });

  useEffect(() => {
    if (!open) {
      setApiError(null);
      return;
    }
    if (mode === "create") {
      form.reset(emptyEgresadoFormValues());
      return;
    }
    if (egresado) {
      form.reset(egresadoResponseToFormValues(egresado));
    }
  }, [open, mode, egresado, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: EgresadoFormValues) {
    setApiError(null);
    try {
      if (mode === "create") {
        await createMut.mutateAsync(buildCreateEgresadoDto(values));
      } else if (egresado) {
        await updateMut.mutateAsync({
          id: egresado.id,
          body: buildUpdateEgresadoDto(values),
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
              ? "Registrar perfil de egresado"
              : "Editar egresado"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "El registro quedará asociado a tu cuenta de usuario."
              : "Actualizá los datos del egresado."}
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
            <FieldLegend variant="label">Datos personales</FieldLegend>
            <FieldGroup className="gap-4">
              <Field data-invalid={!!form.formState.errors.nombreCompleto}>
                <FieldLabel htmlFor="eg-nombre">Nombre completo</FieldLabel>
                <Input
                  id="eg-nombre"
                  autoComplete="name"
                  aria-invalid={!!form.formState.errors.nombreCompleto}
                  {...form.register("nombreCompleto")}
                />
                <FieldError errors={[form.formState.errors.nombreCompleto]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.identificacion}>
                <FieldLabel htmlFor="eg-id">Identificación</FieldLabel>
                <Input
                  id="eg-id"
                  autoComplete="off"
                  aria-invalid={!!form.formState.errors.identificacion}
                  {...form.register("identificacion")}
                />
                <FieldError errors={[form.formState.errors.identificacion]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.telefono}>
                <FieldLabel htmlFor="eg-tel">Teléfono (opcional)</FieldLabel>
                <Input
                  id="eg-tel"
                  type="tel"
                  autoComplete="tel"
                  {...form.register("telefono")}
                />
                <FieldError errors={[form.formState.errors.telefono]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.correo}>
                <FieldLabel htmlFor="eg-correo">Correo</FieldLabel>
                <Input
                  id="eg-correo"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!form.formState.errors.correo}
                  {...form.register("correo")}
                />
                <FieldError errors={[form.formState.errors.correo]} />
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSet className="space-y-4 border-none p-0">
            <FieldLegend variant="label">Formación y empleo</FieldLegend>
            <FieldGroup className="gap-4">
              <Field data-invalid={!!form.formState.errors.anioEgreso}>
                <FieldLabel htmlFor="eg-anio">Año de egreso</FieldLabel>
                <Input
                  id="eg-anio"
                  type="number"
                  aria-invalid={!!form.formState.errors.anioEgreso}
                  {...form.register("anioEgreso", { valueAsNumber: true })}
                />
                <FieldError errors={[form.formState.errors.anioEgreso]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.programaCarrera}>
                <FieldLabel htmlFor="eg-carrera">Programa o carrera</FieldLabel>
                <Input
                  id="eg-carrera"
                  aria-invalid={!!form.formState.errors.programaCarrera}
                  {...form.register("programaCarrera")}
                />
                <FieldError
                  errors={[form.formState.errors.programaCarrera]}
                />
              </Field>

              <Field data-invalid={!!form.formState.errors.estadoLaboral}>
                <FieldLabel>Estado laboral</FieldLabel>
                <Controller
                  control={form.control}
                  name="estadoLaboral"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger size="default" className="w-full">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.values(
                            CreateEgresadoDtoEstadoLaboral,
                          ) as CreateEgresadoDtoEstadoLaboral[]
                        ).map((v) => (
                          <SelectItem key={v} value={v}>
                            {ESTADO_LABELS[v]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[form.formState.errors.estadoLaboral]} />
              </Field>

              <Field
                data-invalid={!!form.formState.errors.brevePerfilProfesional}
              >
                <FieldLabel htmlFor="eg-perfil">Perfil profesional</FieldLabel>
                <textarea
                  id="eg-perfil"
                  className={textareaClassName}
                  aria-invalid={!!form.formState.errors.brevePerfilProfesional}
                  {...form.register("brevePerfilProfesional")}
                />
                <FieldError
                  errors={[form.formState.errors.brevePerfilProfesional]}
                />
              </Field>

              <Field
                data-invalid={!!form.formState.errors.informacionEmprendimiento}
              >
                <FieldLabel htmlFor="eg-emp">
                  Información de emprendimiento (opcional)
                </FieldLabel>
                <textarea
                  id="eg-emp"
                  className={textareaClassName}
                  aria-invalid={
                    !!form.formState.errors.informacionEmprendimiento
                  }
                  {...form.register("informacionEmprendimiento")}
                />
                <FieldError
                  errors={[form.formState.errors.informacionEmprendimiento]}
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <SheetFooter className="mt-auto flex-row gap-2 border-t border-border pt-4">
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
