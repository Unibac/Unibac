export const perfilKeys = {
  all: ["perfil"] as const,
  cuenta: () => [...perfilKeys.all, "cuenta"] as const,
  empresa: () => [...perfilKeys.all, "empresa"] as const,
  egresado: () => [...perfilKeys.all, "egresado"] as const,
};
