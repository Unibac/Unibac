"use client";

import { MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  type FeriaResponseDto,
  FeriaPeriodo,
  type PropuestaFeriaResponseDto,
  EstadoPropuestaFeria,
} from "@/modules/shared/types/api-models";
import { useDashboardListLayout } from "@/components/layout/dashboard-list-layout";
import { ListCardContent } from "@/components/shared/list-card-content";
import { ListCardFooter } from "@/components/shared/list-card-footer";
import { ListCardGridEmpty } from "@/components/shared/list-card-grid-empty";
import { ListCardHeader } from "@/components/shared/list-card-header";
import { ListCardThumbnail } from "@/components/shared/list-card-thumbnail";
import { ListCardWithMedia } from "@/components/shared/list-card-with-media";
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
import { CardAction, CardDescription, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const PERIODO_LABELS: Record<FeriaPeriodo, string> = {
  [FeriaPeriodo.proxima]: "Próxima",
  [FeriaPeriodo.activa]: "En curso",
  [FeriaPeriodo.finalizada]: "Finalizada",
};

const ESTADO_PROP_LABELS: Record<EstadoPropuestaFeria, string> = {
  [EstadoPropuestaFeria.POSTULADO]: "Postulado",
  [EstadoPropuestaFeria.ACEPTADO]: "Aceptado",
  [EstadoPropuestaFeria.RECHAZADO]: "Rechazado",
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
  const [feriaCreateSheetKey, setFeriaCreateSheetKey] = useState(0);

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
    setFeriaCreateSheetKey((k) => k + 1);
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
      <PageCallout>
        No tienes acceso a ferias con tu tipo de cuenta. Si necesitas permisos,
        contacta a administración.
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

  const feriasCallouts = (
    <>
      {canManageEventos && !canPostular ? (
        <PageCallout>{FERIAS_STAFF_NO_POSTULAR_MESSAGE}</PageCallout>
      ) : null}
      {!canPostular && !canManageEventos ? (
        <PageCallout>{FERIAS_BROWSE_ONLY_MESSAGE}</PageCallout>
      ) : null}
    </>
  );

  const misPropuestasContent = (
    <>
      {misPropuestasQuery.isPending ? (
        <Skeleton className="h-24 w-full max-w-3xl" />
      ) : misPropuestasQuery.isError ? (
        <PageCallout variant="destructive" className="text-xs">
          {getApiErrorMessage(misPropuestasQuery.error)}
        </PageCallout>
      ) : misRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no registraste propuestas en ninguna feria.
        </p>
      ) : layout === "cards" ? (
        <div className="layout-list-grid">
          {misRows.map((p) => (
            <ListCardWithMedia key={p.id}>
              <ListCardThumbnail
                src={p.imagenUrl}
                alt={p.nombreEmprendimiento}
              />
              <ListCardHeader className="gap-2">
                <CardTitle className="line-clamp-2 text-base leading-snug">
                  {p.nombreEmprendimiento}
                </CardTitle>
              </ListCardHeader>
              <ListCardContent className="pb-4">
                <CardDescription>
                  {p.feria?.nombre ?? `Feria #${p.feriaId}`}
                </CardDescription>
                <Badge
                  variant={
                    p.estado === EstadoPropuestaFeria.RECHAZADO
                      ? "destructive"
                      : p.estado === EstadoPropuestaFeria.ACEPTADO
                        ? "default"
                        : "secondary"
                  }
                >
                  {ESTADO_PROP_LABELS[p.estado]}
                </Badge>
              </ListCardContent>
              <ListCardFooter className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/ferias/${p.feriaId}`}>Ver feria</Link>
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
              </ListCardFooter>
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
    </>
  );

  const explorarFeriasSection = (
    <section className="layout-page-section flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Ferias virtuales próximas, en curso y finalizadas.
      </p>
      <ListPageToolbar
        sticky
        end={
          canManageEventos ? (
            <Button type="button" size="sm" onClick={openCreate}>
              Nueva feria
            </Button>
          ) : undefined
        }
      >
        <Input
          type="search"
          placeholder="Buscar por nombre o descripción…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Filtrar ferias"
          className="w-full text-sm sm:max-w-xs"
        />
      </ListPageToolbar>

      {layout === "cards" ? (
        filteredRows.length === 0 ? (
          <ListCardGridEmpty>
            {rows.length === 0
              ? "No hay ferias cargadas."
              : "Ninguna feria coincide con la búsqueda."}
          </ListCardGridEmpty>
        ) : (
          <div className="layout-list-grid">
            {filteredRows.map((row) => {
              const showAdminMenu = canManageEventos;
              return (
                <ListCardWithMedia key={row.id}>
                  <ListCardThumbnail
                    src={row.imagenBannerUrl}
                    alt={row.nombre}
                  />
                  <ListCardHeader>
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
                  </ListCardHeader>
                  <ListCardContent
                    className={showAdminMenu ? undefined : "pb-4"}
                  >
                    <Badge variant="outline">
                      {PERIODO_LABELS[row.periodo]}
                    </Badge>
                    <CardDescription>
                      Inicio{" "}
                      <time dateTime={row.fechaInicio}>
                        {new Date(row.fechaInicio).toLocaleDateString()}
                      </time>
                    </CardDescription>
                    <CardDescription>
                      Fin{" "}
                      <time dateTime={row.fechaFin}>
                        {new Date(row.fechaFin).toLocaleDateString()}
                      </time>
                    </CardDescription>
                  </ListCardContent>
                  {!showAdminMenu ? (
                    <ListCardFooter>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/ferias/${row.id}`}>Ver</Link>
                      </Button>
                    </ListCardFooter>
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
      )}
    </section>
  );

  return (
    <div className="flex flex-col gap-6">
      {feriasCallouts}
      {canPostular ? (
        <Tabs defaultValue="explorar">
          <TabsList>
            <TabsTrigger value="explorar">Explorar ferias</TabsTrigger>
            <TabsTrigger value="mis">Mis propuestas</TabsTrigger>
          </TabsList>
          <TabsContent value="mis" className="flex flex-col gap-4 pt-4">
            {misPropuestasContent}
          </TabsContent>
          <TabsContent value="explorar" className="pt-4">
            {explorarFeriasSection}
          </TabsContent>
        </Tabs>
      ) : (
        explorarFeriasSection
      )}

      <FeriaFormSheet
        key={
          sheetMode === "edit" && sheetRow
            ? `feria-edit-${sheetRow.id}`
            : `feria-create-${feriaCreateSheetKey}`
        }
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
