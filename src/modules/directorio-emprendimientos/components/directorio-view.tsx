"use client";

import { MoreVerticalIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AuthProfileResponseDtoNivel,
  CreateDirectorioEmprendimientoDtoAreaCreativa,
  type DirectorioEmprendimientoResponseDto,
} from "@/api/generated/models";
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
import { DirectorioFormSheet } from "@/modules/directorio-emprendimientos/components/directorio-form-sheet";
import { useDeleteDirectorioMutation } from "@/modules/directorio-emprendimientos/hooks/use-directorio-mutations";
import { useDirectorioListQuery } from "@/modules/directorio-emprendimientos/hooks/use-directorio-queries";

const AREA_LABELS: Record<
  CreateDirectorioEmprendimientoDtoAreaCreativa,
  string
> = {
  [CreateDirectorioEmprendimientoDtoAreaCreativa.ARTES_PLASTICAS]:
    "Artes plásticas",
  [CreateDirectorioEmprendimientoDtoAreaCreativa.MUSICA]: "Música",
  [CreateDirectorioEmprendimientoDtoAreaCreativa.DISENO]: "Diseño",
  [CreateDirectorioEmprendimientoDtoAreaCreativa.AUDIOVISUAL]: "Audiovisual",
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
  const profile = useProfile();
  const listQuery = useDirectorioListQuery();
  const deleteMut = useDeleteDirectorioMutation();

  const isAdmin =
    profile.data?.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR;

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
      profile.data.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR ||
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
      <p
        role="alert"
        className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {getApiErrorMessage(listQuery.error)}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {isAdmin
            ? "Podés editar cualquier registro. Eliminar solo disponible para administradores."
            : "Podés editar tu propio emprendimiento."}
        </div>
        <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

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
                        row.areaCreativa as CreateDirectorioEmprendimientoDtoAreaCreativa
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
