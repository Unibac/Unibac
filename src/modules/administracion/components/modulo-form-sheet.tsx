"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  useCreateModuloMutation,
  useUpdateModuloMutation,
} from "@/modules/administracion/hooks/use-administracion-mutations";
import {
  type ModuloFormValues,
  moduloFormSchema,
} from "@/modules/administracion/schemas/catalogo-rbac-schemas";
import type { ModuloResponseDto } from "@/modules/shared/types/api-models";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  row: ModuloResponseDto | null;
};

export function ModuloFormSheet({ open, onOpenChange, mode, row }: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const createMut = useCreateModuloMutation();
  const updateMut = useUpdateModuloMutation();

  const form = useForm<ModuloFormValues>({
    resolver: zodResolver(moduloFormSchema) as Resolver<ModuloFormValues>,
    defaultValues: { nombre: "", activo: true },
  });

  useEffect(() => {
    if (!open) return;
    setApiError(null);
    if (mode === "create") {
      form.reset({ nombre: "", activo: true });
    } else if (row) {
      form.reset({ nombre: row.nombre, activo: row.activo });
    }
  }, [open, mode, row, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: ModuloFormValues) {
    setApiError(null);
    try {
      const nombre = values.nombre.trim();
      if (mode === "create") {
        await createMut.mutateAsync({
          nombre,
          activo: values.activo,
        });
      } else if (row) {
        await updateMut.mutateAsync({
          id: row.id,
          body: { nombre, activo: values.activo },
        });
      }
      onOpenChange(false);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Nuevo módulo" : "Editar módulo"}
          </SheetTitle>
          <SheetDescription>
            Los módulos definen áreas del RBAC en la matriz de permisos.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
          >
            {apiError ? (
              <p className="text-sm text-destructive">{apiError}</p>
            ) : null}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 font-normal">Activo</FormLabel>
                </FormItem>
              )}
            />
            <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t border-border px-0 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <Loader2Icon className="size-4 animate-spin" />
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
