"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getApiErrorMessage } from "@/lib/api/error-message";
import {
  useCreateEstudianteHabilitadoMutation,
  useUpdateEstudianteHabilitadoMutation,
} from "@/modules/administracion/hooks/use-administracion-mutations";
import {
  type EstudianteHabilitadoFormValues,
  estudianteHabilitadoFormSchema,
} from "@/modules/administracion/schemas/padron-schemas";
import type { EstudianteHabilitadoResponseDto } from "@/modules/shared/types/api-models";

function emptyValues(): EstudianteHabilitadoFormValues {
  return {
    identificacion: "",
    codigoEstudiantil: "",
    nombres: "",
    apellidos: "",
    programa: "",
    semestre: undefined,
  };
}

function toFormValues(
  row: EstudianteHabilitadoResponseDto,
): EstudianteHabilitadoFormValues {
  return {
    identificacion: row.identificacion,
    codigoEstudiantil: row.codigoEstudiantil,
    nombres: row.nombres,
    apellidos: row.apellidos,
    programa: row.programa ?? "",
    semestre: row.semestre ?? undefined,
  };
}

function buildDto(values: EstudianteHabilitadoFormValues) {
  const sem =
    values.semestre !== undefined &&
    typeof values.semestre === "number" &&
    !Number.isNaN(values.semestre)
      ? values.semestre
      : undefined;
  return {
    identificacion: values.identificacion.trim(),
    codigoEstudiantil: values.codigoEstudiantil.trim(),
    nombres: values.nombres.trim(),
    apellidos: values.apellidos.trim(),
    programa: values.programa?.trim() || undefined,
    semestre: sem,
  };
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  row: EstudianteHabilitadoResponseDto | null;
};

export function EstudianteHabilitadoFormSheet({
  open,
  onOpenChange,
  mode,
  row,
}: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const createMut = useCreateEstudianteHabilitadoMutation();
  const updateMut = useUpdateEstudianteHabilitadoMutation();

  const form = useForm<EstudianteHabilitadoFormValues>({
    resolver: zodResolver(
      estudianteHabilitadoFormSchema,
    ) as Resolver<EstudianteHabilitadoFormValues>,
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (!open) return;
    setApiError(null);
    if (mode === "create") {
      form.reset(emptyValues());
    } else if (row) {
      form.reset(toFormValues(row));
    }
  }, [open, mode, row, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: EstudianteHabilitadoFormValues) {
    setApiError(null);
    try {
      const dto = buildDto(values);
      if (mode === "create") {
        await createMut.mutateAsync(dto);
      } else if (row) {
        await updateMut.mutateAsync({ id: row.id, body: dto });
      }
      onOpenChange(false);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Agregar estudiante" : "Editar estudiante"}
          </SheetTitle>
          <SheetDescription>
            Padrón para habilitar registro público con cédula y código
            estudiantil.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
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
            <FormField
              control={form.control}
              name="identificacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificación</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codigoEstudiantil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código estudiantil</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nombres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombres</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apellidos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellidos</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="programa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Programa (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="semestre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semestre (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={
                        field.value !== undefined && !Number.isNaN(field.value)
                          ? field.value
                          : ""
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(
                          v === "" ? undefined : Number.parseInt(v, 10),
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="mt-auto flex-row gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={pending}
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
                Guardar
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
