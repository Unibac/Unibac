"use client";

import { MoreVerticalIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  NivelUsuario,
  AreaCreativaEmprendimiento,
  type DirectorioEmprendimientoResponseDto,
} from "@/modules/shared/types/api-models";
import { useDashboardListLayout } from "@/components/layout/dashboard-list-layout";
import { ListCardContent } from "@/components/shared/list-card-content";
import { ListCardGridEmpty } from "@/components/shared/list-card-grid-empty";
import { ListPageToolbar } from "@/components/shared/list-page-toolbar";
import { PageCallout } from "@/components/shared/page-callout";
import { ListCardHeader } from "@/components/shared/list-card-header";
import { ListCardThumbnail } from "@/components/shared/list-card-thumbnail";
import { ListCardWithMedia } from "@/components/shared/list-card-with-media";
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
import { CardAction, CardDescription, CardTitle } from "@/components/ui/card";
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
import { directorioCanAccessModule } from "@/modules/auth/lib/profile-capabilities";
import { DirectorioFormSheet } from "@/modules/directorio-emprendimientos/components/directorio-form-sheet";
import { useDeleteDirectorioMutation } from "@/modules/directorio-emprendimientos/hooks/use-directorio-mutations";
import { useDirectorioListQuery } from "@/modules/directorio-emprendimientos/hooks/use-directorio-queries";

const AREA_LABELS: Record<AreaCreativaEmprendimiento, string> = {
  [AreaCreativaEmprendimiento.ARTES_PLASTICAS]: "Artes plásticas",
  [AreaCreativaEmprendimiento.MUSICA]: "Música",
  [AreaCreativaEmprendimiento.DISENO]: "Diseño",
  [AreaCreativaEmprendimiento.AUDIOVISUAL]: "Audiovisual",
};

function toCellText(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") return value || "—";
  try {
    const s = JSON.stringify(value);
    return s === "{}" ? "—" : s;
  } catch {
    return String(value);
  }
}

export function DirectorioView() {
  const { layout } = useDashboardListLayout();
  const profile = useProfile();
  const listQuery = useDirectorioListQuery();
  const deleteMut = useDeleteDirectorioMutation();

  const isAdmin = profile.data?.nivel === NivelUsuario.ADMINISTRADOR;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [sheetRow, setSheetRow] =
    useState<DirectorioEmprendimientoResponseDto | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (deleteTargetId != null) {
      setDeleteError(null);
    }
  }, [deleteTargetId]);

  const rows = listQuery.data ?? [];

  const myRow = useMemo(() => {
    const me = profile.data?.id;
    if (!me) return null;
    return rows.find((r) => r.usuarioId === me) ?? null;
  }, [rows, profile.data?.id]);

  const canRegisterSelf = Boolean(profile.data && !myRow);

  function openCreate() {
    setSheetMode("create");
    setSheetRow(null);
    setSheetOpen(true);
  }

  function openEdit(row: DirectorioEmprendimientoResponseDto) {
    setSheetMode("edit");
    setSheetRow(row);
    setSheetOpen(true);
  }

  function canEditRow(row: DirectorioEmprendimientoResponseDto): boolean {
    if (!profile.data) return false;
    return (
      profile.data.nivel === NivelUsuario.ADMINISTRADOR ||
      profile.data.id === row.usuarioId
    );
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

  if (!directorioCanAccessModule(profile.data)) {
    return (
      <PageCallout>
        No tenés acceso al directorio de emprendimientos con tu tipo de cuenta.
        Si necesitás permisos, contactá a administración.
      </PageCallout>
    );
  }

  if (listQuery.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (listQuery.isError) {
    return (
      <PageCallout variant="destructive">
        {getApiErrorMessage(listQuery.error)}
      </PageCallout>
    );
  }

  return (
    <div className="layout-page-section flex flex-col gap-4">
      <ListPageToolbar
        end={
          <>
            {myRow ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => openEdit(myRow)}
              >
                Editar mi emprendimiento
              </Button>
            ) : null}
            {canRegisterSelf ? (
              <Button type="button" size="sm" onClick={() => openCreate()}>
                Registrar mi emprendimiento
              </Button>
            ) : null}
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Podés editar cualquier registro. Eliminar solo disponible para administradores."
            : "Podés editar tu propio emprendimiento."}
        </p>
      </ListPageToolbar>

      {layout === "cards" ? (
        rows.length === 0 ? (
          <ListCardGridEmpty>
            No hay emprendimientos registrados.
          </ListCardGridEmpty>
        ) : (
          <div className="layout-list-grid">
            {rows.map((row) => {
              const editable = canEditRow(row);
              const deletable = isAdmin === true;
              const showMenu = editable || deletable;
              return (
                <ListCardWithMedia key={row.id}>
                  <ListCardThumbnail
                    src={row.imagenUrl}
                    alt={row.nombreProyecto}
                  />
                  <ListCardHeader>
                    <CardTitle className="truncate text-base leading-snug">
                      {row.nombreProyecto}
                    </CardTitle>
                    {showMenu ? (
                      <CardAction>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Acciones para ${row.nombreProyecto}`}
                            >
                              <MoreVerticalIcon className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {editable ? (
                              <DropdownMenuItem onClick={() => openEdit(row)}>
                                Editar
                              </DropdownMenuItem>
                            ) : null}
                            {deletable ? (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTargetId(row.id)}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardAction>
                    ) : null}
                  </ListCardHeader>
                  <ListCardContent>
                    <CardDescription>
                      {
                        AREA_LABELS[
                          row.areaCreativa as AreaCreativaEmprendimiento
                        ]
                      }
                    </CardDescription>
                    <Badge variant={row.perfilActivo ? "default" : "secondary"}>
                      {row.perfilActivo ? "Activo" : "Inactivo"}
                    </Badge>
                    <CardDescription className="truncate">
                      {toCellText(row.correo)}
                    </CardDescription>
                    <CardDescription className="truncate">
                      {toCellText(row.sitioWeb)}
                    </CardDescription>
                  </ListCardContent>
                </ListCardWithMedia>
              );
            })}
          </div>
        )
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proyecto</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Sitio</TableHead>
              <TableHead className="w-[72px] text-end">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No hay emprendimientos registrados.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const editable = canEditRow(row);
                const deletable = isAdmin === true;
                const showMenu = editable || deletable;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.nombreProyecto}
                    </TableCell>
                    <TableCell>
                      {
                        AREA_LABELS[
                          row.areaCreativa as AreaCreativaEmprendimiento
                        ]
                      }
                    </TableCell>
                    <TableCell>{row.perfilActivo ? "Sí" : "No"}</TableCell>
                    <TableCell className="max-w-[160px] truncate text-muted-foreground">
                      {toCellText(row.correo)}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-muted-foreground">
                      {toCellText(row.sitioWeb)}
                    </TableCell>
                    <TableCell className="text-end">
                      {showMenu ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Acciones para ${row.nombreProyecto}`}
                            >
                              <MoreVerticalIcon className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {editable ? (
                              <DropdownMenuItem onClick={() => openEdit(row)}>
                                Editar
                              </DropdownMenuItem>
                            ) : null}
                            {deletable ? (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTargetId(row.id)}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      <DirectorioFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        row={sheetRow}
      />

      <AlertDialog
        open={deleteTargetId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar emprendimiento</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Eliminar este registro del
              directorio?
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
