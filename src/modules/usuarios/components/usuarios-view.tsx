"use client";

import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { AuthProfileResponseDtoNivel } from "@/api/generated/models";
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
import { useProfile } from "@/modules/auth/hooks/use-profile";
import { UsuarioFormSheet } from "@/modules/usuarios/components/usuario-form-sheet";
import { useDeleteUsuarioMutation } from "@/modules/usuarios/hooks/use-usuario-mutations";
import { useUsuariosListQuery } from "@/modules/usuarios/hooks/use-usuarios-queries";

export function UsuariosView() {
  const profile = useProfile();
  const usuariosQuery = useUsuariosListQuery();
  const deleteMut = useDeleteUsuarioMutation();

  const canManage =
    profile.data?.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [sheetUsuarioId, setSheetUsuarioId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (deleteTargetId != null) {
      setDeleteError(null);
    }
  }, [deleteTargetId]);

  function openCreate() {
    setSheetMode("create");
    setSheetUsuarioId(null);
    setSheetOpen(true);
  }

  function openEdit(id: number) {
    setSheetMode("edit");
    setSheetUsuarioId(id);
    setSheetOpen(true);
  }

  async function confirmDelete() {
    if (deleteTargetId == null) return;
    setDeleteError(null);
    try {
      await deleteMut.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    }
  }

  if (usuariosQuery.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (usuariosQuery.isError) {
    return (
      <p
        role="alert"
        className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {getApiErrorMessage(usuariosQuery.error)}
      </p>
    );
  }

  const rows = usuariosQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      {!canManage ? (
        <p className="text-sm text-muted-foreground">
          Solo los administradores pueden crear o editar usuarios y permisos.
        </p>
      ) : (
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={() => openCreate()}>
            Nuevo usuario
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Nivel</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Activo</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead className="text-right">Permisos</TableHead>
            {canManage ? (
              <TableHead className="w-[72px] text-end">
                <span className="sr-only">Acciones</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={canManage ? 7 : 6}
                className="text-center text-muted-foreground"
              >
                No hay usuarios registrados.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.usuario}</TableCell>
                <TableCell>{u.nivel}</TableCell>
                <TableCell>{u.tipo}</TableCell>
                <TableCell>{u.activo ? "Sí" : "No"}</TableCell>
                <TableCell className="max-w-[140px] truncate text-muted-foreground">
                  {u.correo != null ? String(u.correo) : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {u.permisos.length}
                </TableCell>
                {canManage ? (
                  <TableCell className="text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Acciones para ${u.usuario}`}
                        >
                          <DotsThreeVerticalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(u.id)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTargetId(u.id)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <UsuarioFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        usuarioId={sheetUsuarioId}
      />

      <AlertDialog
        open={deleteTargetId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Eliminar este usuario del
              sistema?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p role="alert" className="text-xs text-destructive">
              {deleteError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>
              Cancelar
            </AlertDialogCancel>
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
    </div>
  );
}
