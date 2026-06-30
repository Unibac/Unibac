import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setupImportEstudiantes } from "@/modules/administracion/api/administracion-api";
import { administracionKeys } from "@/modules/administracion/query-keys";

export function useSetupImportMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, dryRun }: { file: File; dryRun: boolean }) =>
      setupImportEstudiantes(file, dryRun),
    onSuccess: (_data, variables) => {
      if (!variables.dryRun) {
        void qc.invalidateQueries({
          queryKey: administracionKeys.estudiantesHabilitados(),
        });
      }
    },
  });
}
