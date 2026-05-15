"use client";

import { MoreVerticalIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AuthProfileResponseDtoNivel } from "@/api/generated/models";
import { useDashboardListLayout } from "@/components/layout/dashboard-list-layout";
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
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { isAdministrador } from "@/modules/auth/lib/profile-capabilities";
import { UsuarioFormSheet } from "@/modules/usuarios/components/usuario-form-sheet";
import { useDeleteUsuarioMutation } from "@/modules/usuarios/hooks/use-usuario-mutations";
import {
  useRolesCatalogQuery,
  useUsuariosListQuery,
} from "@/modules/usuarios/hooks/use-usuarios-queries";
import { parseOptionalRolId } from "@/modules/usuarios/lib/parse-rol-id";

export function UsuariosView() {
  const profile = useProfile();
  const { layout } = useDashboardListLayout();
  const usuariosQuery = useUsuariosListQuery();
  const rolesQuery = useRolesCatalogQuery();
  const deleteMut = useDeleteUsuarioMutation();

  const canManage =
    profile.data?.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [sheetUsuarioId, setSheetUsuarioId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const rolLabelById = useMemo(() => {
    const m = new Map<number, string>();
    for (const r of rolesQuery.data ?? []) {
      m.set(r.id, r.codigo ? `${r.nombre} (${r.codigo})` : r.nombre);
    }
    return m;
  }, [rolesQuery.data]);

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

  if (!isAdministrador(profile.data)) {
    return (
      <p
        role="alert"
        className="rounded-none border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
      >
        Solo los administradores pueden acceder a la gestión de usuarios.
      </p>
    );
  }

  if (usuariosQuery.isPending || rolesQuery.isPending) {
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

  if (rolesQuery.isError) {
    return (
      <p
        role="alert"
        className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {getApiErrorMessage(rolesQuery.error)}
      </p>
    );
  }

  const rows = usuariosQuery.data ?? [];

  function formatRolCell(rolIdUnknown: unknown): string {
    const id = parseOptionalRolId(rolIdUnknown);
    if (id == null) {
      return "—";
    }
    return rolLabelById.get(id) ?? `#${id}`;
  }

  return (
    <div className="flex flex-col gap-4">
      {!canManage ? (
        <p className="text-sm text-muted-foreground">
          Solo los administradores pueden crear o editar usuarios y roles.
        </p>
      ) : (
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={() => openCreate()}>
            Nuevo usuario
          </Button>
        </div>
      )}

      {layout === "cards" ? (
        rows.length === 0 ? (
          <p className="rounded-md border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground transition-colors duration-150">
            No hay usuarios registrados.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((u) => (
              <Card
                key={u.id}
                className="gap-0 py-0 transition-colors duration-150"
              >
                <CardHeader className="gap-3 border-b border-border pb-4">
                  <div className="flex min-w-0 flex-row items-start justify-between gap-2">
                    <CardTitle className="truncate text-base leading-snug">
                      {u.usuario}
                    </CardTitle>
                    {canManage ? (
                      <CardAction>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Acciones para ${u.usuario}`}
                            >
                              <MoreVerticalIcon className="size-4" />
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
                      </CardAction>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 pt-4 pb-6 text-sm">
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span>{u.nivel}</span>
                    <span aria-hidden>·</span>
                    <span>{u.tipo}</span>
                    <span aria-hidden>·</span>
                    <span>{u.activo ? "Activo" : "Inactivo"}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.correo != null ? String(u.correo) : "—"}
                  </p>
                  <p className="truncate text-xs">
                    <span className="text-muted-foreground">Rol: </span>
                    <span>{formatRolCell(u.rolId)}</span>
                  </p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    Permisos (rol): {u.permisos.length}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right tabular-nums">
                Permisos (rol)
              </TableHead>
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
                  colSpan={canManage ? 8 : 7}
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
                  <TableCell className="max-w-[160px] truncate text-sm">
                    {formatRolCell(u.rolId)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {u.permisos.length}
                  </TableCell>
                  {canManage ? (
                    <TableCell className="text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Acciones para ${u.usuario}`}
                          >
                            <MoreVerticalIcon className="size-4" />
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
      )}

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
