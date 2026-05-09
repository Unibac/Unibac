import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  CreateUsuarioDto,
  PermisoEnUsuarioResponseDto,
  UpdateUsuarioDto,
} from "@/api/generated/models";

import { createPermiso } from "@/modules/usuarios/api/permisos-assign-api";
import {
  createUsuario,
  deleteUsuario,
  updateUsuario,
} from "@/modules/usuarios/api/usuarios-api";
import { syncUsuarioPermisosDiff } from "@/modules/usuarios/lib/sync-usuario-permisos";
import { usuariosKeys } from "@/modules/usuarios/query-keys";
import type {
  CreateUsuarioFormValues,
  UpdateUsuarioFormValues,
} from "@/modules/usuarios/schemas/usuario-schema";

function buildCreateDto(values: CreateUsuarioFormValues): CreateUsuarioDto {
  return {
    usuario: values.usuario,
    clave: values.clave,
    descripcion: values.descripcion,
    activo: values.activo,
    nivel: values.nivel,
    tipo: values.tipo,
    correo: values.correo,
    celular: values.celular,
  };
}

function buildUpdateDto(values: UpdateUsuarioFormValues): UpdateUsuarioDto {
  const dto: UpdateUsuarioDto = {};
  if (values.usuario !== undefined) {
    dto.usuario = values.usuario;
  }
  const pw = values.clave?.trim();
  if (pw && pw.length >= 6) {
    dto.clave = pw;
  }
  if (values.descripcion !== undefined) {
    dto.descripcion = values.descripcion;
  }
  if (values.activo !== undefined) {
    dto.activo = values.activo;
  }
  if (values.nivel !== undefined) {
    dto.nivel = values.nivel;
  }
  if (values.tipo !== undefined) {
    dto.tipo = values.tipo;
  }
  if (values.correo !== undefined) {
    dto.correo = values.correo;
  }
  if (values.celular !== undefined) {
    dto.celular = values.celular;
  }
  return dto;
}

export function useCreateUsuarioWithPermisosMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateUsuarioFormValues) => {
      const created = await createUsuario(buildCreateDto(values));
      const settled = await Promise.allSettled(
        values.permisos.map((p) =>
          createPermiso({
            usuarioId: created.id,
            moduloId: p.moduloId,
            accionId: p.accionId,
          }),
        ),
      );
      const failures = settled.filter((r) => r.status === "rejected").length;
      return { created, failures };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.list() });
    },
  });
}

export function useUpdateUsuarioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
      previousPermisos,
    }: {
      id: number;
      values: UpdateUsuarioFormValues;
      previousPermisos: PermisoEnUsuarioResponseDto[];
    }) => {
      const dto = buildUpdateDto(values);
      if (Object.keys(dto).length > 0) {
        await updateUsuario(id, dto);
      }
      await syncUsuarioPermisosDiff(id, values.permisos, previousPermisos);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: usuariosKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteUsuarioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteUsuario(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usuariosKeys.list() });
    },
  });
}
