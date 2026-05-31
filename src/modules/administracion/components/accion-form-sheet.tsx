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
  useCreateAccionMutation,
  useUpdateAccionMutation,
} from "@/modules/administracion/hooks/use-administracion-mutations";
import {
  type AccionFormValues,
  accionFormSchema,
} from "@/modules/administracion/schemas/catalogo-rbac-schemas";
import type { AccionResponseDto } from "@/modules/shared/types/api-models";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  row: AccionResponseDto | null;
};

export function AccionFormSheet({ open, onOpenChange, mode, row }: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const createMut = useCreateAccionMutation();
  const updateMut = useUpdateAccionMutation();

  const form = useForm<AccionFormValues>({
    resolver: zodResolver(accionFormSchema) as Resolver<AccionFormValues>,
    defaultValues: { nombre: "" },
  });

  useEffect(() => {
    if (!open) return;
    setApiError(null);
    if (mode === "create") {
      form.reset({ nombre: "" });
    } else if (row) {
      form.reset({ nombre: row.nombre });
    }
  }, [open, mode, row, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: AccionFormValues) {
    setApiError(null);
    try {
      const nombre = values.nombre.trim();
      if (mode === "create") {
        await createMut.mutateAsync({ nombre });
      } else if (row) {
        await updateMut.mutateAsync({ id: row.id, body: { nombre } });
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
            {mode === "create" ? "Nueva acción" : "Editar acción"}
          </SheetTitle>
          <SheetDescription>
            Las acciones se combinan con módulos en la matriz de permisos.
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
