"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

import { NivelUsuario, TipoUsuario } from "@/modules/shared/types/api-models";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import {
  useCreateUsuarioMutation,
  useUpdateUsuarioMutation,
} from "@/modules/usuarios/hooks/use-usuario-mutations";
import {
  useRolesCatalogQuery,
  useUsuarioDetailQuery,
} from "@/modules/usuarios/hooks/use-usuarios-queries";
import { parseOptionalRolId } from "@/modules/usuarios/lib/parse-rol-id";
import {
  type CreateUsuarioFormValues,
  createUsuarioFormSchema,
  updateUsuarioFormSchema,
} from "@/modules/usuarios/schemas/usuario-schema";

function emptyCreateValues(): CreateUsuarioFormValues {
  return {
    usuario: "",
    clave: "",
    descripcion: "",
    activo: true,
    nivel: NivelUsuario.USUARIO,
    tipo: TipoUsuario.INTERNO,
    correo: "",
    celular: "",
    rolId: 0,
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

  const rolesQuery = useRolesCatalogQuery();
  const usuarioQuery = useUsuarioDetailQuery(
    usuarioId,
    open && mode === "edit" && usuarioId != null,
  );

  const createMut = useCreateUsuarioMutation();
  const updateMut = useUpdateUsuarioMutation();

  const rolesActivos = useMemo(
    () => (rolesQuery.data ?? []).filter((r) => r.activo),
    [rolesQuery.data],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setApiError(null);
    if (mode === "create") {
      form.reset(emptyCreateValues());
    }
  }, [open, mode, form]);

  useEffect(() => {
    if (!open || mode !== "edit" || !usuarioQuery.data) {
      return;
    }
    const u = usuarioQuery.data;
    const rolId = parseOptionalRolId(u.rolId) ?? 0;
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
      rolId,
    });
  }, [open, mode, usuarioQuery.data, form]);

  const catalogPending =
    rolesQuery.isPending ||
    (mode === "edit" && usuarioQuery.isPending && !usuarioQuery.isError);

  async function onSubmit(values: CreateUsuarioFormValues) {
    setApiError(null);
    try {
      if (mode === "create") {
        const parsed = createUsuarioFormSchema.parse(values);
        await createMut.mutateAsync(parsed);
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
              ? "Credenciales, nivel y rol RBAC (los permisos vienen del rol)."
              : "Actualizá los datos y el rol; los permisos efectivos son los del rol."}
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
        ) : rolesActivos.length === 0 ? (
          <div className="p-4">
            <p role="alert" className="text-xs text-muted-foreground">
              No hay roles activos en el sistema. Creá roles en el backend antes
              de asignar usuarios.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
              onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            >
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-4">
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
                      Datos de cuenta
                    </p>
                    <div className="flex flex-col gap-4">
                      <FormField
                        control={form.control}
                        name="usuario"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuario</FormLabel>
                            <FormControl>
                              <Input
                                autoComplete="off"
                                disabled={mode === "edit"}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="clave"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {mode === "create"
                                ? "Contraseña"
                                : "Nueva contraseña (opcional)"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                autoComplete="new-password"
                                {...field}
                              />
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
                            <FormLabel>Descripción (opcional)</FormLabel>
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
                                onChange={(e) =>
                                  field.onChange(e.target.checked)
                                }
                              />
                            </FormControl>
                            <FormLabel className="!mt-0 font-normal">
                              Activo
                            </FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nivel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nivel</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Nivel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={NivelUsuario.USUARIO}>
                                  Usuario
                                </SelectItem>
                                <SelectItem value={NivelUsuario.ADMINISTRADOR}>
                                  Administrador
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
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
                                <SelectItem value={TipoUsuario.INTERNO}>
                                  Interno
                                </SelectItem>
                                <SelectItem value={TipoUsuario.EXTERNO}>
                                  Externo
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rolId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <Select
                              value={field.value > 0 ? String(field.value) : ""}
                              onValueChange={(v) => field.onChange(Number(v))}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Seleccioná un rol" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {rolesActivos.map((r) => (
                                  <SelectItem key={r.id} value={String(r.id)}>
                                    {r.nombre}
                                    {r.codigo ? ` (${r.codigo})` : ""}
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
                        name="correo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo (opcional)</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                autoComplete="email"
                                {...field}
                              />
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
                            <FormLabel>Celular (opcional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {mode === "edit" && usuarioQuery.data ? (
                    <div className="flex flex-col gap-2 border border-border p-3">
                      <p className="text-sm font-medium text-foreground">
                        Permisos efectivos del rol
                      </p>
                      {usuarioQuery.data.permisos.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Este rol no tiene permisos configurados (o el usuario
                          no tiene rol).
                        </p>
                      ) : (
                        <ul className="max-h-40 list-inside list-disc overflow-y-auto text-xs text-muted-foreground">
                          {usuarioQuery.data.permisos.map((p) => (
                            <li key={p.id}>
                              {p.modulo.nombre} — {p.accion.nombre}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </div>
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
                  {submitting ? (
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
        )}
      </SheetContent>
    </Sheet>
  );
}
