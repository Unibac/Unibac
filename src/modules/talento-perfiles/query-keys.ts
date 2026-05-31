export const talentoKeys = {
  all: ["talento-perfiles"] as const,
  lists: () => [...talentoKeys.all, "list"] as const,
  list: () => [...talentoKeys.lists()] as const,
  details: () => [...talentoKeys.all, "detail"] as const,
  detail: (id: number) => [...talentoKeys.details(), id] as const,
};
