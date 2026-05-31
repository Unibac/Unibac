"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageCallout } from "@/components/shared/page-callout";
import { Checkbox } from "@/components/ui/checkbox";
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
import { rolIdFromPermiso } from "@/modules/administracion/api/administracion-api";
import { useToggleRolPermisoMutation } from "@/modules/administracion/hooks/use-administracion-mutations";
import {
  useAccionesAdminQuery,
  useModulosAdminQuery,
  usePermisosAdminQuery,
  useRolesAdminQuery,
} from "@/modules/administracion/hooks/use-administracion-queries";

export function RolesPermisosView() {
  const searchParams = useSearchParams();
  const rolesQuery = useRolesAdminQuery();
  const permisosQuery = usePermisosAdminQuery();
  const modulosQuery = useModulosAdminQuery();
  const accionesQuery = useAccionesAdminQuery();
  const toggleMut = useToggleRolPermisoMutation();

  const [rolId, setRolId] = useState<number | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  useEffect(() => {
    const raw = searchParams.get("rolId");
    if (!raw) return;
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) {
      setRolId(parsed);
    }
  }, [searchParams]);

  const roles = useMemo(
    () => (rolesQuery.data ?? []).filter((r) => r.activo),
    [rolesQuery.data],
  );

  const modulos = modulosQuery.data ?? [];
  const acciones = accionesQuery.data ?? [];

  const permisosByRol = useMemo(() => {
    const map = new Map<string, { id: number }>();
    if (rolId == null) return map;
    for (const p of permisosQuery.data ?? []) {
      if (rolIdFromPermiso(p) !== rolId) continue;
      map.set(`${p.moduloId}:${p.accionId}`, { id: p.id });
    }
    return map;
  }, [permisosQuery.data, rolId]);

  const pending =
    rolesQuery.isPending ||
    permisosQuery.isPending ||
    modulosQuery.isPending ||
    accionesQuery.isPending;

  const anyError =
    rolesQuery.error ??
    permisosQuery.error ??
    modulosQuery.error ??
    accionesQuery.error;

  async function onToggle(
    moduloId: number,
    accionId: number,
    checked: boolean,
  ) {
    if (rolId == null) return;
    setToggleError(null);
    const key = `${moduloId}:${accionId}`;
    const existing = permisosByRol.get(key);
    try {
      await toggleMut.mutateAsync(
        checked
          ? {
              grant: true,
              create: { rolId, moduloId, accionId },
            }
          : {
              grant: false,
              permisoId: existing?.id,
            },
      );
    } catch (err) {
      setToggleError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-md flex-col gap-2">
        <Label htmlFor="rol-select">Rol</Label>
        <Select
          value={rolId != null ? String(rolId) : ""}
          onValueChange={(v) => setRolId(v ? Number(v) : null)}
        >
          <SelectTrigger id="rol-select" className="w-full">
            <SelectValue placeholder="Seleccioná un rol" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                {r.nombre} ({r.codigo})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Las acciones POSTULACION, PROPUESTA y EDICION_PROPIA se normalizan al
        validar permisos en el servidor (ver RBAC). Los administradores del
        sistema omiten esta matriz.
      </p>

      {anyError ? (
        <PageCallout variant="destructive" title="Error al cargar datos">
          {getApiErrorMessage(anyError)}
        </PageCallout>
      ) : null}
      {toggleError ? (
        <PageCallout variant="destructive" title="No se pudo actualizar">
          {toggleError}
        </PageCallout>
      ) : null}

      {pending ? (
        <Skeleton className="h-72 w-full" />
      ) : rolId == null ? (
        <p className="text-sm text-muted-foreground">
          Elegí un rol para editar sus permisos.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Módulo</TableHead>
                {acciones.map((a) => (
                  <TableHead key={a.id} className="text-center text-xs">
                    {a.nombre}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modulos.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-sm font-medium">
                    {m.nombre}
                  </TableCell>
                  {acciones.map((a) => {
                    const key = `${m.id}:${a.id}`;
                    const assigned = permisosByRol.has(key);
                    return (
                      <TableCell key={a.id} className="text-center">
                        <Checkbox
                          checked={assigned}
                          disabled={toggleMut.isPending}
                          aria-label={`${m.nombre} ${a.nombre}`}
                          onCheckedChange={(v) =>
                            void onToggle(m.id, a.id, v === true)
                          }
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
