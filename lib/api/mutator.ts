import type { AxiosRequestConfig } from "axios";
import { apiClient } from "@/lib/api-client";

export async function customInstance<T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient({ ...config, ...options });
  return response.data;
}
