export const administracionKeys = {
  all: ["administracion"] as const,
  estudiantesHabilitados: () =>
    [...administracionKeys.all, "estudiantes-habilitados"] as const,
  egresadosHabilitados: () =>
    [...administracionKeys.all, "egresados-habilitados"] as const,
  permisos: () => [...administracionKeys.all, "permisos"] as const,
  roles: () => [...administracionKeys.all, "roles"] as const,
  modulos: () => [...administracionKeys.all, "modulos"] as const,
  acciones: () => [...administracionKeys.all, "acciones"] as const,
};
