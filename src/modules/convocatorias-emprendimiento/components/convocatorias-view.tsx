"use client";

import { MoreVerticalIcon } from "lucide-react";
import { useMemo, useState } from "react";

import {
  NivelUsuario,
  TipoConvocatoriaEmprendimiento,
  type PublicacionEmprendimientoResponseDto,
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
import {
  convocatoriasCanAccessModule,
  convocatoriasCanPostular,
} from "@/modules/auth/lib/profile-capabilities";
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

const TIPO_LABELS: Record<TipoConvocatoriaEmprendimiento, string> = {
  [TipoConvocatoriaEmprendimiento.FINANCIAMIENTO]: "Financiamiento",
  [TipoConvocatoriaEmprendimiento.FORMACION]: "Formación",
  [TipoConvocatoriaEmprendimiento.PRACTICAS]: "Prácticas",
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
  const { layout } = useDashboardListLayout();
  const isAdmin = profile.data?.nivel === NivelUsuario.ADMINISTRADOR;
  const canPostular = convocatoriasCanPostular(profile.data);

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

  if (!convocatoriasCanAccessModule(profile.data)) {
    return (
      <PageCallout>
        No tienes acceso a convocatorias con tu tipo de cuenta. Si necesitas
        permisos, contacta a administración.
      </PageCallout>
    );
  }

  return (
    <div className="layout-page-section flex flex-col gap-4">
      <ListPageToolbar
        end={
          isAdmin ? (
            <Button type="button" size="sm" onClick={() => openCreate()}>
              Nueva convocatoria
            </Button>
          ) : undefined
        }
      />

      <FilterPanel>
        <div className="grid gap-4 md:grid-cols-2">
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
                      : (v as TipoConvocatoriaEmprendimiento),
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
                    TipoConvocatoriaEmprendimiento,
                  ) as TipoConvocatoriaEmprendimiento[]
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
      </FilterPanel>

      {convocatoriasQuery.isPending ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : convocatoriasQuery.isError ? (
        <PageCallout variant="destructive">
          {getApiErrorMessage(convocatoriasQuery.error)}
        </PageCallout>
      ) : layout === "cards" ? (
        rows.length === 0 ? (
          <ListCardGridEmpty>No hay convocatorias.</ListCardGridEmpty>
        ) : (
          <div className="layout-list-grid">
            {rows.map((row) => {
              const alreadyPostulado = myPostulacionByPublicacionId.has(row.id);
              const canPostularRow =
                canPostular &&
                row.activo &&
                !isPast(row.fechaLimite) &&
                !alreadyPostulado;
              return (
                <ListCard key={row.id}>
                  <ListCardHeader>
                    <CardTitle className="line-clamp-2 text-base leading-snug">
                      {row.titulo}
                    </CardTitle>
                    <CardAction>
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
                    </CardAction>
                  </ListCardHeader>
                  <ListCardContent>
                    <CardDescription>
                      {
                        TIPO_LABELS[
                          row.tipoConvocatoria as TipoConvocatoriaEmprendimiento
                        ]
                      }
                    </CardDescription>
                    <CardDescription className="tabular-nums">
                      Límite: {formatFecha(row.fechaLimite)}
                    </CardDescription>
                    <Badge variant={row.activo ? "default" : "secondary"}>
                      {row.activo ? "Activa" : "Inactiva"}
                    </Badge>
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
                          row.tipoConvocatoria as TipoConvocatoriaEmprendimiento
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
        <section className="layout-page-section rounded-md border border-border p-4">
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
              No tienes postulaciones registradas.
            </p>
          ) : layout === "cards" ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {myPostulaciones.map((p) => (
                <ListCard key={p.id}>
                  <ListCardHeader className="gap-2">
                    <CardTitle className="line-clamp-2 text-base leading-snug">
                      {p.publicacion?.titulo ?? `#${p.publicacionId}`}
                    </CardTitle>
                  </ListCardHeader>
                  <ListCardContent>
                    <Badge variant="secondary">{p.estadoPostulacion}</Badge>
                    <CardDescription className="tabular-nums">
                      {formatFecha(p.fechaPostulacion)}
                    </CardDescription>
                  </ListCardContent>
                </ListCard>
              ))}
            </div>
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
        </section>
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
            {detailRow ? (
              <AlertDialogDescription asChild>
                <div className="flex flex-col gap-2 text-muted-foreground text-xs">
                  <p>
                    <span className="text-foreground">Tipo:</span>{" "}
                    {
                      TIPO_LABELS[
                        detailRow.tipoConvocatoria as TipoConvocatoriaEmprendimiento
                      ]
                    }
                  </p>
                  <p>
                    <span className="text-foreground">Fecha límite:</span>{" "}
                    {formatFecha(detailRow.fechaLimite)}
                  </p>
                  <p className="whitespace-pre-wrap">{detailRow.descripcion}</p>
                  <p className="whitespace-pre-wrap">
                    <span className="text-foreground">Convocados:</span>{" "}
                    {detailRow.convocados}
                  </p>
                  {detailRow.montoTipoApoyo ? (
                    <p>
                      <span className="text-foreground">Apoyo:</span>{" "}
                      {String(detailRow.montoTipoApoyo)}
                    </p>
                  ) : null}
                  {detailRow.linkExterno ? (
                    <p>
                      <span className="text-foreground">Link:</span>{" "}
                      {String(detailRow.linkExterno)}
                    </p>
                  ) : null}
                </div>
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription>
                Sin datos de la convocatoria.
              </AlertDialogDescription>
            )}
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
