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
  useCreateEgresadoHabilitadoMutation,
  useUpdateEgresadoHabilitadoMutation,
} from "@/modules/administracion/hooks/use-administracion-mutations";
import {
  type EgresadoHabilitadoFormValues,
  egresadoHabilitadoFormSchema,
} from "@/modules/administracion/schemas/padron-schemas";
import type { EgresadoHabilitadoResponseDto } from "@/modules/shared/types/api-models";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  row: EgresadoHabilitadoResponseDto | null;
};

export function EgresadoHabilitadoFormSheet({
  open,
  onOpenChange,
  mode,
  row,
}: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const createMut = useCreateEgresadoHabilitadoMutation();
  const updateMut = useUpdateEgresadoHabilitadoMutation();

  const form = useForm<EgresadoHabilitadoFormValues>({
    resolver: zodResolver(
      egresadoHabilitadoFormSchema,
    ) as Resolver<EgresadoHabilitadoFormValues>,
    defaultValues: { identificacion: "" },
  });

  useEffect(() => {
    if (!open) return;
    setApiError(null);
    if (mode === "create") {
      form.reset({ identificacion: "" });
    } else if (row) {
      form.reset({ identificacion: row.identificacion });
    }
  }, [open, mode, row, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: EgresadoHabilitadoFormValues) {
    setApiError(null);
    try {
      const id = values.identificacion.trim();
      if (mode === "create") {
        await createMut.mutateAsync({ identificacion: id });
      } else if (row) {
        await updateMut.mutateAsync({
          id: row.id,
          body: { identificacion: id },
        });
      }
      onOpenChange(false);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Agregar egresado" : "Editar egresado"}
          </SheetTitle>
          <SheetDescription>
            Padrón de cédulas habilitadas para registro público como egresado.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            className="flex flex-1 flex-col gap-4 px-4"
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
