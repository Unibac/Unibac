"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SignInIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useLogin } from "@/modules/auth/hooks/use-login";
import {
  loginSchema,
  type LoginFormValues,
} from "@/modules/auth/schemas/login-schema";

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { usuario: "", clave: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setApiError(null);
    try {
      await login.mutateAsync(values);
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  return (
    <Card className="w-full max-w-md border-border shadow-sm">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="text-xl">Iniciar sesión</CardTitle>
        <CardDescription>
          Introduce tu usuario y contraseña para acceder al panel Unibac.
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-4">
          {apiError ? (
            <p
              role="alert"
              className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {apiError}
            </p>
          ) : null}
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.usuario}>
              <FieldLabel htmlFor="login-usuario">Usuario</FieldLabel>
              <Input
                id="login-usuario"
                autoComplete="username"
                aria-invalid={!!form.formState.errors.usuario}
                {...form.register("usuario")}
              />
              <FieldError errors={[form.formState.errors.usuario]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.clave}>
              <FieldLabel htmlFor="login-clave">Contraseña</FieldLabel>
              <Input
                id="login-clave"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!form.formState.errors.clave}
                {...form.register("clave")}
              />
              <FieldError errors={[form.formState.errors.clave]} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SignInIcon data-icon="inline-start" />
            )}
            Entrar
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <Link href="/" className="underline underline-offset-4">
              Volver al inicio
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
