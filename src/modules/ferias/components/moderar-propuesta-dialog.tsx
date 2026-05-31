"use client";

import { useEffect, useState } from "react";

import type { PropuestaFeriaResponseDto } from "@/modules/shared/types/api-models";
import { ModerarPropuestaFeriaEstado } from "@/modules/shared/types/api-models";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useModerarPropuestaMutation } from "@/modules/ferias/hooks/use-ferias-mutations";

export type ModerarPropuestaTarget = {
  propuesta: PropuestaFeriaResponseDto;
  accion: "aceptar" | "rechazar";
};

export type ModerarPropuestaDialogProps = {
  target: ModerarPropuestaTarget | null;
  onOpenChange: (open: boolean) => void;
};

export function ModerarPropuestaDialog({
  target,
  onOpenChange,
}: ModerarPropuestaDialogProps) {
  const moderateMut = useModerarPropuestaMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  const open = target != null;

  useEffect(() => {
    if (open) setApiError(null);
  }, [open]);

  async function confirm() {
    if (!target) return;
    setApiError(null);
    const estado =
      target.accion === "aceptar"
        ? ModerarPropuestaFeriaEstado.ACEPTADO
        : ModerarPropuestaFeriaEstado.RECHAZADO;
    try {
      await moderateMut.mutateAsync({
        propuestaId: target.propuesta.id,
        body: { estado },
      });
      onOpenChange(false);
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  const title =
    target?.accion === "aceptar" ? "Aceptar propuesta" : "Rechazar propuesta";

  const description =
    target?.accion === "aceptar"
      ? "La propuesta pasará a estado ACEPTADO y será visible en la vitrina."
      : "La propuesta pasará a estado RECHAZADO.";

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onOpenChange(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}{" "}
            {target ? (
              <span className="font-medium text-foreground">
                {target.propuesta.nombreEmprendimiento}
              </span>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {apiError ? (
          <p role="alert" className="text-xs text-destructive">
            {apiError}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={moderateMut.isPending}>
            Cancelar
          </AlertDialogCancel>
          <Button
            type="button"
            variant={target?.accion === "rechazar" ? "destructive" : "default"}
            disabled={moderateMut.isPending}
            onClick={() => void confirm()}
          >
            Confirmar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
