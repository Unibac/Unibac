import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAccion,
  createEgresadoHabilitado,
  createEstudianteHabilitado,
  createModulo,
  createRolPermiso,
  deleteAccion,
  deleteEgresadoHabilitado,
  deleteEstudianteHabilitado,
  deleteModulo,
  deleteRolPermiso,
  updateAccion,
  updateEgresadoHabilitado,
  updateEstudianteHabilitado,
  updateModulo,
  updateRol,
} from "@/modules/administracion/api/administracion-api";
import { administracionKeys } from "@/modules/administracion/query-keys";
import type {
  CreateAccionDto,
  CreateEgresadoHabilitadoDto,
  CreateEstudianteHabilitadoDto,
  CreateModuloDto,
  CreateRolPermisoDto,
  UpdateAccionDto,
  UpdateEgresadoHabilitadoDto,
  UpdateEstudianteHabilitadoDto,
  UpdateModuloDto,
  UpdateRolDto,
} from "@/modules/shared/types/api-models";

export function useCreateEstudianteHabilitadoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEstudianteHabilitadoDto) =>
      createEstudianteHabilitado(body),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: administracionKeys.estudiantesHabilitados(),
      });
    },
  });
}

export function useUpdateEstudianteHabilitadoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: UpdateEstudianteHabilitadoDto;
    }) => updateEstudianteHabilitado(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: administracionKeys.estudiantesHabilitados(),
      });
    },
  });
}

export function useDeleteEstudianteHabilitadoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteEstudianteHabilitado(id),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: administracionKeys.estudiantesHabilitados(),
      });
    },
  });
}

export function useCreateEgresadoHabilitadoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEgresadoHabilitadoDto) =>
      createEgresadoHabilitado(body),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: administracionKeys.egresadosHabilitados(),
      });
    },
  });
}

export function useUpdateEgresadoHabilitadoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: UpdateEgresadoHabilitadoDto;
    }) => updateEgresadoHabilitado(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: administracionKeys.egresadosHabilitados(),
      });
    },
  });
}

export function useDeleteEgresadoHabilitadoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteEgresadoHabilitado(id),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: administracionKeys.egresadosHabilitados(),
      });
    },
  });
}

export function useToggleRolPermisoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      grant: boolean;
      permisoId?: number;
      create?: CreateRolPermisoDto;
    }) => {
      if (input.grant && input.create) {
        return createRolPermiso(input.create);
      }
      if (!input.grant && input.permisoId != null) {
        await deleteRolPermiso(input.permisoId);
        return null;
      }
      throw new Error("Parámetros inválidos para permiso");
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: administracionKeys.permisos() });
    },
  });
}

export function useUpdateRolMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateRolDto }) =>
      updateRol(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: administracionKeys.roles() });
    },
  });
}

export function useCreateModuloMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateModuloDto) => createModulo(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: administracionKeys.modulos() });
      void qc.invalidateQueries({ queryKey: administracionKeys.permisos() });
    },
  });
}

export function useUpdateModuloMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateModuloDto }) =>
      updateModulo(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: administracionKeys.modulos() });
      void qc.invalidateQueries({ queryKey: administracionKeys.permisos() });
    },
  });
}

export function useDeleteModuloMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteModulo(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: administracionKeys.modulos() });
      void qc.invalidateQueries({ queryKey: administracionKeys.permisos() });
    },
  });
}

export function useCreateAccionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAccionDto) => createAccion(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: administracionKeys.acciones() });
      void qc.invalidateQueries({ queryKey: administracionKeys.permisos() });
    },
  });
}

export function useUpdateAccionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateAccionDto }) =>
      updateAccion(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: administracionKeys.acciones() });
      void qc.invalidateQueries({ queryKey: administracionKeys.permisos() });
    },
  });
}

export function useDeleteAccionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAccion(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: administracionKeys.acciones() });
      void qc.invalidateQueries({ queryKey: administracionKeys.permisos() });
    },
  });
}
