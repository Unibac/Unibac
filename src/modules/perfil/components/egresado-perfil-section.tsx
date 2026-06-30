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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { cn } from "@/lib/utils";
import {
  buildCreateEgresadoDto,
  type EgresadoFormValues,
  egresadoFormSchema,
  egresadoResponseToFormValues,
  emptyEgresadoFormValues,
} from "@/modules/egresados/schemas/egresado-schema";
import {
  useCreateMiEgresadoMutation,
  useUpdateMiEgresadoMutation,
} from "@/modules/perfil/hooks/use-perfil-mutations";
import { buildUpdateEgresadoMeDto } from "@/modules/perfil/schemas/egresado-perfil-helpers";
import type { EgresadoResponseDto } from "@/modules/shared/types/api-models";
import { EstadoLaboralEgresado } from "@/modules/shared/types/api-models";

const textareaClassName = cn(
  "flex min-h-[88px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] duration-150 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
);

const ESTADO_LABELS: Record<EstadoLaboralEgresado, string> = {
  [EstadoLaboralEgresado.EMPLEADO]: "Empleado",
  [EstadoLaboralEgresado.EMPRENDEDOR]: "Emprendedor",
  [EstadoLaboralEgresado.DESEMPLEADO]: "Desempleado",
  [EstadoLaboralEgresado.ESTUDIANDO]: "Estudiando",
};

type EgresadoPerfilSectionProps = {
  egresado: EgresadoResponseDto | null | undefined;
  isLoading: boolean;
};

export function EgresadoPerfilSection({
  egresado,
  isLoading,
}: EgresadoPerfilSectionProps) {
  const mode = egresado ? "edit" : "create";
  const createMut = useCreateMiEgresadoMutation();
  const updateMut = useUpdateMiEgresadoMutation();
  const [apiError, setApiError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<EgresadoFormValues>({
    resolver: zodResolver(egresadoFormSchema) as Resolver<EgresadoFormValues>,
    defaultValues: emptyEgresadoFormValues(),
  });

  useEffect(() => {
    if (egresado) {
      form.reset(egresadoResponseToFormValues(egresado));
    } else if (!isLoading) {
      form.reset(emptyEgresadoFormValues());
    }
  }, [egresado, isLoading, form]);

  const pending = createMut.isPending || updateMut.isPending;

  async function onSubmit(values: EgresadoFormValues) {
    setApiError(null);
    setSaved(false);
    try {
      if (mode === "create") {
        await createMut.mutateAsync(buildCreateEgresadoDto(values));
      } else {
        await updateMut.mutateAsync(buildUpdateEgresadoMeDto(values));
      }
      setSaved(true);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Perfil de egresado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Perfil de egresado
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Completa tu ficha de egresado. La identificación quedará fija después de guardar."
            : "Actualiza tu información profesional. La identificación no se puede cambiar."}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              name="nombreCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identificacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identificación</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      readOnly={mode === "edit"}
                      className={mode === "edit" ? "bg-muted" : undefined}
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
              name="anioEgreso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año de egreso</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={Number.isFinite(field.value) ? field.value : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(
                          v === "" ? Number.NaN : Number.parseInt(v, 10),
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="programaCarrera"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Programa o carrera</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estadoLaboral"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado laboral</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(
                        Object.values(
                          EstadoLaboralEgresado,
                        ) as EstadoLaboralEgresado[]
                      ).map((v) => (
                        <SelectItem key={v} value={v}>
                          {ESTADO_LABELS[v]}
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
              name="brevePerfilProfesional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil profesional</FormLabel>
                  <FormControl>
                    <textarea className={textareaClassName} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="informacionEmprendimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Información de emprendimiento (opcional)
                  </FormLabel>
                  <FormControl>
                    <textarea className={textareaClassName} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2Icon
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
              ) : null}
              {mode === "create" ? "Completar perfil" : "Guardar perfil"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
