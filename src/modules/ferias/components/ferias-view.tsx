"use client";

import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  type FeriaResponseDto,
  FeriaResponseDtoPeriodo,
  PropuestaFeriaResponseDtoEstado,
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
import { Input } from "@/components/ui/input";
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
import { FeriaFormSheet } from "@/modules/ferias/components/feria-form-sheet";
import { useDeleteFeriaMutation } from "@/modules/ferias/hooks/use-ferias-mutations";
import {
  useFeriasListQuery,
  useMisPropuestasQuery,
} from "@/modules/ferias/hooks/use-ferias-queries";
import {
  feriasCanPostular,
  feriasIsAdmin,
} from "@/modules/ferias/utils/ferias-permissions";

const PERIODO_LABELS: Record<FeriaResponseDtoPeriodo, string> = {
  [FeriaResponseDtoPeriodo.proxima]: "Próxima",
  [FeriaResponseDtoPeriodo.activa]: "En curso",
  [FeriaResponseDtoPeriodo.finalizada]: "Finalizada",
};

const ESTADO_PROP_LABELS: Record<PropuestaFeriaResponseDtoEstado, string> = {
  [PropuestaFeriaResponseDtoEstado.POSTULADO]: "Postulado",
  [PropuestaFeriaResponseDtoEstado.ACEPTADO]: "Aceptado",
  [PropuestaFeriaResponseDtoEstado.RECHAZADO]: "Rechazado",
};

export function FeriasView() {
  const profile = useProfile();
  const listQuery = useFeriasListQuery();
  const misPropuestasQuery = useMisPropuestasQuery(
    Boolean(profile.data && feriasCanPostular(profile.data)),
  );
  const deleteMut = useDeleteFeriaMutation();

  const isAdmin = feriasIsAdmin(profile.data);
  const canPostular = feriasCanPostular(profile.data);

  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [sheetRow, setSheetRow] = useState<FeriaResponseDto | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (deleteTargetId != null) setDeleteError(null);
  }, [deleteTargetId]);

  const rows = listQuery.data ?? [];

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const blob = `${r.nombre} ${r.descripcion}`.toLowerCase();
      return blob.includes(q);
    });
  }, [rows, search]);

  function openCreate() {
    setSheetMode("create");
    setSheetRow(null);
    setSheetOpen(true);
  }

  function openEdit(row: FeriaResponseDto) {
    setSheetMode("edit");
    setSheetRow(row);
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

  const misRows = misPropuestasQuery.data ?? [];

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
    <div className="flex flex-col gap-8">
      {canPostular ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Mis propuestas</h2>
          {misPropuestasQuery.isPending ? (
            <Skeleton className="h-24 w-full max-w-3xl" />
          ) : misPropuestasQuery.isError ? (
            <p
              role="alert"
              className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {getApiErrorMessage(misPropuestasQuery.error)}
            </p>
          ) : misRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no registraste propuestas en ninguna feria.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feria</TableHead>
                  <TableHead>Emprendimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-end">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {misRows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">
                      {p.feria?.nombre ?? `Feria #${p.feriaId}`}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {p.nombreEmprendimiento}
                    </TableCell>
                    <TableCell className="text-xs">
                      {ESTADO_PROP_LABELS[p.estado]}
                    </TableCell>
                    <TableCell className="text-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/ferias/${p.feriaId}`}>
                          Ver feria
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Ferias virtuales próximas, en curso y finalizadas.
          </p>
          {isAdmin ? (
            <Button type="button" size="sm" onClick={openCreate}>
              Nueva feria
            </Button>
          ) : null}
        </div>

        <div className="max-w-md">
          <Input
            type="search"
            placeholder="Buscar por nombre o descripción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filtrar ferias"
            className="text-sm"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead className="w-[72px] text-end">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  {rows.length === 0
                    ? "No hay ferias cargadas."
                    : "Ninguna feria coincide con la búsqueda."}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => {
                const showAdminMenu = isAdmin;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.nombre}</TableCell>
                    <TableCell className="text-xs">
                      {PERIODO_LABELS[row.periodo]}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <time dateTime={row.fechaInicio}>
                        {new Date(row.fechaInicio).toLocaleDateString()}
                      </time>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <time dateTime={row.fechaFin}>
                        {new Date(row.fechaFin).toLocaleDateString()}
                      </time>
                    </TableCell>
                    <TableCell className="text-end">
                      {showAdminMenu ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Acciones para ${row.nombre}`}
                            >
                              <DotsThreeVerticalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/ferias/${row.id}`}>
                                Ver
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(row)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTargetId(row.id)}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/ferias/${row.id}`}>Ver</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </section>

      <FeriaFormSheet
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
            <AlertDialogTitle>Eliminar feria</AlertDialogTitle>
            <AlertDialogDescription>
              Si hay propuestas asociadas, el servidor puede rechazar la
              eliminación. Esta acción no se puede deshacer.
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
