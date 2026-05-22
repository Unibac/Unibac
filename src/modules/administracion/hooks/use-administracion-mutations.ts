import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEgresadoHabilitado,
  createEstudianteHabilitado,
  createRolPermiso,
  deleteEgresadoHabilitado,
  deleteEstudianteHabilitado,
  deleteRolPermiso,
  updateEgresadoHabilitado,
  updateEstudianteHabilitado,
} from "@/modules/administracion/api/administracion-api";
import { administracionKeys } from "@/modules/administracion/query-keys";
import type {
  CreateEgresadoHabilitadoDto,
  CreateEstudianteHabilitadoDto,
  CreateRolPermisoDto,
  UpdateEgresadoHabilitadoDto,
  UpdateEstudianteHabilitadoDto,
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
