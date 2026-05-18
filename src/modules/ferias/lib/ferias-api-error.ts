import axios from "axios";

import { getApiErrorMessage } from "@/lib/api/error-message";

export type FeriasPropuestaErrorContext = "create" | "update" | "uploadImagen";

const MESSAGES: Record<
  number,
  Partial<Record<FeriasPropuestaErrorContext, string>>
> = {
  403: {
    create:
      "No tenés permiso para registrar o editar propuestas con este perfil.",
    update:
      "No tenés permiso para registrar o editar propuestas con este perfil.",
    uploadImagen:
      "No tenés permiso para registrar o editar propuestas con este perfil.",
  },
  400: {
    create:
      "La feria no está en vigencia o los datos de la propuesta no son válidos.",
    update:
      "La feria no está en vigencia o los datos de la propuesta no son válidos.",
  },
  409: {
    create: "Ya registraste una propuesta en esta feria.",
    update: "Solo podés editar propuestas en estado Postulado.",
  },
  503: {
    uploadImagen:
      "No se pudo subir la imagen (servicio de archivos no disponible).",
  },
};

export function getFeriasPropuestaErrorMessage(
  error: unknown,
  context: FeriasPropuestaErrorContext,
): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status != null) {
      const mapped = MESSAGES[status]?.[context];
      if (mapped) return mapped;
    }
  }
  return getApiErrorMessage(error);
}
