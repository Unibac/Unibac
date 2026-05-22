import { useQuery } from "@tanstack/react-query";

import {
  listAcciones,
  listEgresadosHabilitados,
  listEstudiantesHabilitados,
  listModulos,
  listPermisos,
  listRoles,
} from "@/modules/administracion/api/administracion-api";
import { administracionKeys } from "@/modules/administracion/query-keys";

export function useEstudiantesHabilitadosQuery(enabled = true) {
  return useQuery({
    queryKey: administracionKeys.estudiantesHabilitados(),
    queryFn: listEstudiantesHabilitados,
    enabled,
  });
}

export function useEgresadosHabilitadosQuery(enabled = true) {
  return useQuery({
    queryKey: administracionKeys.egresadosHabilitados(),
    queryFn: listEgresadosHabilitados,
    enabled,
  });
}

export function useRolesAdminQuery(enabled = true) {
  return useQuery({
    queryKey: administracionKeys.roles(),
    queryFn: listRoles,
    enabled,
  });
}

export function usePermisosAdminQuery(enabled = true) {
  return useQuery({
    queryKey: administracionKeys.permisos(),
    queryFn: listPermisos,
    enabled,
  });
}

export function useModulosAdminQuery(enabled = true) {
  return useQuery({
    queryKey: administracionKeys.modulos(),
    queryFn: () => listModulos(true),
    enabled,
  });
}

export function useAccionesAdminQuery(enabled = true) {
  return useQuery({
    queryKey: administracionKeys.acciones(),
    queryFn: listAcciones,
    enabled,
  });
}
