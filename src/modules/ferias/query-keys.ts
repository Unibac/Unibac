import type { FeriasControllerFindPropuestasPorFeriaEstado } from "@/api/generated/models";

export const feriasKeys = {
  all: ["ferias"] as const,
  lists: () => [...feriasKeys.all, "list"] as const,
  list: () => [...feriasKeys.lists()] as const,
  details: () => [...feriasKeys.all, "detail"] as const,
  detail: (id: number) => [...feriasKeys.details(), id] as const,
  propuestasRoot: () => [...feriasKeys.all, "propuestas"] as const,
  propuestas: (
    feriaId: number,
    estado?: FeriasControllerFindPropuestasPorFeriaEstado,
  ) => [...feriasKeys.propuestasRoot(), feriaId, estado ?? "todas"] as const,
  misPropuestas: () => [...feriasKeys.all, "mis-propuestas"] as const,
};
