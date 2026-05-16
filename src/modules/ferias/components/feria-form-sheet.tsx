"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

import type { FeriaResponseDto } from "@/api/generated/models";
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
import { Label } from "@/components/ui/label";
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
  "flex min-h-[88px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 md:text-sm",
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
            Definí fechas inclusivas, descripción y opcionalmente un banner
            (subí un archivo o pegá una URL externa).
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
                Datos generales
              </p>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                  name="fechaInicioLocal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inicio (fecha y hora local)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fechaFinLocal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fin (fecha y hora local)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-2">
                  <Label htmlFor="feria-banner-file">
                    Banner (archivo, opcional)
                  </Label>
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
                </div>
                <FormField
                  control={form.control}
                  name="imagenBannerUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        URL del banner (opcional, o pegar URL externa)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://..."
                          {...field}
                        />
                      </FormControl>
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
