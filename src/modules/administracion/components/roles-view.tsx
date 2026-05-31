"use client";

import Link from "next/link";
import { useState } from "react";

import { PageCallout } from "@/components/shared/page-callout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useUpdateRolMutation } from "@/modules/administracion/hooks/use-administracion-mutations";
import { useRolesAdminQuery } from "@/modules/administracion/hooks/use-administracion-queries";

export function RolesView() {
  const query = useRolesAdminQuery();
  const updateMut = useUpdateRolMutation();
  const [actionError, setActionError] = useState<string | null>(null);

  async function toggleActivo(id: number, activo: boolean) {
    setActionError(null);
    try {
      await updateMut.mutateAsync({ id, body: { activo } });
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  }

  if (query.isError) {
    return (
      <PageCallout variant="destructive" title="No se pudo cargar roles">
        {getApiErrorMessage(query.error)}
      </PageCallout>
    );
  }

  if (query.isPending) {
    return <Skeleton className="h-64 w-full" />;
  }

  const rows = query.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      {actionError ? (
        <PageCallout variant="destructive" title="No se pudo actualizar">
          {actionError}
        </PageCallout>
      ) : null}
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Usuarios</TableHead>
              <TableHead className="text-right">Permisos</TableHead>
              <TableHead className="w-48" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-sm text-muted-foreground"
                >
                  No hay roles registrados.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">
                    {r.codigo}
                  </TableCell>
                  <TableCell className="text-sm">{r.nombre}</TableCell>
                  <TableCell>
                    {r.activo ? (
                      <Badge variant="secondary">Activo</Badge>
                    ) : (
                      <Badge variant="outline">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.usuariosCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.permisosCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={r.activo}
                          disabled={updateMut.isPending}
                          aria-label={`Activar rol ${r.nombre}`}
                          onCheckedChange={(checked) =>
                            void toggleActivo(r.id, checked)
                          }
                        />
                      </div>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link
                          href={`/dashboard/administracion/roles-permisos?rolId=${r.id}`}
                        >
                          Permisos
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        No se pueden crear roles desde la interfaz. Los códigos se definen en el
        seed del sistema. Desactivar un rol requiere que no tenga usuarios
        asignados.
      </p>
    </div>
  );
}
