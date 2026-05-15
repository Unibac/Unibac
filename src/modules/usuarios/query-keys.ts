export const usuariosKeys = {
  all: ["usuarios"] as const,
  list: () => [...usuariosKeys.all, "list"] as const,
  detail: (id: number) => [...usuariosKeys.all, "detail", id] as const,
};

export const usuariosCatalogKeys = {
  all: ["usuarios-catalog"] as const,
  roles: () => [...usuariosCatalogKeys.all, "roles"] as const,
};
