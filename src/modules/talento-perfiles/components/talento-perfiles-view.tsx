"use client";

import { MoreVerticalIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  AuthProfileResponseDtoNivel,
  CreateTalentoPerfilDtoArea,
  CreateTalentoPerfilDtoTipoPerfil,
  type TalentoPerfilResponseDto,
} from "@/api/generated/models";
import { useDashboardListLayout } from "@/components/layout/dashboard-list-layout";
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
import { talentoCanAccessModule } from "@/modules/auth/lib/profile-capabilities";
import { TalentoPerfilFormSheet } from "@/modules/talento-perfiles/components/talento-perfil-form-sheet";
import { useDeleteTalentoMutation } from "@/modules/talento-perfiles/hooks/use-talento-mutations";
import { useTalentoListQuery } from "@/modules/talento-perfiles/hooks/use-talento-queries";

const AREA_LABELS: Record<CreateTalentoPerfilDtoArea, string> = {
  [CreateTalentoPerfilDtoArea.MUSICA]: "Música",
  [CreateTalentoPerfilDtoArea.ARTES_PLASTICAS]: "Artes plásticas",
  [CreateTalentoPerfilDtoArea.DISENO]: "Diseño",
  [CreateTalentoPerfilDtoArea.AUDIOVISUAL]: "Audiovisual",
  [CreateTalentoPerfilDtoArea.ARTES_ESCENICAS]: "Artes escénicas",
};

const TIPO_PERFIL_LABELS: Record<CreateTalentoPerfilDtoTipoPerfil, string> = {
  [CreateTalentoPerfilDtoTipoPerfil.ESTUDIANTE]: "Estudiante",
  [CreateTalentoPerfilDtoTipoPerfil.EGRESADO]: "Egresado",
  [CreateTalentoPerfilDtoTipoPerfil.EMPRENDEDOR]: "Emprendedor",
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

export function TalentoPerfilesView() {
  const profile = useProfile();
  const { layout } = useDashboardListLayout();
  const listQuery = useTalentoListQuery();
  const deleteMut = useDeleteTalentoMutation();

  const isAdmin =
    profile.data?.nivel === AuthProfileResponseDtoNivel.ADMINISTRADOR;

  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [sheetRow, setSheetRow] = useState<TalentoPerfilResponseDto | null>(
    null,
  );

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (deleteTargetId != null) {
      setDeleteError(null);
    }
  }, [deleteTargetId]);

  const rows = listQuery.data ?? [];

  const myRow = useMemo(() => {
    const me = profile.data?.id;
    if (!me) return null;
    return rows.find((r) => r.usuarioId === me) ?? null;
  }, [rows, profile.data?.id]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const nombre = r.nombreCompleto.toLowerCase();
      const hab = r.habilidades.toLowerCase();
      return nombre.includes(q) || hab.includes(q);
    });
  }, [rows, search]);

  const canRegisterSelf = Boolean(profile.data && !myRow);

  function openCreate() {
    setSheetMode("create");
    setSheetRow(null);
    setSheetOpen(true);
  }

  function openEdit(row: TalentoPerfilResponseDto) {
    setSheetMode("edit");
    setSheetRow(row);
    setSheetOpen(true);
  }

  function canEditRow(row: TalentoPerfilResponseDto): boolean {
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

  if (!talentoCanAccessModule(profile.data)) {
    return (
      <p
        role="alert"
        className="rounded-none border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
      >
        El banco de talento está disponible para personal institucional o
        cuentas estudiante/egresado. Si necesitás acceso, contactá a
        administración.
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {isAdmin
            ? "Podés editar cualquier perfil. Eliminar solo disponible para administradores."
            : "Podés editar tu propio perfil."}
        </div>
        <div className="flex flex-wrap gap-2">
          {myRow ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => openEdit(myRow)}
            >
              Editar mi perfil
            </Button>
          ) : null}
          {canRegisterSelf ? (
            <Button type="button" size="sm" onClick={() => openCreate()}>
              Registrar mi perfil
            </Button>
          ) : null}
        </div>
      </div>

      <div className="max-w-md">
        <Input
          type="search"
          placeholder="Buscar por nombre o habilidades…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Filtrar perfiles"
          className="text-sm"
        />
      </div>

      {layout === "cards" ? (
        filteredRows.length === 0 ? (
          <p className="rounded-md border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground transition-colors duration-150">
            {rows.length === 0
              ? "No hay perfiles registrados."
              : "Ningún perfil coincide con la búsqueda."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRows.map((row) => {
              const editable = canEditRow(row);
              const deletable = isAdmin === true;
              const showMenu = editable || deletable;
              const contacto = [
                toCellText(row.correoContacto),
                toCellText(row.telefono),
              ]
                .filter((t) => t !== "—")
                .join(" · ");
              return (
                <Card
                  key={row.id}
                  className="gap-0 py-0 transition-colors duration-150"
                >
                  <CardHeader className="gap-3 border-b border-border pb-4">
                    <div className="flex min-w-0 flex-row items-start justify-between gap-2">
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
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 pt-4 pb-6 text-sm">
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {AREA_LABELS[row.area as CreateTalentoPerfilDtoArea]}
                      </span>
                      <span aria-hidden>·</span>
                      <span>
                        {
                          TIPO_PERFIL_LABELS[
                            row.tipoPerfil as CreateTalentoPerfilDtoTipoPerfil
                          ]
                        }
                      </span>
                      <span aria-hidden>·</span>
                      <span>{row.perfilActivo ? "Activo" : "Inactivo"}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {contacto || "—"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {toCellText(row.portafolioUrl)}
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
              <TableHead>Nombre</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Portafolio</TableHead>
              <TableHead className="w-[72px] text-end">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  {rows.length === 0
                    ? "No hay perfiles registrados."
                    : "Ningún perfil coincide con la búsqueda."}
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => {
                const editable = canEditRow(row);
                const deletable = isAdmin === true;
                const showMenu = editable || deletable;
                const contacto = [
                  toCellText(row.correoContacto),
                  toCellText(row.telefono),
                ]
                  .filter((t) => t !== "—")
                  .join(" · ");
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.nombreCompleto}
                    </TableCell>
                    <TableCell>
                      {AREA_LABELS[row.area as CreateTalentoPerfilDtoArea]}
                    </TableCell>
                    <TableCell>
                      {
                        TIPO_PERFIL_LABELS[
                          row.tipoPerfil as CreateTalentoPerfilDtoTipoPerfil
                        ]
                      }
                    </TableCell>
                    <TableCell>{row.perfilActivo ? "Sí" : "No"}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-muted-foreground">
                      {contacto || "—"}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-muted-foreground">
                      {toCellText(row.portafolioUrl)}
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

      <TalentoPerfilFormSheet
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
            <AlertDialogTitle>Eliminar perfil de talento</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Eliminar este perfil del banco
              de talentos?
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
