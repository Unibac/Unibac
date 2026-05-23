"use client";

import { MoreVerticalIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { ListPageToolbar } from "@/components/shared/list-page-toolbar";
import { PageCallout } from "@/components/shared/page-callout";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { AccionFormSheet } from "@/modules/administracion/components/accion-form-sheet";
import { useDeleteAccionMutation } from "@/modules/administracion/hooks/use-administracion-mutations";
import { useAccionesAdminQuery } from "@/modules/administracion/hooks/use-administracion-queries";
import type { AccionResponseDto } from "@/modules/shared/types/api-models";

export function AccionesView() {
  const query = useAccionesAdminQuery();
  const deleteMut = useDeleteAccionMutation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<AccionResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AccionResponseDto | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  function openCreate() {
    setSelected(null);
    setSheetMode("create");
    setSheetOpen(true);
  }

  function openEdit(row: AccionResponseDto) {
    setSelected(row);
    setSheetMode("edit");
    setSheetOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setActionError(null);
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  }

  return (
    <>
      <ListPageToolbar
        end={
          <Button type="button" size="sm" onClick={openCreate}>
            <PlusIcon className="size-4" data-icon="inline-start" />
            Agregar
          </Button>
        }
      />
      {query.isError ? (
        <PageCallout variant="destructive" title="No se pudo cargar acciones">
          {getApiErrorMessage(query.error)}
        </PageCallout>
      ) : null}
      {actionError ? (
        <PageCallout variant="destructive" title="Error">
          {actionError}
        </PageCallout>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Si una acción está en la matriz de permisos, el borrado puede fallar.
      </p>
      {query.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No hay acciones registradas.
                  </TableCell>
                </TableRow>
              ) : (
                (query.data ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm font-medium">
                      {row.nombre}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Acciones"
                          >
                            <MoreVerticalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(row)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTarget(row)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <AccionFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        row={selected}
      />
      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar acción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{deleteTarget?.nombre}&quot;. Si está
              referenciada en permisos, la operación fallará.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMut.isPending}
              onClick={() => void confirmDelete()}
            >
              Eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
