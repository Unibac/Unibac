import { useQuery } from "@tanstack/react-query";
import { getApp } from "@/api/generated/app/app";

const appApi = getApp();

export function useHello() {
  return useQuery({
    queryKey: ["app", "hello"],
    queryFn: () => appApi.appControllerGetHello(),
  });
}
