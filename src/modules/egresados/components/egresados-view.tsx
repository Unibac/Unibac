"use client";

import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import {
  AuthProfileResponseDtoNivel,
  CreateEgresadoDtoEstadoLaboral,
  EgresadosControllerFindAllEstadoLaboral,
  type EgresadoResponseDto,
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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { EgresadoFormSheet } from "@/modules/egresados/components/egresado-form-sheet";
import { useDeleteEgresadoMutation } from "@/modules/egresados/hooks/use-egresado-mutations";
import {
  useEgresadoMeQuery,
  useEgresadosListQuery,
} from "@/modules/egresados/hooks/use-egresados-queries";
import type { EgresadosListFilters } from "@/modules/egresados/query-keys";

const ESTADO_FILTER_LABELS: Record<
  EgresadosControllerFindAllEstadoLaboral,
  string
> = {
  [EgresadosControllerFindAllEstadoLaboral.EMPLEADO]: "Empleado",
  [EgresadosControllerFindAllEstadoLaboral.EMPRENDEDOR]: "Emprendedor",
  [EgresadosControllerFindAllEstadoLaboral.DESEMPLEADO]: "Desempleado",
  [EgresadosControllerFindAllEstadoLaboral.ESTUDIANDO]: "Estudiando",
};

const ESTADO_TABLA_LABELS: Record<CreateEgresadoDtoEstadoLaboral, string> = {
  [CreateEgresadoDtoEstadoLaboral.EMPLEADO]: "Empleado",
  [CreateEgresadoDtoEstadoLaboral.EMPRENDEDOR]: "Emprendedor",
  [CreateEgresadoDtoEstadoLaboral.DESEMPLEADO]: "Desempleado",
  [CreateEgresadoDtoEstadoLaboral.ESTUDIANDO]: "Estudiando",
};

const FILTER_ALL = "__all__";

type FilterDraft = {
  nombre: string;
  anioEgreso: string;
  programaCarrera: string;
  estadoLaboral: EgresadosControllerFindAllEstadoLaboral | "";
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
  const meQuery = useEgresadoMeQuery();
  const [appliedFilters, setAppliedFilters] = useState<EgresadosListFilters>(
    {},
  );
  const [draft, setDraft] = useState<FilterDraft>(() => emptyDraft());

  const listQuery = useEgresadosListQuery(appliedFilters);
  const deleteMut = useDeleteEgresadoMutation();

  const isAdmin = profile.data?.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR;

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

  const showMeActions =
    meQuery.isSuccess && !meQuery.isFetching && profile.data;
  const canRegisterSelf = showMeActions && meQuery.data === null;
  const myRecord = showMeActions ? meQuery.data : null;

  return (
    <div className="flex flex-col gap-4">
      {meQuery.isError ? (
        <p
          role="alert"
          className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {getApiErrorMessage(meQuery.error)}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
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
      </div>

      <FieldSet className="rounded-none border border-border p-4">
        <FieldLegend variant="label">Filtros</FieldLegend>
        <FieldGroup className="gap-4 @md/field-group:grid @md/field-group:grid-cols-2 @lg/field-group:grid-cols-4">
          <Field>
            <FieldLabel htmlFor="flt-nombre">Nombre</FieldLabel>
            <Input
              id="flt-nombre"
              value={draft.nombre}
              onChange={(e) =>
                setDraft((d) => ({ ...d, nombre: e.target.value }))
              }
              placeholder="Buscar…"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="flt-anio">Año de egreso</FieldLabel>
            <Input
              id="flt-anio"
              type="number"
              value={draft.anioEgreso}
              onChange={(e) =>
                setDraft((d) => ({ ...d, anioEgreso: e.target.value }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="flt-carrera">Programa / carrera</FieldLabel>
            <Input
              id="flt-carrera"
              value={draft.programaCarrera}
              onChange={(e) =>
                setDraft((d) => ({ ...d, programaCarrera: e.target.value }))
              }
            />
          </Field>
          <Field>
            <FieldLabel>Estado laboral</FieldLabel>
            <Select
              value={
                draft.estadoLaboral === "" ? FILTER_ALL : draft.estadoLaboral
              }
              onValueChange={(v) =>
                setDraft((d) => ({
                  ...d,
                  estadoLaboral:
                    v === FILTER_ALL
                      ? ""
                      : (v as EgresadosControllerFindAllEstadoLaboral),
                }))
              }
            >
              <SelectTrigger size="default" className="w-full">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FILTER_ALL}>Todos</SelectItem>
                {(
                  Object.values(
                    EgresadosControllerFindAllEstadoLaboral,
                  ) as EgresadosControllerFindAllEstadoLaboral[]
                ).map((v) => (
                  <SelectItem key={v} value={v}>
                    {ESTADO_FILTER_LABELS[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
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
      </FieldSet>

      {listQuery.isPending ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : listQuery.isError ? (
        <p
          role="alert"
          className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {getApiErrorMessage(listQuery.error)}
        </p>
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
                    <TableCell className="tabular-nums">{row.anioEgreso}</TableCell>
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
                              size="icon-sm"
                              aria-label={`Acciones para ${row.nombreCompleto}`}
                            >
                              <DotsThreeVerticalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {editable ? (
                              <DropdownMenuItem
                                onClick={() => openEdit(row)}
                              >
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
