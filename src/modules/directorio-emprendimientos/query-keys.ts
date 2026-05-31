export const directorioKeys = {
  all: ["directorio-emprendimientos"] as const,
  lists: () => [...directorioKeys.all, "list"] as const,
  list: () => [...directorioKeys.lists()] as const,
  details: () => [...directorioKeys.all, "detail"] as const,
  detail: (id: number) => [...directorioKeys.details(), id] as const,
};
