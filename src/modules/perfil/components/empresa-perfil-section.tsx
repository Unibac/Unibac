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
import { useUpdateMiEmpresaMutation } from "@/modules/perfil/hooks/use-perfil-mutations";
import { useMiEmpresa } from "@/modules/perfil/hooks/use-perfil-queries";
import {
  buildUpdateEmpresaMeDto,
  type EmpresaPerfilValues,
  empresaPerfilSchema,
  empresaResponseToFormValues,
} from "@/modules/perfil/schemas/empresa-perfil-schema";

export function EmpresaPerfilSection() {
  const empresaQuery = useMiEmpresa(true);
  const updateMut = useUpdateMiEmpresaMutation();
  const [apiError, setApiError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<EmpresaPerfilValues>({
    resolver: zodResolver(empresaPerfilSchema) as Resolver<EmpresaPerfilValues>,
    defaultValues: {
      nombreContacto: "",
      correoContacto: "",
      telefono: "",
    },
  });

  useEffect(() => {
    if (empresaQuery.data) {
      form.reset(empresaResponseToFormValues(empresaQuery.data));
    }
  }, [empresaQuery.data, form]);

  async function onSubmit(values: EmpresaPerfilValues) {
    setApiError(null);
    setSaved(false);
    try {
      await updateMut.mutateAsync(buildUpdateEmpresaMeDto(values));
      setSaved(true);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  if (empresaQuery.isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (empresaQuery.isError || !empresaQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No se encontró el registro de empresa asociado a tu cuenta.
          </p>
        </CardContent>
      </Card>
    );
  }

  const e = empresaQuery.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Empresa</CardTitle>
        <CardDescription>
          Completá datos de contacto. El NIT y la razón social no se pueden
          modificar desde aquí.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">NIT</dt>
            <dd className="font-medium tabular-nums-mono">{e.nit}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Razón social</dt>
            <dd className="font-medium">{e.razonSocial}</dd>
          </div>
        </dl>

        <Form {...form}>
          <form
            className="flex flex-col gap-4"
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
            {saved ? (
              <p className="text-xs text-muted-foreground">
                Cambios guardados.
              </p>
            ) : null}

            <FormField
              control={form.control}
              name="nombreContacto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de contacto (opcional)</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
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
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input autoComplete="tel" {...field} />
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
              Guardar datos de contacto
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
