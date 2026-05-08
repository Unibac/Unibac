import axios from "axios";

function messageFromBody(data: unknown): string | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }
  const msg = (data as { message?: unknown }).message;
  if (typeof msg === "string") {
    return msg;
  }
  if (Array.isArray(msg)) {
    const parts = msg.filter((m): m is string => typeof m === "string");
    if (parts.length > 0) {
      return parts.join(", ");
    }
  }
  return undefined;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const fromBody = messageFromBody(error.response?.data);
    if (fromBody) {
      return fromBody;
    }
    if (error.response?.statusText) {
      return error.response.statusText;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ha ocurrido un error inesperado.";
}
