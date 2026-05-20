"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Loader2Icon, UserPlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";

import { CategoriaUsuarioExterno } from "@/modules/shared/types/enums";
import { PanelCard } from "@/components/shared/panel-card";
import { UnibacLogo } from "@/components/shared/unibac-logo";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
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
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useRegisterPublic } from "@/modules/auth/hooks/use-register-public";
import { isPublicRegistrationEnabled } from "@/modules/auth/lib/public-registration-enabled";
import {
  emptyRegisterPublicFormValues,
  type RegisterPublicFormValues,
  registerPublicFormSchema,
} from "@/modules/auth/schemas/register-public-schema";

type Step = "pick" | "form";

const CATEGORIA_COPY: Record<
  RegisterPublicFormValues["categoria"],
  { title: string; description: string }
> = {
  [CategoriaUsuarioExterno.ESTUDIANTE]: {
    title: "Estudiante",
    description:
      "Acceso como usuario externo estudiante. Necesitamos tu identificación y código estudiantil.",
  },
  [CategoriaUsuarioExterno.EGRESADO]: {
    title: "Egresado",
    description:
      "Acceso como egresado. Necesitamos tu identificación para validar el registro.",
  },
  [CategoriaUsuarioExterno.EMPRESA]: {
    title: "Empresa",
    description:
      "Cuenta para organizaciones. Indicá NIT y razón social; el resto es opcional.",
  },
};

export function RegisterPublicFlow() {
  const router = useRouter();
  const registerMut = useRegisterPublic();
  const [step, setStep] = useState<Step>("pick");
  const [apiError, setApiError] = useState<string | null>(null);

  const enabled = isPublicRegistrationEnabled();

  const form = useForm<RegisterPublicFormValues>({
    resolver: zodResolver(
      registerPublicFormSchema,
    ) as Resolver<RegisterPublicFormValues>,
    defaultValues: emptyRegisterPublicFormValues(
      CategoriaUsuarioExterno.ESTUDIANTE,
    ),
  });

  const categoria = form.watch("categoria");

  function selectCategoria(cat: RegisterPublicFormValues["categoria"]) {
    setApiError(null);
    form.reset(emptyRegisterPublicFormValues(cat));
    setStep("form");
  }

  function goBackToPick() {
    setApiError(null);
    setStep("pick");
  }

  async function onSubmit(values: RegisterPublicFormValues) {
    setApiError(null);
    try {
      const parsed = registerPublicFormSchema.parse(values);
      const result = await registerMut.mutateAsync(parsed);
      if (result.kind === "session") {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      router.replace("/login?registrado=1");
      router.refresh();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  if (!enabled) {
    return (
      <PanelCard>
        <CardHeader className="flex flex-col items-center gap-4 px-6 text-center sm:items-stretch sm:text-start">
          <div className="flex justify-center sm:justify-start">
            <UnibacLogo priority imgClassName="max-h-28 sm:max-h-32" />
          </div>
          <CardTitle className="text-lg">Registro no disponible</CardTitle>
          <CardDescription>
            El registro público está deshabilitado en este entorno. Si necesitás
            una cuenta, contactá a la administración.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 border-t border-border pt-6">
          <Button type="button" variant="outline" className="w-full" asChild>
            <Link href="/login">Volver al inicio de sesión</Link>
          </Button>
        </CardFooter>
      </PanelCard>
    );
  }

  if (step === "pick") {
    return (
      <PanelCard>
        <CardHeader className="flex flex-col items-center gap-4 px-6 text-center sm:items-stretch sm:text-start">
          <div className="flex justify-center sm:justify-start">
            <UnibacLogo priority imgClassName="max-h-28 sm:max-h-32" />
          </div>
          <CardTitle className="text-lg">Crear cuenta externa</CardTitle>
          <CardDescription>
            Elegí el tipo de cuenta. El sistema asignará el rol y permisos según
            tu perfil.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {(
            Object.keys(
              CATEGORIA_COPY,
            ) as RegisterPublicFormValues["categoria"][]
          ).map((cat) => {
            const copy = CATEGORIA_COPY[cat];
            return (
              <button
                key={cat}
                type="button"
                className="rounded-md border border-border bg-card p-4 text-start transition-colors duration-150 hover:border-border/80 hover:bg-accent/50"
                onClick={() => selectCategoria(cat)}
              >
                <p className="text-sm font-medium text-foreground">
                  {copy.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {copy.description}
                </p>
              </button>
            );
          })}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-border pt-6">
          <Button type="button" variant="outline" className="w-full" asChild>
            <Link href="/login">Ya tengo cuenta</Link>
          </Button>
        </CardFooter>
      </PanelCard>
    );
  }

  return (
    <PanelCard>
      <CardHeader className="flex flex-col items-center gap-4 px-6 text-center sm:items-stretch sm:text-start">
        <div className="flex justify-center sm:justify-start">
          <UnibacLogo priority imgClassName="max-h-28 sm:max-h-32" />
        </div>
        <CardTitle className="text-lg">
          Registro — {CATEGORIA_COPY[categoria].title}
        </CardTitle>
        <CardDescription>
          Completá los datos. Podés volver atrás para cambiar el tipo de cuenta.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}>
          <CardContent className="flex max-h-[min(70vh,520px)] flex-col gap-4 overflow-y-auto">
            {apiError ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {apiError}
              </p>
            ) : null}

            <FormField
              control={form.control}
              name="usuario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input autoComplete="username" {...field} />
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
                  <FormLabel>Contraseña</FormLabel>
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

            {categoria === CategoriaUsuarioExterno.ESTUDIANTE ||
            categoria === CategoriaUsuarioExterno.EGRESADO ? (
              <FormField
                control={form.control}
                name="identificacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identificación</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {categoria === CategoriaUsuarioExterno.ESTUDIANTE ? (
              <FormField
                control={form.control}
                name="codigoEstudiantil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código estudiantil</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {categoria === CategoriaUsuarioExterno.EMPRESA ? (
              <>
                <FormField
                  control={form.control}
                  name="nit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIT</FormLabel>
                      <FormControl>
                        <Input autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="razonSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón social</FormLabel>
                      <FormControl>
                        <Input autoComplete="organization" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 border-t border-border pt-6">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => goBackToPick()}
              >
                <ArrowLeftIcon className="size-4" data-icon="inline-start" />
                Cambiar tipo de cuenta
              </Button>
              <Button
                type="submit"
                className="w-full sm:ml-auto sm:w-auto"
                disabled={registerMut.isPending}
              >
                {registerMut.isPending ? (
                  <Loader2Icon
                    className="size-4 animate-spin"
                    data-icon="inline-start"
                  />
                ) : (
                  <UserPlusIcon className="size-4" data-icon="inline-start" />
                )}
                Registrarse
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              <Link href="/login" className="underline underline-offset-4">
                Volver al inicio de sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </PanelCard>
  );
}
