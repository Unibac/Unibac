"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useUpdateMiCuentaMutation } from "@/modules/perfil/hooks/use-perfil-mutations";
import { useMiCuenta } from "@/modules/perfil/hooks/use-perfil-queries";
import {
  buildUpdateMeUsuarioDto,
  type CuentaPerfilValues,
  cuentaPerfilSchema,
  cuentaResponseToFormValues,
} from "@/modules/perfil/schemas/cuenta-schema";
import { CategoriaUsuarioExterno } from "@/modules/shared/types/enums";

const CATEGORIA_LABELS: Record<CategoriaUsuarioExterno, string> = {
  [CategoriaUsuarioExterno.ESTUDIANTE]: "Estudiante",
  [CategoriaUsuarioExterno.EGRESADO]: "Egresado",
  [CategoriaUsuarioExterno.EMPRESA]: "Empresa",
};

export function CuentaPerfilSection() {
  const cuentaQuery = useMiCuenta();
  const updateMut = useUpdateMiCuentaMutation();
  const [apiError, setApiError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<CuentaPerfilValues>({
    resolver: zodResolver(cuentaPerfilSchema) as Resolver<CuentaPerfilValues>,
    defaultValues: { correo: "", celular: "", descripcion: "" },
  });

  useEffect(() => {
    if (cuentaQuery.data) {
      form.reset(cuentaResponseToFormValues(cuentaQuery.data));
    }
  }, [cuentaQuery.data, form]);

  async function onSubmit(values: CuentaPerfilValues) {
    setApiError(null);
    setSaved(false);
    try {
      await updateMut.mutateAsync(buildUpdateMeUsuarioDto(values));
      setSaved(true);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  const u = cuentaQuery.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Cuenta</CardTitle>
        <CardDescription>
          Correo, celular y descripción. El usuario de acceso no se puede
          cambiar aquí.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cuentaQuery.isPending ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : u ? (
          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            >
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Usuario</dt>
                  <dd className="font-medium tabular-nums-mono">{u.usuario}</dd>
                </div>
                {u.categoria ? (
                  <div>
                    <dt className="text-muted-foreground">Categoría</dt>
                    <dd className="font-medium">
                      {CATEGORIA_LABELS[u.categoria]}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {apiError ? (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  {apiError}
                </p>
              ) : null}
              {saved ? (
                <p className="text-xs text-muted-foreground">
                  Cambios guardados.
                </p>
              ) : null}

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
                name="celular"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Celular (opcional)</FormLabel>
                    <FormControl>
                      <Input autoComplete="tel" {...field} />
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
              <Button type="submit" disabled={updateMut.isPending}>
                {updateMut.isPending ? (
                  <Loader2Icon
                    className="size-4 animate-spin"
                    data-icon="inline-start"
                  />
                ) : null}
                Guardar cuenta
              </Button>
            </form>
          </Form>
        ) : null}
      </CardContent>
    </Card>
  );
}
