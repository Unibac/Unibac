"use client";

import { Loader2Icon, LogOutIcon } from "lucide-react";

import { UnibacLogo } from "@/components/shared/unibac-logo";
import { Button } from "@/components/ui/button";

type PortalTopBarProps = {
  onLogout: () => void;
  logoutPending: boolean;
};

export function PortalTopBar({ onLogout, logoutPending }: PortalTopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 bg-primary px-4 text-primary-foreground lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <UnibacLogo
          priority
          className="shrink-0"
          imgClassName="max-h-9 max-w-[120px] brightness-0 invert"
        />
        <span className="hidden truncate text-sm font-medium sm:inline">
          Institución Universitaria Bellas Artes
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        onClick={onLogout}
        disabled={logoutPending}
      >
        {logoutPending ? (
          <Loader2Icon
            className="size-4 shrink-0 animate-spin"
            data-icon="inline-start"
            aria-hidden
          />
        ) : (
          <LogOutIcon className="size-4 shrink-0" data-icon="inline-start" />
        )}
        Cerrar sesión
      </Button>
    </header>
  );
}
