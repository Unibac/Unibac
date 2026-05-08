"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout } from "@/modules/auth/hooks/use-logout";
import { useProfile } from "@/modules/auth/hooks/use-profile";

import { AppSidebar } from "./app-sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const profile = useProfile();
  const logout = useLogout();

  useEffect(() => {
    if (profile.isError) {
      router.replace("/login");
    }
  }, [profile.isError, router]);

  async function handleLogout() {
    try {
      await logout.mutateAsync();
    } catch {
      /* cookie puede estar ya inválida; seguir saliendo */
    }
    router.replace("/login");
    router.refresh();
  }

  if (profile.isPending) {
    return (
      <div className="flex min-h-svh flex-col gap-4 bg-background p-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full flex-1" />
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex min-h-svh flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1 h-6" />
          <div className="flex flex-1 flex-col gap-0 overflow-hidden">
            <span className="truncate text-xs text-muted-foreground">
              Sesión iniciada
            </span>
            <span className="truncate text-sm font-medium">
              {profile.data.usuario}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleLogout()}
            disabled={logout.isPending}
          >
            {logout.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SignOutIcon data-icon="inline-start" />
            )}
            Salir
          </Button>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
