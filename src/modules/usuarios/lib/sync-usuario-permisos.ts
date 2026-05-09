import type { PermisoEnUsuarioResponseDto } from "@/api/generated/models";

import {
  createPermiso,
  deletePermiso,
} from "@/modules/usuarios/api/permisos-assign-api";

export type PermisoParInput = {
  moduloId: number;
  accionId: number;
};

function parKey(p: PermisoParInput): string {
  return `${p.moduloId}:${p.accionId}`;
}

/** Aplica diff incremental entre permisos actuales y los deseados. */
export async function syncUsuarioPermisosDiff(
  usuarioId: number,
  desired: PermisoParInput[],
  current: PermisoEnUsuarioResponseDto[],
): Promise<void> {
  const desiredKeys = new Set(desired.map((p) => parKey(p)));
  const currentByKey = new Map(
    current.map((p) => [
      parKey({ moduloId: p.moduloId, accionId: p.accionId }),
      p.id,
    ]),
  );

  for (const [key, permisoId] of currentByKey) {
    if (!desiredKeys.has(key)) {
      await deletePermiso(permisoId);
    }
  }

  const currentKeys = new Set(currentByKey.keys());

  for (const row of desired) {
    const key = parKey(row);
    if (!currentKeys.has(key)) {
      await createPermiso({
        usuarioId,
        moduloId: row.moduloId,
        accionId: row.accionId,
      });
    }
  }
}
