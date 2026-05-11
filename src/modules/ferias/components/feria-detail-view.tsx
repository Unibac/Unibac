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
import { Button } from "@/components/ui/button";
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
import { PropuestaFeriaFormSheet } from "@/modules/ferias/components/propuesta-feria-form-sheet";
import {
  useFeriaDetailQuery,
  useMisPropuestasQuery,
  usePropuestasPorFeriaQuery,
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

const AREA_LABELS: Record<CreatePropuestaFeriaDtoAreaCreativa, string> = {
  [CreatePropuestaFeriaDtoAreaCreativa.ARTES_PLASTICAS]: "Artes plásticas",
  [CreatePropuestaFeriaDtoAreaCreativa.MUSICA]: "Música",
  [CreatePropuestaFeriaDtoAreaCreativa.DISENO]: "Diseño",
  [CreatePropuestaFeriaDtoAreaCreativa.AUDIOVISUAL]: "Audiovisual",
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

type EstadoFiltroUi =
  | "todas"
  | (typeof FeriasControllerFindPropuestasPorFeriaEstado)[keyof typeof FeriasControllerFindPropuestasPorFeriaEstado];

export function FeriaDetailView({ feriaId }: { feriaId: number }) {
  const profile = useProfile();
  const feriaQuery = useFeriaDetailQuery(feriaId);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltroUi>("todas");
  const isAdmin = feriasIsAdmin(profile.data);
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
    if (!profile.data || !feria) return false;
    if (feria.periodo !== FeriaResponseDtoPeriodo.activa) return false;
    if (row.estado !== PropuestaFeriaResponseDtoEstado.POSTULADO) return false;
    return profile.data.id === row.usuarioId;
  }

  const bannerUrl = feria ? toCellText(feria.imagenBannerUrl) : "—";
  const bannerSrc =
    bannerUrl !== "—" && /^https?:\/\//i.test(bannerUrl) ? bannerUrl : null;

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

  return (
    <div className="flex flex-col gap-6">
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
