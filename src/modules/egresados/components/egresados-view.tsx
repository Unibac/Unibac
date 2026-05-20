"use client";

import { MoreVerticalIcon } from "lucide-react";
import { useEffect, useState } from "react";

import {
  NivelUsuario,
  EstadoLaboralEgresado,
  type EgresadoResponseDto,
} from "@/modules/shared/types/api-models";
import { useDashboardListLayout } from "@/components/layout/dashboard-list-layout";
import { ListCard } from "@/components/shared/list-card";
import { ListCardContent } from "@/components/shared/list-card-content";
import { FilterPanel } from "@/components/shared/filter-panel";
import { ListCardGridEmpty } from "@/components/shared/list-card-grid-empty";
import { ListPageToolbar } from "@/components/shared/list-page-toolbar";
import { PageCallout } from "@/components/shared/page-callout";
import { ListCardHeader } from "@/components/shared/list-card-header";
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
import { Label } from "@/components/ui/label";
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
import { egresadosCanAccessModule } from "@/modules/auth/lib/profile-capabilities";
import { EgresadoFormSheet } from "@/modules/egresados/components/egresado-form-sheet";
import { useDeleteEgresadoMutation } from "@/modules/egresados/hooks/use-egresado-mutations";
import {
  useEgresadoMeQuery,
  useEgresadosListQuery,
} from "@/modules/egresados/hooks/use-egresados-queries";
import type { EgresadosListFilters } from "@/modules/egresados/query-keys";

const ESTADO_FILTER_LABELS: Record<EstadoLaboralEgresado, string> = {
  [EstadoLaboralEgresado.EMPLEADO]: "Empleado",
  [EstadoLaboralEgresado.EMPRENDEDOR]: "Emprendedor",
  [EstadoLaboralEgresado.DESEMPLEADO]: "Desempleado",
  [EstadoLaboralEgresado.ESTUDIANDO]: "Estudiando",
};

const ESTADO_TABLA_LABELS: Record<EstadoLaboralEgresado, string> = {
  [EstadoLaboralEgresado.EMPLEADO]: "Empleado",
  [EstadoLaboralEgresado.EMPRENDEDOR]: "Emprendedor",
  [EstadoLaboralEgresado.DESEMPLEADO]: "Desempleado",
  [EstadoLaboralEgresado.ESTUDIANDO]: "Estudiando",
};

const FILTER_ALL = "__all__";

type FilterDraft = {
  nombre: string;
  anioEgreso: string;
  programaCarrera: string;
  estadoLaboral: EstadoLaboralEgresado | "";
};

function emptyDraft(): FilterDraft {
  return {
    nombre: "",
    anioEgreso: "",
    programaCarrera: "",
    estadoLaboral: "",
  };
}

function vinculosLabel(e: EgresadoResponseDto): string {
  const v = e.vinculos;
  if (!v) return "—";
  const parts: string[] = [];
  if (v.talentoPerfilId != null) {
    parts.push("Talento");
  }
  if (v.directorioEmprendimientoId != null) {
    parts.push("Directorio");
  }
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function EgresadosView() {
  const profile = useProfile();
  const { layout } = useDashboardListLayout();
  const meQuery = useEgresadoMeQuery();
  const [appliedFilters, setAppliedFilters] = useState<EgresadosListFilters>(
    {},
  );
  const [draft, setDraft] = useState<FilterDraft>(() => emptyDraft());

  const listQuery = useEgresadosListQuery(appliedFilters);
  const deleteMut = useDeleteEgresadoMutation();

  const isAdmin = profile.data?.nivel === NivelUsuario.ADMINISTRADOR;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [sheetEgresado, setSheetEgresado] =
    useState<EgresadoResponseDto | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (deleteTargetId != null) {
      setDeleteError(null);
    }
  }, [deleteTargetId]);

  function applyFilters() {
    const anioParsed = draft.anioEgreso.trim()
      ? Number(draft.anioEgreso)
      : undefined;
    setAppliedFilters({
      nombre: draft.nombre.trim() || undefined,
      anioEgreso:
        anioParsed !== undefined && !Number.isNaN(anioParsed)
          ? anioParsed
          : undefined,
      programaCarrera: draft.programaCarrera.trim() || undefined,
      estadoLaboral: draft.estadoLaboral || undefined,
    });
  }

  function clearFilters() {
    setDraft(emptyDraft());
    setAppliedFilters({});
  }

  function openCreate() {
    setSheetMode("create");
    setSheetEgresado(null);
    setSheetOpen(true);
  }

  function openEdit(row: EgresadoResponseDto) {
    setSheetMode("edit");
    setSheetEgresado(row);
    setSheetOpen(true);
  }

  function canEditRow(row: EgresadoResponseDto): boolean {
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

  const showMeActions =
    meQuery.isSuccess && !meQuery.isFetching && profile.data;
  const canRegisterSelf = showMeActions && meQuery.data === null;
  const myRecord = showMeActions ? meQuery.data : null;

  if (!egresadosCanAccessModule(profile.data)) {
    return (
      <PageCallout>
        El directorio de egresados está disponible solo para personal
        institucional o cuentas de egresado. Si necesitás acceso, contactá a
        administración.
      </PageCallout>
    );
  }

  return (
    <div className="layout-page-section flex flex-col gap-4">
      {meQuery.isError ? (
        <PageCallout variant="destructive">
          {getApiErrorMessage(meQuery.error)}
        </PageCallout>
      ) : null}

      <ListPageToolbar
        end={
          <>
            {canRegisterSelf ? (
              <Button type="button" size="sm" onClick={() => openCreate()}>
                Registrar mi perfil
              </Button>
            ) : null}
            {myRecord ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => openEdit(myRecord)}
              >
                Editar mi perfil
              </Button>
            ) : null}
          </>
        }
      />

      <FilterPanel>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="flt-nombre">Nombre</Label>
            <Input
              id="flt-nombre"
              value={draft.nombre}
              onChange={(e) =>
                setDraft((d) => ({ ...d, nombre: e.target.value }))
              }
              placeholder="Buscar…"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="flt-anio">Año de egreso</Label>
            <Input
              id="flt-anio"
              type="number"
              value={draft.anioEgreso}
              onChange={(e) =>
                setDraft((d) => ({ ...d, anioEgreso: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="flt-carrera">Programa / carrera</Label>
            <Input
              id="flt-carrera"
              value={draft.programaCarrera}
              onChange={(e) =>
                setDraft((d) => ({ ...d, programaCarrera: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Estado laboral</Label>
            <Select
              value={
                draft.estadoLaboral === "" ? FILTER_ALL : draft.estadoLaboral
              }
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  estadoLaboral:
                    v === FILTER_ALL ? "" : (v as EstadoLaboralEgresado),
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FILTER_ALL}>Todos</SelectItem>
                {(
                  Object.values(
                    EstadoLaboralEgresado,
                  ) as EstadoLaboralEgresado[]
                ).map((v) => (
                  <SelectItem key={v} value={v}>
                    {ESTADO_FILTER_LABELS[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => applyFilters()}>
            Aplicar filtros
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => clearFilters()}
          >
            Limpiar
          </Button>
        </div>
      </FilterPanel>

      {listQuery.isPending ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : listQuery.isError ? (
        <PageCallout variant="destructive">
          {getApiErrorMessage(listQuery.error)}
        </PageCallout>
      ) : layout === "cards" ? (
        (listQuery.data ?? []).length === 0 ? (
          <ListCardGridEmpty>
            No hay egresados que coincidan con los filtros.
          </ListCardGridEmpty>
        ) : (
          <div className="layout-list-grid">
            {(listQuery.data ?? []).map((row) => {
              const editable = canEditRow(row);
              const deletable = isAdmin === true;
              const showMenu = editable || deletable;
              return (
                <ListCard key={row.id}>
                  <ListCardHeader>
                    <CardTitle className="truncate text-base leading-snug">
                      {row.nombreCompleto}
                    </CardTitle>
                    {showMenu ? (
                      <CardAction>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Acciones para ${row.nombreCompleto}`}
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="tabular-nums">
                        {row.anioEgreso}
                      </Badge>
                      <Badge variant="secondary">
                        {ESTADO_TABLA_LABELS[row.estadoLaboral]}
                      </Badge>
                    </div>
                    <CardDescription className="truncate">
                      {row.programaCarrera}
                    </CardDescription>
                    <CardDescription className="truncate">
                      {row.correo}
                    </CardDescription>
                    <CardDescription>{vinculosLabel(row)}</CardDescription>
                  </ListCardContent>
                </ListCard>
              );
            })}
          </div>
        )
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Carrera</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Vínculos</TableHead>
              <TableHead className="w-[72px] text-end">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(listQuery.data ?? []).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No hay egresados que coincidan con los filtros.
                </TableCell>
              </TableRow>
            ) : (
              (listQuery.data ?? []).map((row) => {
                const editable = canEditRow(row);
                const deletable = isAdmin === true;
                const showMenu = editable || deletable;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.nombreCompleto}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.anioEgreso}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate">
                      {row.programaCarrera}
                    </TableCell>
                    <TableCell>
                      {ESTADO_TABLA_LABELS[row.estadoLaboral]}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-muted-foreground">
                      {row.correo}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {vinculosLabel(row)}
                    </TableCell>
                    <TableCell className="text-end">
                      {showMenu ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Acciones para ${row.nombreCompleto}`}
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

      <EgresadoFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        egresado={sheetEgresado}
      />

      <AlertDialog
        open={deleteTargetId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar egresado</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Eliminar este registro de
              egresado?
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
