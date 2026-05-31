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
import { EstudianteHabilitadoFormSheet } from "@/modules/administracion/components/estudiante-habilitado-form-sheet";
import { useDeleteEstudianteHabilitadoMutation } from "@/modules/administracion/hooks/use-administracion-mutations";
import { useEstudiantesHabilitadosQuery } from "@/modules/administracion/hooks/use-administracion-queries";
import type { EstudianteHabilitadoResponseDto } from "@/modules/shared/types/api-models";

export function PadronesEstudiantesView() {
  const query = useEstudiantesHabilitadosQuery();
  const deleteMut = useDeleteEstudianteHabilitadoMutation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] =
    useState<EstudianteHabilitadoResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<EstudianteHabilitadoResponseDto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreate() {
    setSelected(null);
    setSheetMode("create");
    setSheetOpen(true);
  }

  function openEdit(row: EstudianteHabilitadoResponseDto) {
    setSelected(row);
    setSheetMode("edit");
    setSheetOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
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
        <PageCallout variant="destructive" title="No se pudo cargar el padrón">
          {getApiErrorMessage(query.error)}
        </PageCallout>
      ) : null}
      {query.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identificación</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Programa</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No hay registros en el padrón.
                  </TableCell>
                </TableRow>
              ) : (
                (query.data ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="tabular-nums-mono text-sm">
                      {row.identificacion}
                    </TableCell>
                    <TableCell className="tabular-nums-mono text-sm">
                      {row.codigoEstudiantil}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.nombres} {row.apellidos}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.programa ?? "—"}
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
                            variant="destructive"
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
      <EstudianteHabilitadoFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        row={selected}
      />
      <AlertDialog
        open={deleteTarget != null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar del padrón?</AlertDialogTitle>
            <AlertDialogDescription>
              El estudiante no podrá registrarse hasta volver a agregarlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p className="text-xs text-destructive">{deleteError}</p>
          ) : null}
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
