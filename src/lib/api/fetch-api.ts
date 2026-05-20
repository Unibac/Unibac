export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type ApiErrorBody = {
  message?: string | string[];
  statusCode?: number;
};

function messageFromBody(body: ApiErrorBody): string {
  const m = body.message;
  if (Array.isArray(m)) return m.join(", ");
  if (typeof m === "string" && m.length > 0) return m;
  return "Error en la solicitud";
}

/** Cliente fetch same-origin para wrappers de módulos. */
export async function fetchApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(path, {
    credentials: "include",
    ...init,
    headers,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = (await res.json().catch(() => ({}))) as ApiErrorBody;
  if (!res.ok) {
    throw new ApiClientError(res.status, messageFromBody(body));
  }
  return body as T;
}
