"use client";

import { useHello } from "@/hooks/use-hello";

export function BackendSmoke() {
  const { data, isPending, isError, error } = useHello();

  if (isPending) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Conectando con la API…
      </p>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        No se pudo contactar la API:{" "}
        {error instanceof Error ? error.message : String(error)}
      </p>
    );
  }
  return (
    <p className="text-sm text-emerald-800 dark:text-emerald-300">
      Respuesta del backend: <span className="font-medium">{data}</span>
    </p>
  );
}
