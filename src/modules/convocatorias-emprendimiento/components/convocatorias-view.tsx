"use client";

import { MoreVerticalIcon } from "lucide-react";
import { useMemo, useState } from "react";

import {
  AuthProfileResponseDtoNivel,
  AuthProfileResponseDtoTipo,
  CreatePublicacionConvocatoriaDtoTipoConvocatoria,
  type PublicacionEmprendimientoResponseDto,
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
import { ConvocatoriaFormSheet } from "@/modules/convocatorias-emprendimiento/components/convocatoria-form-sheet";
import { PostulacionesSheet } from "@/modules/convocatorias-emprendimiento/components/postulaciones-sheet";
import {
  useDeleteConvocatoriaMutation,
  usePostularMutation,
} from "@/modules/convocatorias-emprendimiento/hooks/use-convocatorias-mutations";
import {
  useConvocatoriasListQuery,
  useMisPostulacionesQuery,
} from "@/modules/convocatorias-emprendimiento/hooks/use-convocatorias-queries";
import type { ConvocatoriasListFilters } from "@/modules/convocatorias-emprendimiento/query-keys";

const TIPO_LABELS: Record<
  CreatePublicacionConvocatoriaDtoTipoConvocatoria,
  string
> = {
  [CreatePublicacionConvocatoriaDtoTipoConvocatoria.FINANCIAMIENTO]:
    "Financiamiento",
  [CreatePublicacionConvocatoriaDtoTipoConvocatoria.FORMACION]: "Formación",
  [CreatePublicacionConvocatoriaDtoTipoConvocatoria.PRACTICAS]: "Prácticas",
};

const FILTER_ALL = "__all__";

function formatFecha(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function isPast(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

export function ConvocatoriasView() {
  const profile = useProfile();
  const isAdmin =
    profile.data?.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR;
  const canPostular =
    profile.data?.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR ||
    profile.data?.tipo === AuthProfileResponseDtoTipo.INTERNO;

  const [filters, setFilters] = useState<ConvocatoriasListFilters>({});
  const convocatoriasQuery = useConvocatoriasListQuery(filters);
  const misPostulacionesQuery = useMisPostulacionesQuery(Boolean(canPostular));

  const postularMut = usePostularMutation();
  const deleteMut = useDeleteConvocatoriaMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formRow, setFormRow] =
    useState<PublicacionEmprendimientoResponseDto | null>(null);

  const [postulacionesOpen, setPostulacionesOpen] = useState(false);
  const [postulacionesPublicacionId, setPostulacionesPublicacionId] = useState<
    number | null
  >(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] =
    useState<PublicacionEmprendimientoResponseDto | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const rows = convocatoriasQuery.data ?? [];

  const myPostulaciones = useMemo(
    () => misPostulacionesQuery.data ?? [],
    [misPostulacionesQuery.data],
  );

  const myPostulacionByPublicacionId = useMemo(() => {
    const map = new Map<number, number>();
    myPostulaciones.forEach((p) => {
      map.set(p.publicacionId, p.id);
    });
    return map;
  }, [myPostulaciones]);

  function openCreate() {
    setFormMode("create");
    setFormRow(null);
    setFormOpen(true);
  }

  function openEdit(row: PublicacionEmprendimientoResponseDto) {
    setFormMode("edit");
    setFormRow(row);
    setFormOpen(true);
  }

  function openDetail(row: PublicacionEmprendimientoResponseDto) {
    setDetailRow(row);
    setDetailOpen(true);
  }

  function openPostulaciones(publicacionId: number) {
    setPostulacionesPublicacionId(publicacionId);
    setPostulacionesOpen(true);
  }

  async function doPostular(publicacionId: number) {
    try {
      await postularMut.mutateAsync(publicacionId);
    } catch {
      // error shown by toast? (no hay toast). se verá al revalidar o via getApiErrorMessage en UI si quisieras.
    }
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

  return (
    <div className="flex flex-col gap-4">
      {isAdmin ? (
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={() => openCreate()}>
            Nueva convocatoria
          </Button>
        </div>
      ) : null}

      <div className="rounded-md border border-border p-4">
        <p className="text-sm font-medium text-foreground">Filtros</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select
              value={filters.tipoConvocatoria ?? FILTER_ALL}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  tipoConvocatoria:
                    v === FILTER_ALL
                      ? undefined
                      : (v as CreatePublicacionConvocatoriaDtoTipoConvocatoria),
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
                    CreatePublicacionConvocatoriaDtoTipoConvocatoria,
                  ) as CreatePublicacionConvocatoriaDtoTipoConvocatoria[]
                ).map((v) => (
                  <SelectItem key={v} value={v}>
                    {TIPO_LABELS[v]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdmin ? (
            <div className="grid gap-2">
              <Label>Activo</Label>
              <Select
                value={
                  filters.activo === undefined
                    ? FILTER_ALL
                    : filters.activo
                      ? "true"
                      : "false"
                }
                onValueChange={(v) =>
                  setFilters((f) => ({
                    ...f,
                    activo: v === FILTER_ALL ? undefined : v === "true",
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FILTER_ALL}>Todos</SelectItem>
                  <SelectItem value="true">Activas</SelectItem>
                  <SelectItem value="false">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </div>

      {convocatoriasQuery.isPending ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : convocatoriasQuery.isError ? (
        <p
          role="alert"
          className="rounded-none border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {getApiErrorMessage(convocatoriasQuery.error)}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha límite</TableHead>
              <TableHead>Activa</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No hay convocatorias.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const alreadyPostulado = myPostulacionByPublicacionId.has(
                  row.id,
                );
                const canPostularRow =
                  canPostular &&
                  row.activo &&
                  !isPast(row.fechaLimite) &&
                  !alreadyPostulado;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.titulo}</TableCell>
                    <TableCell>
                      {
                        TIPO_LABELS[
                          row.tipoConvocatoria as CreatePublicacionConvocatoriaDtoTipoConvocatoria
                        ]
                      }
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatFecha(row.fechaLimite)}
                    </TableCell>
                    <TableCell>{row.activo ? "Sí" : "No"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Acciones para ${row.titulo}`}
                          >
                            <MoreVerticalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(row)}>
                            Ver detalle
                          </DropdownMenuItem>
                          {canPostularRow ? (
                            <DropdownMenuItem
                              onClick={() => void doPostular(row.id)}
                            >
                              Postular
                            </DropdownMenuItem>
                          ) : null}
                          {isAdmin ? (
                            <>
                              <DropdownMenuItem onClick={() => openEdit(row)}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openPostulaciones(row.id)}
                              >
                                Ver postulaciones
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTargetId(row.id)}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}

      {canPostular ? (
        <div className="rounded-none border border-border p-4">
          <div className="text-sm font-medium">Mis postulaciones</div>
          {misPostulacionesQuery.isPending ? (
            <div className="mt-3 flex flex-col gap-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : misPostulacionesQuery.isError ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {getApiErrorMessage(misPostulacionesQuery.error)}
            </p>
          ) : myPostulaciones.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No tenés postulaciones registradas.
            </p>
          ) : (
            <div className="mt-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Convocatoria</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPostulaciones.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.publicacion?.titulo ?? `#${p.publicacionId}`}
                      </TableCell>
                      <TableCell>{p.estadoPostulacion}</TableCell>
                      <TableCell className="tabular-nums">
                        {formatFecha(p.fechaPostulacion)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ) : null}

      <ConvocatoriaFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        row={formRow}
      />

      <PostulacionesSheet
        open={postulacionesOpen}
        onOpenChange={setPostulacionesOpen}
        publicacionId={postulacionesPublicacionId}
      />

      <AlertDialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setDetailRow(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {detailRow?.titulo ?? "Detalle"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {detailRow ? (
                <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                  <div>
                    <span className="text-foreground">Tipo:</span>{" "}
                    {
                      TIPO_LABELS[
                        detailRow.tipoConvocatoria as CreatePublicacionConvocatoriaDtoTipoConvocatoria
                      ]
                    }
                  </div>
                  <div>
                    <span className="text-foreground">Fecha límite:</span>{" "}
                    {formatFecha(detailRow.fechaLimite)}
                  </div>
                  <div className="whitespace-pre-wrap">
                    {detailRow.descripcion}
                  </div>
                  <div className="whitespace-pre-wrap">
                    <span className="text-foreground">Convocados:</span>{" "}
                    {detailRow.convocados}
                  </div>
                  {detailRow.montoTipoApoyo ? (
                    <div>
                      <span className="text-foreground">Apoyo:</span>{" "}
                      {String(detailRow.montoTipoApoyo)}
                    </div>
                  ) : null}
                  {detailRow.linkExterno ? (
                    <div>
                      <span className="text-foreground">Link:</span>{" "}
                      {String(detailRow.linkExterno)}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteTargetId != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar convocatoria</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Eliminar esta convocatoria?
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
