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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { ModuloFormSheet } from "@/modules/administracion/components/modulo-form-sheet";
import {
  useDeleteModuloMutation,
  useUpdateModuloMutation,
} from "@/modules/administracion/hooks/use-administracion-mutations";
import { useModulosCatalogAdminQuery } from "@/modules/administracion/hooks/use-administracion-queries";
import type { ModuloResponseDto } from "@/modules/shared/types/api-models";

export function ModulosView() {
  const query = useModulosCatalogAdminQuery();
  const updateMut = useUpdateModuloMutation();
  const deleteMut = useDeleteModuloMutation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<ModuloResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ModuloResponseDto | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  function openCreate() {
    setSelected(null);
    setSheetMode("create");
    setSheetOpen(true);
  }

  function openEdit(row: ModuloResponseDto) {
    setSelected(row);
    setSheetMode("edit");
    setSheetOpen(true);
  }

  async function toggleActivo(row: ModuloResponseDto, activo: boolean) {
    setActionError(null);
    try {
      await updateMut.mutateAsync({ id: row.id, body: { activo } });
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
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
        <PageCallout variant="destructive" title="No se pudo cargar módulos">
          {getApiErrorMessage(query.error)}
        </PageCallout>
      ) : null}
      {actionError ? (
        <PageCallout variant="destructive" title="Error">
          {actionError}
        </PageCallout>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Preferí desactivar un módulo en uso antes de eliminarlo. Si tiene
        permisos asignados, el borrado puede fallar.
      </p>
      {query.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No hay módulos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                (query.data ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm font-medium">
                      {row.nombre}
                    </TableCell>
                    <TableCell>
                      {row.activo ? (
                        <Badge variant="secondary">Activo</Badge>
                      ) : (
                        <Badge variant="outline">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={row.activo}
                        disabled={updateMut.isPending}
                        aria-label={`Activo ${row.nombre}`}
                        onCheckedChange={(checked) =>
                          void toggleActivo(row, checked)
                        }
                      />
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
      <ModuloFormSheet
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
            <AlertDialogTitle>¿Eliminar módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará &quot;{deleteTarget?.nombre}&quot;. Si está
              referenciado en permisos, la operación fallará.
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
