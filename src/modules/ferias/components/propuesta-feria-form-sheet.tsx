"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

import {
  AreaCreativaEmprendimiento,
  type PropuestaFeriaResponseDto,
} from "@/modules/shared/types/api-models";
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
import { cn } from "@/lib/utils";
import { getFeriasPropuestaErrorMessage } from "@/modules/ferias/lib/ferias-api-error";
import {
  useCreatePropuestaMutation,
  useUpdateMisPropuestaMutation,
  useUploadPropuestaImagenMutation,
} from "@/modules/ferias/hooks/use-ferias-mutations";
import {
  buildCreatePropuestaFeriaDto,
  buildUpdatePropuestaFeriaDto,
  emptyPropuestaFeriaFormValues,
  type PropuestaFeriaFormValues,
  propuestaFeriaFormSchema,
  propuestaFeriaResponseToFormValues,
} from "@/modules/ferias/schemas/propuesta-feria-schema";

const textareaClassName = cn(
  "flex min-h-[88px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 md:text-sm",
);

const AREA_LABELS: Record<AreaCreativaEmprendimiento, string> = {
  [AreaCreativaEmprendimiento.ARTES_PLASTICAS]: "Artes plásticas",
  [AreaCreativaEmprendimiento.MUSICA]: "Música",
  [AreaCreativaEmprendimiento.DISENO]: "Diseño",
  [AreaCreativaEmprendimiento.AUDIOVISUAL]: "Audiovisual",
};

export type PropuestaFeriaFormSheetProps = {
  feriaId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  row: PropuestaFeriaResponseDto | null;
  /** Si false, el envío queda deshabilitado (feria finalizada u otro período no admitido). */
  postulacionAbierta?: boolean;
};

export function PropuestaFeriaFormSheet({
  feriaId,
  open,
  onOpenChange,
  mode,
  row,
  postulacionAbierta = true,
}: PropuestaFeriaFormSheetProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const imagenInputRef = useRef<HTMLInputElement>(null);
  const createMut = useCreatePropuestaMutation();
  const updateMut = useUpdateMisPropuestaMutation();
  const uploadImagenMut = useUploadPropuestaImagenMutation(feriaId);

  const form = useForm<PropuestaFeriaFormValues>({
    resolver: zodResolver(
      propuestaFeriaFormSchema,
    ) as Resolver<PropuestaFeriaFormValues>,
    defaultValues: emptyPropuestaFeriaFormValues(),
  });

  useEffect(() => {
    if (!open) {
      setApiError(null);
      return;
    }
    if (mode === "create") {
      form.reset(emptyPropuestaFeriaFormValues());
      return;
    }
    if (row) {
      form.reset(propuestaFeriaResponseToFormValues(row));
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
      setApiError(getFeriasPropuestaErrorMessage(err, "uploadImagen"));
    }
    if (imagenInputRef.current) imagenInputRef.current.value = "";
  }

  async function onSubmit(values: PropuestaFeriaFormValues) {
    setApiError(null);
    try {
      if (mode === "create") {
        await createMut.mutateAsync({
          feriaId,
          body: buildCreatePropuestaFeriaDto(values),
        });
      } else if (row) {
        await updateMut.mutateAsync({
          propuestaId: row.id,
          body: buildUpdatePropuestaFeriaDto(values),
        });
      }
      onOpenChange(false);
    } catch (err) {
      setApiError(
        getFeriasPropuestaErrorMessage(
          err,
          mode === "create" ? "create" : "update",
        ),
      );
    }
  }

  const submitDisabled = pending || !postulacionAbierta;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-lg flex-col gap-0 overflow-y-auto sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle>
            {mode === "create" ? "Registrar propuesta" : "Editar mi propuesta"}
          </SheetTitle>
          <SheetDescription>
            Datos del emprendimiento para esta feria. La moderación la realiza
            un administrador.
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
            {!postulacionAbierta ? (
              <p className="text-xs text-muted-foreground">
                Solo podés registrar o editar propuestas mientras la feria está
                próxima o en curso.
              </p>
            ) : null}

            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-foreground">
                Emprendimiento
              </p>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="nombreEmprendimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del emprendimiento (2–200)</FormLabel>
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
                      <FormLabel>Descripción corta (10–500)</FormLabel>
                      <FormControl>
                        <textarea className={textareaClassName} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-2">
                  <Label htmlFor="prop-img-file">
                    Imagen (archivo, opcional)
                  </Label>
                  <Input
                    ref={imagenInputRef}
                    id="prop-img-file"
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
                      <FormLabel>Correo</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular (opcional, 7–20)</FormLabel>
                      <FormControl>
                        <Input type="tel" autoComplete="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="redesContacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redes / contacto (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
              <Button type="submit" disabled={submitDisabled}>
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
