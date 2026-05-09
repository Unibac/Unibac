import type { AxiosRequestConfig } from "axios";
import { apiClient } from "@/lib/api-client";

function stripContentTypeForFormData(config: AxiosRequestConfig): void {
  if (!(config.data instanceof FormData)) return;
  const { headers } = config;
  if (!headers) return;
  if (typeof headers.delete === "function") {
    headers.delete("Content-Type");
    return;
  }
  const h = headers as Record<string, unknown>;
  delete h["Content-Type"];
  delete h["content-type"];
}

export async function customInstance<T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> {
  const merged: AxiosRequestConfig = { ...config, ...options };
  stripContentTypeForFormData(merged);
  const response = await apiClient(merged);
  return response.data;
}
