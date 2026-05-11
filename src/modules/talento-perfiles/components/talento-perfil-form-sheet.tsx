"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

import type { TalentoPerfilResponseDto } from "@/api/generated/models";
import {
  CreateTalentoPerfilDtoArea,
  CreateTalentoPerfilDtoTipoPerfil,
} from "@/api/generated/models";
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
  useCreateTalentoMutation,
  useUpdateTalentoMutation,
} from "@/modules/talento-perfiles/hooks/use-talento-mutations";
import {
  buildCreateTalentoDto,
  buildUpdateTalentoDto,
  emptyTalentoPerfilFormValues,
  type TalentoPerfilFormValues,
  talentoPerfilFormSchema,
  talentoResponseToFormValues,
} from "@/modules/talento-perfiles/schemas/talento-perfil-schema";

const textareaClassName = cn(
  "flex min-h-[88px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40 md:text-sm",
);

const AREA_LABELS: Record<CreateTalentoPerfilDtoArea, string> = {
  [CreateTalentoPerfilDtoArea.MUSICA]: "Música",
  [CreateTalentoPerfilDtoArea.ARTES_PLASTICAS]: "Artes plásticas",
  [CreateTalentoPerfilDtoArea.DISENO]: "Diseño",
  [CreateTalentoPerfilDtoArea.AUDIOVISUAL]: "Audiovisual",
  [CreateTalentoPerfilDtoArea.ARTES_ESCENICAS]: "Artes escénicas",
};

const TIPO_PERFIL_LABELS: Record<CreateTalentoPerfilDtoTipoPerfil, string> = {
  [CreateTalentoPerfilDtoTipoPerfil.ESTUDIANTE]: "Estudiante",
  [CreateTalentoPerfilDtoTipoPerfil.EGRESADO]: "Egresado",
  [CreateTalentoPerfilDtoTipoPerfil.EMPRENDEDOR]: "Emprendedor",
};

export type TalentoPerfilFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  row: TalentoPerfilResponseDto | null;
};

export function TalentoPerfilFormSheet({
  open,
  onOpenChange,
  mode,
  row,
}: TalentoPerfilFormSheetProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const createMut = useCreateTalentoMutation();
  const updateMut = useUpdateTalentoMutation();

  const form = useForm<TalentoPerfilFormValues>({
    resolver: zodResolver(
      talentoPerfilFormSchema,
    ) as Resolver<TalentoPerfilFormValues>,
    defaultValues: emptyTalentoPerfilFormValues(),
  });

  useEffect(() => {
    if (!open) {
      setApiError(null);
      return;
    }
    if (mode === "create") {
      form.reset(emptyTalentoPerfilFormValues());
      return;
    }
    if (row) {
      form.reset(talentoResponseToFormValues(row));
    }
  }, [open, mode, row, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: TalentoPerfilFormValues) {
    setApiError(null);
    try {
      if (mode === "create") {
        await createMut.mutateAsync(buildCreateTalentoDto(values));
      } else if (row) {
        await updateMut.mutateAsync({
          id: row.id,
          body: buildUpdateTalentoDto(values),
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
              ? "Registrar perfil de talento"
              : "Editar perfil de talento"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "El perfil quedará asociado a tu cuenta de usuario."
              : "Actualizá los datos del perfil."}
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
                Datos del perfil
              </p>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="nombreCompleto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área</FormLabel>
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
                              CreateTalentoPerfilDtoArea,
                            ) as CreateTalentoPerfilDtoArea[]
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
                  name="tipoPerfil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de perfil</FormLabel>
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
                              CreateTalentoPerfilDtoTipoPerfil,
                            ) as CreateTalentoPerfilDtoTipoPerfil[]
                          ).map((v) => (
                            <SelectItem key={v} value={v}>
                              {TIPO_PERFIL_LABELS[v]}
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
                  name="habilidades"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habilidades</FormLabel>
                      <FormControl>
                        <textarea className={textareaClassName} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="portafolioUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portafolio (URL, opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          inputMode="url"
                          placeholder="https://"
                          {...field}
                        />
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
                  name="correoContacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo de contacto (opcional)</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
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
                          className="size-4 accent-primary transition-colors duration-150"
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
