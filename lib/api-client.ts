import axios from "axios";

function normalizeBaseUrl(url: string | undefined) {
  if (!url) {
    return "";
  }
  return url.replace(/\/+$/, "");
}

export const apiClient = axios.create({
  baseURL: normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL),
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
