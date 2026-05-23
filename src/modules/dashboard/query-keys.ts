export const dashboardKeys = {
  all: ["dashboard"] as const,
  resumen: () => [...dashboardKeys.all, "resumen"] as const,
};
