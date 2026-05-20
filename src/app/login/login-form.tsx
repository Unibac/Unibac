"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, LogInIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
import { useLogin } from "@/modules/auth/hooks/use-login";
import { isPublicRegistrationEnabled } from "@/modules/auth/lib/public-registration-enabled";
import {
  type LoginFormValues,
  loginSchema,
} from "@/modules/auth/schemas/login-schema";

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [apiError, setApiError] = useState<string | null>(null);
  const [registeredHint, setRegisteredHint] = useState<string | null>(null);
  const registrationEnabled = isPublicRegistrationEnabled();

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("registrado") === "1") {
      setRegisteredHint(
        "Cuenta creada. Iniciá sesión con tu usuario y contraseña.",
      );
      sp.delete("registrado");
      const qs = sp.toString();
      const path = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", path);
    }
  }, []);

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
    <PanelCard>
      <CardHeader className="flex flex-col items-center gap-4 px-6 text-center sm:items-stretch sm:text-start">
        <UnibacLogo
          priority
          className="w-full justify-center"
          imgClassName="mx-auto max-h-28 sm:max-h-32"
        />
        <CardTitle className="text-lg">Iniciar sesión</CardTitle>
        <CardDescription>
          Introduce tu usuario y contraseña para acceder al panel Unibac.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}>
          <CardContent className="flex flex-col gap-4">
            {registeredHint ? (
              <p
                role="status"
                className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-xs text-success-foreground"
              >
                {registeredHint}
              </p>
            ) : null}
            {apiError ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {apiError}
              </p>
            ) : null}
            <div className="flex flex-col gap-4">
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
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? (
                <Loader2Icon
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
              ) : (
                <LogInIcon className="size-4" data-icon="inline-start" />
              )}
              Entrar
            </Button>
            {registrationEnabled ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/register">Registrarse</Link>
              </Button>
            ) : null}
            <p className="text-center text-xs text-muted-foreground">
              <Link href="/" className="underline underline-offset-4">
                Volver al inicio
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </PanelCard>
  );
}
