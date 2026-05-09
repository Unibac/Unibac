"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Resolver,
} from "react-hook-form";

import {
  CreateUsuarioDtoNivel,
  CreateUsuarioDtoTipo,
} from "@/api/generated/models";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api/error-message";
import {
  useAccionesCatalogQuery,
  useModulosCatalogQuery,
  useUsuarioDetailQuery,
} from "@/modules/usuarios/hooks/use-usuarios-queries";
import {
  useCreateUsuarioWithPermisosMutation,
  useUpdateUsuarioMutation,
} from "@/modules/usuarios/hooks/use-usuario-mutations";
import {
  createUsuarioFormSchema,
  updateUsuarioFormSchema,
  type CreateUsuarioFormValues,
} from "@/modules/usuarios/schemas/usuario-schema";

function emptyCreateValues(): CreateUsuarioFormValues {
  return {
    usuario: "",
    clave: "",
    descripcion: "",
    activo: true,
    nivel: CreateUsuarioDtoNivel.USUARIO,
    tipo: CreateUsuarioDtoTipo.INTERNO,
    correo: "",
    celular: "",
    permisos: [],
  };
}

export type UsuarioFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  usuarioId: number | null;
};

export function UsuarioFormSheet({
  open,
  onOpenChange,
  mode,
  usuarioId,
}: UsuarioFormSheetProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [permisoWarn, setPermisoWarn] = useState<string | null>(null);

  const resolver = useMemo(
    () =>
      zodResolver(
        mode === "create" ? createUsuarioFormSchema : updateUsuarioFormSchema,
      ),
    [mode],
  );

  const form = useForm<CreateUsuarioFormValues>({
    resolver: resolver as Resolver<CreateUsuarioFormValues>,
    defaultValues: emptyCreateValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "permisos",
  });

  const modulosQuery = useModulosCatalogQuery();
  const accionesQuery = useAccionesCatalogQuery();
  const usuarioQuery = useUsuarioDetailQuery(
    usuarioId,
    open && mode === "edit" && usuarioId != null,
  );

  const createMut = useCreateUsuarioWithPermisosMutation();
  const updateMut = useUpdateUsuarioMutation();

  const modulosActivos = useMemo(
    () => (modulosQuery.data ?? []).filter((m) => m.activo),
    [modulosQuery.data],
  );
  const acciones = accionesQuery.data ?? [];

  useEffect(() => {
    if (!open) {
      return;
    }
    setApiError(null);
    setPermisoWarn(null);
    if (mode === "create") {
      form.reset(emptyCreateValues());
    }
  }, [open, mode, form]);

  useEffect(() => {
    if (!open || mode !== "edit" || !usuarioQuery.data) {
      return;
    }
    const u = usuarioQuery.data;
    form.reset({
      usuario: u.usuario,
      clave: "",
      descripcion:
        u.descripcion !== undefined && u.descripcion !== null
          ? String(u.descripcion)
          : "",
      activo: u.activo,
      nivel: u.nivel as CreateUsuarioFormValues["nivel"],
      tipo: u.tipo as CreateUsuarioFormValues["tipo"],
      correo:
        u.correo !== undefined && u.correo !== null ? String(u.correo) : "",
      celular:
        u.celular !== undefined && u.celular !== null ? String(u.celular) : "",
      permisos: u.permisos.map((p) => ({
        moduloId: p.moduloId,
        accionId: p.accionId,
      })),
    });
  }, [open, mode, usuarioQuery.data, form]);

  const catalogPending =
    modulosQuery.isPending ||
    accionesQuery.isPending ||
    (mode === "edit" && usuarioQuery.isPending && !usuarioQuery.isError);

  function handleAppendPermiso() {
    const m = modulosActivos[0]?.id;
    const a = acciones[0]?.id;
    if (m != null && a != null) {
      append({ moduloId: m, accionId: a });
    }
  }

  async function onSubmit(values: CreateUsuarioFormValues) {
    setApiError(null);
    setPermisoWarn(null);
    try {
      if (mode === "create") {
        const parsed = createUsuarioFormSchema.parse(values);
        const result = await createMut.mutateAsync(parsed);
        if (result.failures > 0) {
          setPermisoWarn(
            `Usuario creado. No se pudieron crear ${result.failures} permiso(s). Podés editar el usuario para completarlos.`,
          );
          return;
        }
        onOpenChange(false);
        return;
      }

      if (usuarioId == null || !usuarioQuery.data) {
        return;
      }
      const parsed = updateUsuarioFormSchema.parse(values);
      await updateMut.mutateAsync({
        id: usuarioId,
        values: parsed,
        previousPermisos: usuarioQuery.data.permisos,
      });
      onOpenChange(false);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  const submitting = createMut.isPending || updateMut.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle>
            {mode === "create" ? "Nuevo usuario" : "Editar usuario"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Credenciales, nivel y permisos por módulo y acción."
              : "Actualizá los datos y los permisos del usuario."}
          </SheetDescription>
        </SheetHeader>

        {catalogPending ? (
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : mode === "edit" && usuarioQuery.isError ? (
          <div className="p-4">
            <p role="alert" className="text-xs text-destructive">
              {getApiErrorMessage(usuarioQuery.error)}
            </p>
          </div>
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {apiError ? (
                <p
                  role="alert"
                  className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  {apiError}
                </p>
              ) : null}
              {permisoWarn ? (
                <p
                  role="status"
                  className="rounded-none border border-warning/40 bg-warning/15 px-3 py-2 text-xs text-warning-foreground"
                >
                  {permisoWarn}
                </p>
              ) : null}

              <FieldSet className="space-y-4 border-none p-0">
                <FieldLegend variant="label">Datos de cuenta</FieldLegend>
                <FieldGroup className="gap-4">
                  <Field data-invalid={!!form.formState.errors.usuario}>
                    <FieldLabel htmlFor="usuario-name">Usuario</FieldLabel>
                    <Input
                      id="usuario-name"
                      autoComplete="off"
                      disabled={mode === "edit"}
                      aria-invalid={!!form.formState.errors.usuario}
                      {...form.register("usuario")}
                    />
                    <FieldError errors={[form.formState.errors.usuario]} />
                  </Field>

                  <Field data-invalid={!!form.formState.errors.clave}>
                    <FieldLabel htmlFor="usuario-clave">
                      {mode === "create"
                        ? "Contraseña"
                        : "Nueva contraseña (opcional)"}
                    </FieldLabel>
                    <Input
                      id="usuario-clave"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={!!form.formState.errors.clave}
                      {...form.register("clave")}
                    />
                    <FieldError errors={[form.formState.errors.clave]} />
                  </Field>

                  <Field data-invalid={!!form.formState.errors.descripcion}>
                    <FieldLabel htmlFor="usuario-desc">
                      Descripción (opcional)
                    </FieldLabel>
                    <Input
                      id="usuario-desc"
                      {...form.register("descripcion")}
                    />
                    <FieldError errors={[form.formState.errors.descripcion]} />
                  </Field>

                  <Controller
                    control={form.control}
                    name="activo"
                    render={({ field }) => (
                      <Field orientation="horizontal">
                        <FieldLabel htmlFor="usuario-activo">Activo</FieldLabel>
                        <input
                          id="usuario-activo"
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      </Field>
                    )}
                  />

                  <Field data-invalid={!!form.formState.errors.nivel}>
                    <FieldLabel>Nivel</FieldLabel>
                    <Controller
                      control={form.control}
                      name="nivel"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger size="default" className="w-full">
                            <SelectValue placeholder="Nivel" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={CreateUsuarioDtoNivel.USUARIO}>
                              Usuario
                            </SelectItem>
                            <SelectItem
                              value={CreateUsuarioDtoNivel.ADMINISTRADOR}
                            >
                              Administrador
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={[form.formState.errors.nivel]} />
                  </Field>

                  <Field data-invalid={!!form.formState.errors.tipo}>
                    <FieldLabel>Tipo</FieldLabel>
                    <Controller
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger size="default" className="w-full">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={CreateUsuarioDtoTipo.INTERNO}>
                              Interno
                            </SelectItem>
                            <SelectItem value={CreateUsuarioDtoTipo.EXTERNO}>
                              Externo
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={[form.formState.errors.tipo]} />
                  </Field>

                  <Field data-invalid={!!form.formState.errors.correo}>
                    <FieldLabel htmlFor="usuario-correo">
                      Correo (opcional)
                    </FieldLabel>
                    <Input
                      id="usuario-correo"
                      type="email"
                      autoComplete="email"
                      {...form.register("correo")}
                    />
                    <FieldError errors={[form.formState.errors.correo]} />
                  </Field>

                  <Field data-invalid={!!form.formState.errors.celular}>
                    <FieldLabel htmlFor="usuario-cel">
                      Celular (opcional)
                    </FieldLabel>
                    <Input id="usuario-cel" {...form.register("celular")} />
                    <FieldError errors={[form.formState.errors.celular]} />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSet className="space-y-3 border-none p-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <FieldLegend variant="label">Permisos</FieldLegend>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      modulosActivos.length === 0 || acciones.length === 0
                    }
                    onClick={() => handleAppendPermiso()}
                  >
                    <PlusIcon data-icon="inline-start" />
                    Añadir permiso
                  </Button>
                </div>

                <div className="flex max-h-52 flex-col gap-3 overflow-y-auto pr-1">
                  {fields.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Sin permisos adicionales (solo cuenta base).
                    </p>
                  ) : null}
                  {fields.map((row, index) => (
                    <div
                      key={row.id}
                      className="flex flex-col gap-2 border border-border p-2 sm:flex-row sm:items-end"
                    >
                      <Field className="min-w-0 flex-1">
                        <FieldLabel>Módulo</FieldLabel>
                        <Controller
                          control={form.control}
                          name={`permisos.${index}.moduloId`}
                          render={({ field }) => (
                            <Select
                              value={
                                field.value > 0
                                  ? String(field.value)
                                  : undefined
                              }
                              onValueChange={(v) => field.onChange(Number(v))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Módulo" />
                              </SelectTrigger>
                              <SelectContent>
                                {modulosActivos.map((m) => (
                                  <SelectItem key={m.id} value={String(m.id)}>
                                    {m.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError
                          errors={[
                            form.formState.errors.permisos?.[index]?.moduloId,
                          ]}
                        />
                      </Field>

                      <Field className="min-w-0 flex-1">
                        <FieldLabel>Acción</FieldLabel>
                        <Controller
                          control={form.control}
                          name={`permisos.${index}.accionId`}
                          render={({ field }) => (
                            <Select
                              value={
                                field.value > 0
                                  ? String(field.value)
                                  : undefined
                              }
                              onValueChange={(v) => field.onChange(Number(v))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Acción" />
                              </SelectTrigger>
                              <SelectContent>
                                {acciones.map((a) => (
                                  <SelectItem key={a.id} value={String(a.id)}>
                                    {a.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError
                          errors={[
                            form.formState.errors.permisos?.[index]?.accionId,
                          ]}
                        />
                      </Field>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0 self-end sm:self-auto"
                        aria-label="Quitar permiso"
                        onClick={() => remove(index)}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  ))}
                </div>
              </FieldSet>
            </div>

            <SheetFooter className="flex-row justify-end gap-2 border-t border-border bg-popover p-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Spinner data-icon="inline-start" /> : null}
                Guardar
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
