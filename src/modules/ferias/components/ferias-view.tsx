"use client";

import { MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  type FeriaResponseDto,
  FeriaResponseDtoPeriodo,
  type PropuestaFeriaResponseDto,
  PropuestaFeriaResponseDtoEstado,
} from "@/api/generated/models";
import { useDashboardListLayout } from "@/components/layout/dashboard-list-layout";
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
import { Button } from "@/components/ui/button";
import {
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { PropuestaFeriaFormSheet } from "@/modules/ferias/components/propuesta-feria-form-sheet";
import {
  FERIAS_BROWSE_ONLY_MESSAGE,
  FERIAS_STAFF_NO_POSTULAR_MESSAGE,
} from "@/modules/ferias/lib/ferias-copy";
import {
  canEditMisPropuesta,
  feriaPeriodoFromPropuesta,
  feriaPermitePostulacion,
} from "@/modules/ferias/lib/propuesta-feria-rules";
import { useDeleteFeriaMutation } from "@/modules/ferias/hooks/use-ferias-mutations";
import {
  useFeriasListQuery,
  useMisPropuestasQuery,
} from "@/modules/ferias/hooks/use-ferias-queries";
import {
  feriasCanBrowse,
  feriasCanManageEventos,
  feriasCanPostular,
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
  const { layout } = useDashboardListLayout();
  const listQuery = useFeriasListQuery();
  const misPropuestasQuery = useMisPropuestasQuery(
    Boolean(profile.data && feriasCanPostular(profile.data)),
  );
  const deleteMut = useDeleteFeriaMutation();

  const canManageEventos = feriasCanManageEventos(profile.data);
  const canPostular = feriasCanPostular(profile.data);

  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [sheetRow, setSheetRow] = useState<FeriaResponseDto | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [propuestaSheetOpen, setPropuestaSheetOpen] = useState(false);
  const [propuestaSheetRow, setPropuestaSheetRow] =
    useState<PropuestaFeriaResponseDto | null>(null);

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

  function openEditMisPropuesta(row: PropuestaFeriaResponseDto) {
    setPropuestaSheetRow(row);
    setPropuestaSheetOpen(true);
  }

  function misPropuestaEditable(p: PropuestaFeriaResponseDto): boolean {
    return canEditMisPropuesta(p, {
      canPostular,
      usuarioId: profile.data?.id,
      feriaPeriodo: feriaPeriodoFromPropuesta(p),
    });
  }

  if (!feriasCanBrowse(profile.data)) {
    return (
      <p
        role="alert"
        className="rounded-none border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
      >
        No tenés acceso a ferias con tu tipo de cuenta. Si necesitás permisos,
        contactá a administración.
      </p>
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
      {canManageEventos && !canPostular ? (
        <p className="rounded-none border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {FERIAS_STAFF_NO_POSTULAR_MESSAGE}
        </p>
      ) : null}
      {!canPostular && !canManageEventos ? (
        <p className="rounded-none border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {FERIAS_BROWSE_ONLY_MESSAGE}
        </p>
      ) : null}
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
          ) : layout === "cards" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {misRows.map((p) => (
                <ListCardWithMedia key={p.id}>
                  <ListCardThumbnail
                    src={p.imagenUrl}
                    alt={p.nombreEmprendimiento}
                  />
                  <CardHeader className="gap-2 border-b border-border pb-4">
                    <CardTitle className="line-clamp-2 text-base leading-snug">
                      {p.nombreEmprendimiento}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 pt-4 pb-4 text-sm">
                    <p className="text-xs text-muted-foreground">
                      {p.feria?.nombre ?? `Feria #${p.feriaId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ESTADO_PROP_LABELS[p.estado]}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2 border-t border-border pt-4 pb-6">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/ferias/${p.feriaId}`}>
                        Ver feria
                      </Link>
                    </Button>
                    {misPropuestaEditable(p) ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditMisPropuesta(p)}
                      >
                        Editar
                      </Button>
                    ) : null}
                  </CardFooter>
                </ListCardWithMedia>
              ))}
            </div>
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
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/ferias/${p.feriaId}`}>
                            Ver feria
                          </Link>
                        </Button>
                        {misPropuestaEditable(p) ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditMisPropuesta(p)}
                          >
                            Editar
                          </Button>
                        ) : null}
                      </div>
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
          {canManageEventos ? (
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

        {layout === "cards" ? (
          filteredRows.length === 0 ? (
            <p className="rounded-md border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground transition-colors duration-150">
              {rows.length === 0
                ? "No hay ferias cargadas."
                : "Ninguna feria coincide con la búsqueda."}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredRows.map((row) => {
                const showAdminMenu = canManageEventos;
                return (
                  <ListCardWithMedia key={row.id}>
                    <ListCardThumbnail
                      src={row.imagenBannerUrl}
                      alt={row.nombre}
                    />
                    <CardHeader className="gap-3 border-b border-border pb-4">
                      <div className="flex min-w-0 flex-row items-start justify-between gap-2">
                        <CardTitle className="line-clamp-2 text-base leading-snug">
                          {row.nombre}
                        </CardTitle>
                        {showAdminMenu ? (
                          <CardAction>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Acciones para ${row.nombre}`}
                                >
                                  <MoreVerticalIcon className="size-4" />
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
                          </CardAction>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent
                      className={
                        showAdminMenu
                          ? "flex flex-col gap-2 pt-4 pb-6 text-xs text-muted-foreground"
                          : "flex flex-col gap-2 pt-4 pb-4 text-xs text-muted-foreground"
                      }
                    >
                      <p>{PERIODO_LABELS[row.periodo]}</p>
                      <p>
                        Inicio{" "}
                        <time dateTime={row.fechaInicio}>
                          {new Date(row.fechaInicio).toLocaleDateString()}
                        </time>
                      </p>
                      <p>
                        Fin{" "}
                        <time dateTime={row.fechaFin}>
                          {new Date(row.fechaFin).toLocaleDateString()}
                        </time>
                      </p>
                    </CardContent>
                    {!showAdminMenu ? (
                      <CardFooter className="border-t border-border pt-4 pb-6">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/ferias/${row.id}`}>Ver</Link>
                        </Button>
                      </CardFooter>
                    ) : null}
                  </ListCardWithMedia>
                );
              })}
            </div>
          )
        ) : (
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
                  const showAdminMenu = canManageEventos;
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.nombre}
                      </TableCell>
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
                                size="icon"
                                aria-label={`Acciones para ${row.nombre}`}
                              >
                                <MoreVerticalIcon className="size-4" />
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
                            <Link href={`/dashboard/ferias/${row.id}`}>
                              Ver
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </section>

      <FeriaFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        row={sheetRow}
      />

      {propuestaSheetRow ? (
        <PropuestaFeriaFormSheet
          feriaId={propuestaSheetRow.feriaId}
          open={propuestaSheetOpen}
          onOpenChange={(open) => {
            setPropuestaSheetOpen(open);
            if (!open) setPropuestaSheetRow(null);
          }}
          mode="edit"
          row={propuestaSheetRow}
          postulacionAbierta={feriaPermitePostulacion(
            feriaPeriodoFromPropuesta(propuestaSheetRow),
          )}
        />
      ) : null}

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
