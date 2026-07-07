"use client";

import { useState } from "react";

import {
  type PostulacionConvocatoriaResponseDto,
  EstadoPostulacionConvocatoria,
  ResolverPostulacionEstado,
} from "@/modules/shared/types/api-models";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PageCallout } from "@/components/shared/page-callout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useResolverPostulacionMutation } from "@/modules/convocatorias-emprendimiento/hooks/use-convocatorias-mutations";
import { usePostulacionesPorConvocatoriaQuery } from "@/modules/convocatorias-emprendimiento/hooks/use-convocatorias-queries";

function correoToText(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") return value || "—";
  try {
    const s = JSON.stringify(value);
    return s === "{}" ? "—" : s;
  } catch {
    return String(value);
  }
}

export type PostulacionesSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publicacionId: number | null;
};

export function PostulacionesSheet({
  open,
  onOpenChange,
  publicacionId,
}: PostulacionesSheetProps) {
  const query = usePostulacionesPorConvocatoriaQuery(publicacionId, open);
  const resolverMut = useResolverPostulacionMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  const rows = query.data ?? [];

  async function resolve(
    row: PostulacionConvocatoriaResponseDto,
    estado: ResolverPostulacionEstado,
  ) {
    if (!publicacionId) return;
    setApiError(null);
    try {
      await resolverMut.mutateAsync({
        postulacionId: row.id,
        publicacionId,
        body: { estado },
      });
    } catch (err) {
      setApiError(getApiErrorMessage(err));
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-lg flex-col gap-0 overflow-y-auto sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle>Postulaciones</SheetTitle>
          <SheetDescription>
            Solo administradores. Puedes aprobar o rechazar postulaciones en
            estado POSTULADO.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 px-4 py-4">
          {apiError ? (
            <PageCallout variant="destructive" className="text-xs">
              {apiError}
            </PageCallout>
          ) : null}

          {query.isPending ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : query.isError ? (
            <PageCallout variant="destructive">
              {getApiErrorMessage(query.error)}
            </PageCallout>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No hay postulaciones.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => {
                    const canResolve =
                      row.estadoPostulacion ===
                      EstadoPostulacionConvocatoria.POSTULADO;
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.usuario?.usuario ?? `#${row.usuarioId}`}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {correoToText(row.usuario?.correo)}
                        </TableCell>
                        <TableCell>{row.estadoPostulacion}</TableCell>
                        <TableCell className="text-right">
                          {canResolve ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={resolverMut.isPending}
                                onClick={() =>
                                  void resolve(
                                    row,
                                    ResolverPostulacionEstado.RECHAZADO,
                                  )
                                }
                              >
                                Rechazar
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                disabled={resolverMut.isPending}
                                onClick={() =>
                                  void resolve(
                                    row,
                                    ResolverPostulacionEstado.APROBADO,
                                  )
                                }
                              >
                                Aprobar
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t border-border bg-popover p-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
