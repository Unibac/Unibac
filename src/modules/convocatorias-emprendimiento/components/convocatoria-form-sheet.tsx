"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

import type { PublicacionEmprendimientoResponseDto } from "@/modules/shared/types/api-models";
import { TipoConvocatoriaEmprendimiento } from "@/modules/shared/types/api-models";
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
  useCreateConvocatoriaMutation,
  useUpdateConvocatoriaMutation,
} from "@/modules/convocatorias-emprendimiento/hooks/use-convocatorias-mutations";
import {
  buildCreateConvocatoriaDto,
  buildUpdateConvocatoriaDto,
  type ConvocatoriaFormValues,
  convocatoriaFormSchema,
  convocatoriaResponseToFormValues,
  emptyConvocatoriaFormValues,
} from "@/modules/convocatorias-emprendimiento/schemas/convocatoria-schema";

const textareaClassName = cn(
  "flex min-h-[88px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 md:text-sm",
);

const TIPO_LABELS: Record<TipoConvocatoriaEmprendimiento, string> = {
  [TipoConvocatoriaEmprendimiento.FINANCIAMIENTO]: "Financiamiento",
  [TipoConvocatoriaEmprendimiento.FORMACION]: "Formación",
  [TipoConvocatoriaEmprendimiento.PRACTICAS]: "Prácticas",
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
              <p className="text-sm font-medium text-foreground">Contenido</p>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tipoConvocatoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de convocatoria</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(
                            Object.values(
                              TipoConvocatoriaEmprendimiento,
                            ) as TipoConvocatoriaEmprendimiento[]
                          ).map((v) => (
                            <SelectItem key={v} value={v}>
                              {TIPO_LABELS[v]}
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
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <textarea className={textareaClassName} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="convocados"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Convocados (texto)</FormLabel>
                      <FormControl>
                        <textarea className={textareaClassName} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-foreground">Publicación</p>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="fechaLimite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha límite (ISO)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="2026-05-08T00:00:00.000Z"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="montoTipoApoyo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto / tipo de apoyo (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkExterno"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link externo (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0 font-normal">
                        Activa
                      </FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                {pending ? (
                  <Loader2Icon
                    className="size-4 animate-spin"
                    data-icon="inline-start"
                  />
                ) : null}
                {mode === "create" ? "Crear" : "Guardar"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
