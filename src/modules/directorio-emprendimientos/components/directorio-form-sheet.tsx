"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

import type { DirectorioEmprendimientoResponseDto } from "@/modules/shared/types/api-models";
import { AreaCreativaEmprendimiento } from "@/modules/shared/types/api-models";
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
  useCreateDirectorioMutation,
  useUpdateDirectorioMutation,
  useUploadDirectorioImagenMutation,
} from "@/modules/directorio-emprendimientos/hooks/use-directorio-mutations";
import {
  buildCreateDirectorioDto,
  buildUpdateDirectorioDto,
  type DirectorioFormValues,
  directorioFormSchema,
  directorioResponseToFormValues,
  emptyDirectorioFormValues,
} from "@/modules/directorio-emprendimientos/schemas/directorio-schema";

const textareaClassName = cn(
  "flex min-h-[88px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 md:text-sm",
);

const AREA_LABELS: Record<AreaCreativaEmprendimiento, string> = {
  [AreaCreativaEmprendimiento.ARTES_PLASTICAS]: "Artes plásticas",
  [AreaCreativaEmprendimiento.MUSICA]: "Música",
  [AreaCreativaEmprendimiento.DISENO]: "Diseño",
  [AreaCreativaEmprendimiento.AUDIOVISUAL]: "Audiovisual",
};

export type DirectorioFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  row: DirectorioEmprendimientoResponseDto | null;
};

export function DirectorioFormSheet({
  open,
  onOpenChange,
  mode,
  row,
}: DirectorioFormSheetProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const imagenInputRef = useRef<HTMLInputElement>(null);
  const createMut = useCreateDirectorioMutation();
  const updateMut = useUpdateDirectorioMutation();
  const uploadImagenMut = useUploadDirectorioImagenMutation();

  const form = useForm<DirectorioFormValues>({
    resolver: zodResolver(
      directorioFormSchema,
    ) as Resolver<DirectorioFormValues>,
    defaultValues: emptyDirectorioFormValues(),
  });

  useEffect(() => {
    if (!open) {
      setApiError(null);
      return;
    }
    if (mode === "create") {
      form.reset(emptyDirectorioFormValues());
      return;
    }
    if (row) {
      form.reset(directorioResponseToFormValues(row));
    }
  }, [open, mode, row, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onImagenSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setApiError(null);
    try {
      const res = await uploadImagenMut.mutateAsync(file);
      form.setValue("imagenUrl", res.imagenUrl, { shouldValidate: true });
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
    if (imagenInputRef.current) imagenInputRef.current.value = "";
  }

  async function onSubmit(values: DirectorioFormValues) {
    setApiError(null);
    try {
      if (mode === "create") {
        await createMut.mutateAsync(buildCreateDirectorioDto(values));
      } else if (row) {
        await updateMut.mutateAsync({
          id: row.id,
          body: buildUpdateDirectorioDto(values),
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
              ? "Registrar emprendimiento"
              : "Editar emprendimiento"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "El registro quedará asociado a tu cuenta de usuario."
              : "Actualizá los datos del emprendimiento."}
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
                Perfil del proyecto
              </p>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="nombreProyecto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del proyecto</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="areaCreativa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área creativa</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Área" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(
                            Object.values(
                              AreaCreativaEmprendimiento,
                            ) as AreaCreativaEmprendimiento[]
                          ).map((v) => (
                            <SelectItem key={v} value={v}>
                              {AREA_LABELS[v]}
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
                  name="descripcionCorta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción corta (máx. 500)</FormLabel>
                      <FormControl>
                        <textarea className={textareaClassName} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2">
                  <Label htmlFor="directorio-imagen-file">
                    Imagen (archivo, opcional)
                  </Label>
                  <Input
                    ref={imagenInputRef}
                    id="directorio-imagen-file"
                    type="file"
                    accept="image/*"
                    disabled={uploadImagenMut.isPending}
                    className="text-xs"
                    onChange={(e) => void onImagenSelected(e.target.files)}
                  />
                  {uploadImagenMut.isPending ? (
                    <p className="text-xs text-muted-foreground">Subiendo…</p>
                  ) : null}
                </div>
                <FormField
                  control={form.control}
                  name="imagenUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        URL de imagen (opcional, o pegar URL externa)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://..."
                          {...field}
                          value={field.value ?? ""}
                        />
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
                      <FormLabel>Correo (opcional)</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sitioWeb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitio web (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="redes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redes (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Instagram, Facebook, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perfilActivo"
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
                        Perfil activo
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
                {mode === "create" ? "Registrar" : "Guardar"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
