"use client";

import { MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  AreaCreativaEmprendimiento,
  FeriaPeriodo,
  EstadoPropuestaFeria,
  type PropuestaFeriaResponseDto,
} from "@/modules/shared/types/api-models";
import { useDashboardListLayout } from "@/components/layout/dashboard-list-layout";
import { ListCardContent } from "@/components/shared/list-card-content";
import { ListCardGridEmpty } from "@/components/shared/list-card-grid-empty";
import { ListCardHeader } from "@/components/shared/list-card-header";
import { ListCardThumbnail } from "@/components/shared/list-card-thumbnail";
import { ListCardWithMedia } from "@/components/shared/list-card-with-media";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageCallout } from "@/components/shared/page-callout";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardAction, CardDescription, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  ModerarPropuestaDialog,
  type ModerarPropuestaTarget,
} from "@/modules/ferias/components/moderar-propuesta-dialog";
import { MiPropuestaEnFeriaCard } from "@/modules/ferias/components/mi-propuesta-en-feria-card";
import { PropuestaFeriaFormSheet } from "@/modules/ferias/components/propuesta-feria-form-sheet";
import {
  FERIAS_BROWSE_ONLY_MESSAGE,
  FERIAS_POSTULACION_CERRADA_MESSAGE,
  FERIAS_POSTULACION_PROXIMA_HINT,
  FERIAS_STAFF_NO_POSTULAR_MESSAGE,
} from "@/modules/ferias/lib/ferias-copy";
import {
  canEditMisPropuesta,
  feriaPermitePostulacion,
} from "@/modules/ferias/lib/propuesta-feria-rules";
import {
  useFeriaDetailQuery,
  useMisPropuestasQuery,
  usePropuestasPorFeriaQuery,
} from "@/modules/ferias/hooks/use-ferias-queries";
import type { PropuestasPorFeriaEstadoFilter } from "@/modules/ferias/query-keys";
import {
  feriasCanBrowse,
  feriasCanManageEventos,
  feriasCanPostular,
  feriasIsAdmin,
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

const AREA_LABELS: Record<AreaCreativaEmprendimiento, string> = {
  [AreaCreativaEmprendimiento.ARTES_PLASTICAS]: "Artes plásticas",
  [AreaCreativaEmprendimiento.MUSICA]: "Música",
  [AreaCreativaEmprendimiento.DISENO]: "Diseño",
  [AreaCreativaEmprendimiento.AUDIOVISUAL]: "Audiovisual",
};

export function FeriaDetailView({ feriaId }: { feriaId: number }) {
  const profile = useProfile();
  const { layout } = useDashboardListLayout();
  const feriaQuery = useFeriaDetailQuery(feriaId);
  const [estadoFiltro, setEstadoFiltro] =
    useState<PropuestasPorFeriaEstadoFilter>("todas");
  const isAdmin = feriasIsAdmin(profile.data);
  const canManageEventos = feriasCanManageEventos(profile.data);
  const canPostular = feriasCanPostular(profile.data);

  const propuestasQuery = usePropuestasPorFeriaQuery(feriaId, estadoFiltro, {
    adminVerTodasEstados: isAdmin,
  });

  const misPropuestasQuery = useMisPropuestasQuery(
    Boolean(profile.data && canPostular),
  );

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [sheetRow, setSheetRow] = useState<PropuestaFeriaResponseDto | null>(
    null,
  );
  const [propuestaCreateSheetKey, setPropuestaCreateSheetKey] = useState(0);

  const [moderarTarget, setModerarTarget] =
    useState<ModerarPropuestaTarget | null>(null);

  const feria = feriaQuery.data;
  const rows = propuestasQuery.data ?? [];

  const miPropuestaEnEstaFeria = useMemo(() => {
    const list = misPropuestasQuery.data ?? [];
    return list.find((p) => p.feriaId === feriaId) ?? null;
  }, [misPropuestasQuery.data, feriaId]);

  const postulacionAbierta = feriaPermitePostulacion(feria?.periodo);

  const puedeNuevaPropuesta =
    canPostular && postulacionAbierta && miPropuestaEnEstaFeria == null;

  function openCreatePropuesta() {
    setSheetMode("create");
    setSheetRow(null);
    setPropuestaCreateSheetKey((k) => k + 1);
    setSheetOpen(true);
  }

  function openEditPropuesta(row: PropuestaFeriaResponseDto) {
    setSheetMode("edit");
    setSheetRow(row);
    setSheetOpen(true);
  }

  function canEditPropuesta(row: PropuestaFeriaResponseDto): boolean {
    return canEditMisPropuesta(row, {
      canPostular,
      usuarioId: profile.data?.id,
      feriaPeriodo: feria?.periodo,
    });
  }

  if (feriaQuery.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40 w-full max-w-3xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (feriaQuery.isError) {
    return (
      <div className="layout-page-section flex flex-col gap-4">
        <PageCallout variant="destructive">
          {getApiErrorMessage(feriaQuery.error)}
        </PageCallout>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/ferias">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  if (!feria) return null;

  const feriaProxima = feria.periodo === FeriaPeriodo.proxima;

  if (!feriasCanBrowse(profile.data)) {
    return (
      <div className="flex flex-col gap-4">
        <PageCallout>
          No tienes acceso a ferias con tu tipo de cuenta. Si necesitas permisos,
          contacta a administración.
        </PageCallout>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/ferias">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumb
        items={[
          { label: "Ferias", href: "/dashboard/ferias" },
          { label: feria.nombre },
        ]}
      />
      {canManageEventos && !canPostular ? (
        <PageCallout>{FERIAS_STAFF_NO_POSTULAR_MESSAGE}</PageCallout>
      ) : null}
      {!canPostular && !canManageEventos ? (
        <PageCallout>{FERIAS_BROWSE_ONLY_MESSAGE}</PageCallout>
      ) : null}
      <ListCardWithMedia>
        <ListCardThumbnail src={feria.imagenBannerUrl} alt={feria.nombre} />
        <ListCardHeader>
          <CardTitle className="font-heading text-lg font-semibold">
            {feria.nombre}
          </CardTitle>
          {puedeNuevaPropuesta ? (
            <CardAction>
              <Button type="button" size="sm" onClick={openCreatePropuesta}>
                Nueva propuesta
              </Button>
            </CardAction>
          ) : null}
        </ListCardHeader>
        <ListCardContent className="gap-3">
          <CardDescription>{feria.descripcion}</CardDescription>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>
              Inicio:{" "}
              <time dateTime={feria.fechaInicio}>
                {new Date(feria.fechaInicio).toLocaleString()}
              </time>
            </span>
            <span>·</span>
            <span>
              Fin:{" "}
              <time dateTime={feria.fechaFin}>
                {new Date(feria.fechaFin).toLocaleString()}
              </time>
            </span>
          </div>
          <Badge variant="outline">{PERIODO_LABELS[feria.periodo]}</Badge>
          {canPostular && feriaProxima && !miPropuestaEnEstaFeria ? (
            <PageCallout className="text-xs">
              {FERIAS_POSTULACION_PROXIMA_HINT}
            </PageCallout>
          ) : null}
          {canPostular && !postulacionAbierta && !miPropuestaEnEstaFeria ? (
            <PageCallout className="text-xs">
              {FERIAS_POSTULACION_CERRADA_MESSAGE}
            </PageCallout>
          ) : null}
        </ListCardContent>
      </ListCardWithMedia>
      {canPostular && miPropuestaEnEstaFeria ? (
        <MiPropuestaEnFeriaCard
          propuesta={miPropuestaEnEstaFeria}
          feriaPeriodo={feria.periodo}
          canEdit={canEditPropuesta(miPropuestaEnEstaFeria)}
          onEdit={() => openEditPropuesta(miPropuestaEnEstaFeria)}
        />
      ) : null}

      <section className="layout-page-section flex flex-col gap-3">
        <SectionHeader
          title="Propuestas"
          description={
            isAdmin
              ? undefined
              : "Solo se muestran propuestas aceptadas en vitrina."
          }
          actions={
            isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Estado</span>
                <Select
                  value={estadoFiltro}
                  onValueChange={(v) =>
                    setEstadoFiltro(v as PropuestasPorFeriaEstadoFilter)
                  }
                >
                  <SelectTrigger size="sm" className="w-[160px]">
                    <SelectValue placeholder="Filtrar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value={EstadoPropuestaFeria.POSTULADO}>
                      Postulado
                    </SelectItem>
                    <SelectItem value={EstadoPropuestaFeria.ACEPTADO}>
                      Aceptado
                    </SelectItem>
                    <SelectItem value={EstadoPropuestaFeria.RECHAZADO}>
                      Rechazado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : undefined
          }
        />

        {propuestasQuery.isPending ? (
          <Skeleton className="h-48 w-full" />
        ) : propuestasQuery.isError ? (
          <PageCallout variant="destructive">
            {getApiErrorMessage(propuestasQuery.error)}
          </PageCallout>
        ) : layout === "cards" ? (
          rows.length === 0 ? (
            <ListCardGridEmpty>
              No hay propuestas para mostrar.
            </ListCardGridEmpty>
          ) : (
            <div className="layout-list-grid">
              {rows.map((row) => {
                const editable = canEditPropuesta(row);
                const moderar =
                  isAdmin && row.estado === EstadoPropuestaFeria.POSTULADO;
                const menu = editable || moderar;
                return (
                  <ListCardWithMedia key={row.id}>
                    <ListCardThumbnail
                      src={row.imagenUrl}
                      alt={row.nombreEmprendimiento}
                    />
                    <ListCardHeader>
                      <CardTitle className="text-base leading-snug">
                        {row.nombreEmprendimiento}
                      </CardTitle>
                      {menu ? (
                        <CardAction>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Acciones para ${row.nombreEmprendimiento}`}
                              >
                                <MoreVerticalIcon className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {editable ? (
                                <DropdownMenuItem
                                  onClick={() => openEditPropuesta(row)}
                                >
                                  Editar mi propuesta
                                </DropdownMenuItem>
                              ) : null}
                              {moderar ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setModerarTarget({
                                        propuesta: row,
                                        accion: "aceptar",
                                      })
                                    }
                                  >
                                    Aceptar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() =>
                                      setModerarTarget({
                                        propuesta: row,
                                        accion: "rechazar",
                                      })
                                    }
                                  >
                                    Rechazar
                                  </DropdownMenuItem>
                                </>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardAction>
                      ) : null}
                      <CardDescription className="line-clamp-2">
                        {row.descripcionCorta}
                      </CardDescription>
                    </ListCardHeader>
                    <ListCardContent>
                      <CardDescription>
                        {
                          AREA_LABELS[
                            row.areaCreativa as AreaCreativaEmprendimiento
                          ]
                        }
                      </CardDescription>
                      <Badge
                        variant={
                          row.estado === EstadoPropuestaFeria.RECHAZADO
                            ? "destructive"
                            : row.estado === EstadoPropuestaFeria.ACEPTADO
                              ? "default"
                              : "secondary"
                        }
                      >
                        {ESTADO_PROP_LABELS[row.estado]}
                      </Badge>
                      <CardDescription className="truncate">
                        {row.correo}
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
                <TableHead>Emprendimiento</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead className="w-[72px] text-end">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No hay propuestas para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const editable = canEditPropuesta(row);
                  const moderar =
                    isAdmin && row.estado === EstadoPropuestaFeria.POSTULADO;
                  const menu = editable || moderar;
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="max-w-[220px]">
                        <div className="font-medium">
                          {row.nombreEmprendimiento}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {row.descripcionCorta}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {
                          AREA_LABELS[
                            row.areaCreativa as AreaCreativaEmprendimiento
                          ]
                        }
                      </TableCell>
                      <TableCell className="text-xs">
                        {ESTADO_PROP_LABELS[row.estado]}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-xs text-muted-foreground">
                        {row.correo}
                      </TableCell>
                      <TableCell className="text-end">
                        {menu ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Acciones para ${row.nombreEmprendimiento}`}
                              >
                                <MoreVerticalIcon className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {editable ? (
                                <DropdownMenuItem
                                  onClick={() => openEditPropuesta(row)}
                                >
                                  Editar mi propuesta
                                </DropdownMenuItem>
                              ) : null}
                              {moderar ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setModerarTarget({
                                        propuesta: row,
                                        accion: "aceptar",
                                      })
                                    }
                                  >
                                    Aceptar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() =>
                                      setModerarTarget({
                                        propuesta: row,
                                        accion: "rechazar",
                                      })
                                    }
                                  >
                                    Rechazar
                                  </DropdownMenuItem>
                                </>
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
      </section>

      <PropuestaFeriaFormSheet
        key={
          sheetMode === "edit" && sheetRow
            ? `propuesta-edit-${sheetRow.id}`
            : `propuesta-create-${propuestaCreateSheetKey}`
        }
        feriaId={feriaId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        row={sheetRow}
        postulacionAbierta={postulacionAbierta}
      />

      <ModerarPropuestaDialog
        target={moderarTarget}
        onOpenChange={(next) => {
          if (!next) setModerarTarget(null);
        }}
      />
    </div>
  );
}
