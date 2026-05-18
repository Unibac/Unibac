"use client";

import { MoreVerticalIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  CreatePropuestaFeriaDtoAreaCreativa,
  FeriaResponseDtoPeriodo,
  FeriasControllerFindPropuestasPorFeriaEstado,
  type PropuestaFeriaResponseDto,
  PropuestaFeriaResponseDtoEstado,
} from "@/api/generated/models";
import { useDashboardListLayout } from "@/components/layout/dashboard-list-layout";
import { ListCardThumbnail } from "@/components/shared/list-card-thumbnail";
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
import { parsePublicImageUrl } from "@/lib/media/parse-public-image-url";
import { useProfile } from "@/modules/auth/hooks/use-profile";
import {
  ModerarPropuestaDialog,
  type ModerarPropuestaTarget,
} from "@/modules/ferias/components/moderar-propuesta-dialog";
import { MiPropuestaEnFeriaCard } from "@/modules/ferias/components/mi-propuesta-en-feria-card";
import { PropuestaFeriaFormSheet } from "@/modules/ferias/components/propuesta-feria-form-sheet";
import {
  FERIAS_BROWSE_ONLY_MESSAGE,
  FERIAS_STAFF_NO_POSTULAR_MESSAGE,
} from "@/modules/ferias/lib/ferias-copy";
import { canEditMisPropuesta } from "@/modules/ferias/lib/propuesta-feria-rules";
import {
  useFeriaDetailQuery,
  useMisPropuestasQuery,
  usePropuestasPorFeriaQuery,
} from "@/modules/ferias/hooks/use-ferias-queries";
import {
  feriasCanBrowse,
  feriasCanManageEventos,
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

const AREA_LABELS: Record<CreatePropuestaFeriaDtoAreaCreativa, string> = {
  [CreatePropuestaFeriaDtoAreaCreativa.ARTES_PLASTICAS]: "Artes plásticas",
  [CreatePropuestaFeriaDtoAreaCreativa.MUSICA]: "Música",
  [CreatePropuestaFeriaDtoAreaCreativa.DISENO]: "Diseño",
  [CreatePropuestaFeriaDtoAreaCreativa.AUDIOVISUAL]: "Audiovisual",
};

type EstadoFiltroUi =
  | "todas"
  | (typeof FeriasControllerFindPropuestasPorFeriaEstado)[keyof typeof FeriasControllerFindPropuestasPorFeriaEstado];

export function FeriaDetailView({ feriaId }: { feriaId: number }) {
  const profile = useProfile();
  const { layout } = useDashboardListLayout();
  const feriaQuery = useFeriaDetailQuery(feriaId);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltroUi>("todas");
  const isAdmin = feriasIsAdmin(profile.data);
  const canManageEventos = feriasCanManageEventos(profile.data);
  const canPostular = feriasCanPostular(profile.data);

  const estadoApi = estadoFiltro === "todas" ? undefined : estadoFiltro;

  const propuestasQuery = usePropuestasPorFeriaQuery(feriaId, estadoApi, true);

  const misPropuestasQuery = useMisPropuestasQuery(
    Boolean(profile.data && canPostular),
  );

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [sheetRow, setSheetRow] = useState<PropuestaFeriaResponseDto | null>(
    null,
  );

  const [moderarTarget, setModerarTarget] =
    useState<ModerarPropuestaTarget | null>(null);

  const feria = feriaQuery.data;
  const rows = propuestasQuery.data ?? [];

  const miPropuestaEnEstaFeria = useMemo(() => {
    const list = misPropuestasQuery.data ?? [];
    return list.find((p) => p.feriaId === feriaId) ?? null;
  }, [misPropuestasQuery.data, feriaId]);

  const puedeNuevaPropuesta =
    canPostular &&
    feria?.periodo === FeriaResponseDtoPeriodo.activa &&
    miPropuestaEnEstaFeria == null;

  function openCreatePropuesta() {
    setSheetMode("create");
    setSheetRow(null);
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

  const feriaActiva = feria?.periodo === FeriaResponseDtoPeriodo.activa;

  const bannerSrc = feria ? parsePublicImageUrl(feria.imagenBannerUrl) : null;

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
      <div className="flex flex-col gap-4">
        <p
          role="alert"
          className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {getApiErrorMessage(feriaQuery.error)}
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/ferias">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  if (!feria) return null;

  if (!feriasCanBrowse(profile.data)) {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="alert"
          className="rounded-none border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
        >
          No tenés acceso a ferias con tu tipo de cuenta. Si necesitás permisos,
          contactá a administración.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/ferias">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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
      <div className="flex flex-col gap-4 rounded-none border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="font-heading text-lg font-semibold">
              {feria.nombre}
            </h2>
            <p className="text-sm text-muted-foreground">{feria.descripcion}</p>
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
            <span className="inline-flex rounded-none border border-border px-2 py-0.5 text-xs">
              {PERIODO_LABELS[feria.periodo]}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {puedeNuevaPropuesta ? (
              <Button type="button" size="sm" onClick={openCreatePropuesta}>
                Nueva propuesta
              </Button>
            ) : null}
          </div>
        </div>
        {bannerSrc ? (
          <Image
            src={bannerSrc}
            alt=""
            width={1200}
            height={384}
            unoptimized
            className="max-h-48 w-full max-w-3xl border border-border object-cover"
          />
        ) : null}
      </div>

      {canPostular && miPropuestaEnEstaFeria ? (
        <MiPropuestaEnFeriaCard
          propuesta={miPropuestaEnEstaFeria}
          feriaPeriodo={feria.periodo}
          canEdit={canEditPropuesta(miPropuestaEnEstaFeria)}
          onEdit={() => openEditPropuesta(miPropuestaEnEstaFeria)}
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium">Propuestas</h3>
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Estado</span>
              <Select
                value={estadoFiltro}
                onValueChange={(v) => setEstadoFiltro(v as EstadoFiltroUi)}
              >
                <SelectTrigger size="sm" className="w-[160px]">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem
                    value={
                      FeriasControllerFindPropuestasPorFeriaEstado.POSTULADO
                    }
                  >
                    Postulado
                  </SelectItem>
                  <SelectItem
                    value={
                      FeriasControllerFindPropuestasPorFeriaEstado.ACEPTADO
                    }
                  >
                    Aceptado
                  </SelectItem>
                  <SelectItem
                    value={
                      FeriasControllerFindPropuestasPorFeriaEstado.RECHAZADO
                    }
                  >
                    Rechazado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Solo se muestran propuestas aceptadas en vitrina.
            </p>
          )}
        </div>

        {propuestasQuery.isPending ? (
          <Skeleton className="h-48 w-full" />
        ) : propuestasQuery.isError ? (
          <p
            role="alert"
            className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {getApiErrorMessage(propuestasQuery.error)}
          </p>
        ) : layout === "cards" ? (
          rows.length === 0 ? (
            <p className="rounded-md border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground transition-colors duration-150">
              No hay propuestas para mostrar.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((row) => {
                const editable = canEditPropuesta(row);
                const moderar =
                  isAdmin &&
                  row.estado === PropuestaFeriaResponseDtoEstado.POSTULADO;
                const menu = editable || moderar;
                return (
                  <Card
                    key={row.id}
                    className="gap-0 py-0 transition-colors duration-150"
                  >
                    <ListCardThumbnail
                      src={row.imagenUrl}
                      alt={row.nombreEmprendimiento}
                    />
                    <CardHeader className="gap-3 border-b border-border pb-4">
                      <div className="flex min-w-0 flex-row items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base leading-snug">
                            {row.nombreEmprendimiento}
                          </CardTitle>
                          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                            {row.descripcionCorta}
                          </p>
                        </div>
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
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 pt-4 pb-6 text-sm">
                      <p className="text-xs text-muted-foreground">
                        {
                          AREA_LABELS[
                            row.areaCreativa as CreatePropuestaFeriaDtoAreaCreativa
                          ]
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ESTADO_PROP_LABELS[row.estado]}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {row.correo}
                      </p>
                    </CardContent>
                  </Card>
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
                    isAdmin &&
                    row.estado === PropuestaFeriaResponseDtoEstado.POSTULADO;
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
                            row.areaCreativa as CreatePropuestaFeriaDtoAreaCreativa
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
      </div>

      <PropuestaFeriaFormSheet
        feriaId={feriaId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        row={sheetRow}
        feriaActiva={feriaActiva}
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
