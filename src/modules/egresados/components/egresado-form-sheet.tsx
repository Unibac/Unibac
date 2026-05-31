"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

import type { EgresadoResponseDto } from "@/modules/shared/types/api-models";
import { EstadoLaboralEgresado } from "@/modules/shared/types/api-models";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { getApiErrorMessage } from "@/lib/api/error-message";
import { cn } from "@/lib/utils";
import {
  useCreateEgresadoMutation,
  useUpdateEgresadoMutation,
} from "@/modules/egresados/hooks/use-egresado-mutations";
import {
  buildCreateEgresadoDto,
  buildUpdateEgresadoDto,
  type EgresadoFormValues,
  egresadoFormSchema,
  egresadoResponseToFormValues,
  emptyEgresadoFormValues,
} from "@/modules/egresados/schemas/egresado-schema";

const textareaClassName = cn(
  "flex min-h-[88px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 md:text-sm",
);

const ESTADO_LABELS: Record<EstadoLaboralEgresado, string> = {
  [EstadoLaboralEgresado.EMPLEADO]: "Empleado",
  [EstadoLaboralEgresado.EMPRENDEDOR]: "Emprendedor",
  [EstadoLaboralEgresado.DESEMPLEADO]: "Desempleado",
  [EstadoLaboralEgresado.ESTUDIANDO]: "Estudiando",
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

        <Form {...form}>
          <form
            className="flex flex-1 flex-col gap-4 px-4 py-4"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            {apiError ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {apiError}
              </p>
            ) : null}

            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-foreground">
                Datos personales
              </p>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="nombreCompleto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="identificacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identificación</FormLabel>
                      <FormControl>
                        <Input autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (opcional)</FormLabel>
                      <FormControl>
                        <Input type="tel" autoComplete="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-foreground">
                Formación y empleo
              </p>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="anioEgreso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año de egreso</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={
                            Number.isFinite(field.value) ? field.value : ""
                          }
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(
                              v === "" ? Number.NaN : Number.parseInt(v, 10),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="programaCarrera"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Programa o carrera</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estadoLaboral"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado laboral</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(
                            Object.values(
                              EstadoLaboralEgresado,
                            ) as EstadoLaboralEgresado[]
                          ).map((v) => (
                            <SelectItem key={v} value={v}>
                              {ESTADO_LABELS[v]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brevePerfilProfesional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil profesional</FormLabel>
                      <FormControl>
                        <textarea className={textareaClassName} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="informacionEmprendimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Información de emprendimiento (opcional)
                      </FormLabel>
                      <FormControl>
                        <textarea className={textareaClassName} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                {pending ? (
                  <Loader2Icon
                    className="size-4 animate-spin"
                    data-icon="inline-start"
                  />
                ) : null}
                {mode === "create" ? "Registrar" : "Guardar"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
