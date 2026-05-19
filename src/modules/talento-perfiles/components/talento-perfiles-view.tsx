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
import { ListCard } from "@/components/shared/list-card";
import { ListCardContent } from "@/components/shared/list-card-content";
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
import {
  CardAction,
  CardDescription,
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
      <PageCallout>
        El banco de talento está disponible para personal institucional o
        cuentas estudiante/egresado. Si necesitás acceso, contactá a
        administración.
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

  return (
    <div className="layout-page-section flex flex-col gap-4">
      <ListPageToolbar
        end={
          <>
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
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Podés editar cualquier perfil. Eliminar solo disponible para administradores."
            : "Podés editar tu propio perfil."}
        </p>
      </ListPageToolbar>

      <ListPageToolbar sticky>
        <Input
          type="search"
          placeholder="Buscar por nombre o habilidades…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Filtrar perfiles"
          className="w-full text-sm sm:max-w-xs"
        />
      </ListPageToolbar>

      {layout === "cards" ? (
        filteredRows.length === 0 ? (
          <ListCardGridEmpty>
            {rows.length === 0
              ? "No hay perfiles registrados."
              : "Ningún perfil coincide con la búsqueda."}
          </ListCardGridEmpty>
        ) : (
          <div className="layout-list-grid">
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
                      <Badge variant="outline">
                        {AREA_LABELS[row.area as CreateTalentoPerfilDtoArea]}
                      </Badge>
                      <Badge variant="outline">
                        {
                          TIPO_PERFIL_LABELS[
                            row.tipoPerfil as CreateTalentoPerfilDtoTipoPerfil
                          ]
                        }
                      </Badge>
                      <Badge variant={row.perfilActivo ? "default" : "secondary"}>
                        {row.perfilActivo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <CardDescription className="truncate">
                      {contacto || "—"}
                    </CardDescription>
                    <CardDescription className="truncate">
                      {toCellText(row.portafolioUrl)}
                    </CardDescription>
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
