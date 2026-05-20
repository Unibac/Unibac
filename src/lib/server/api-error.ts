import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function jsonError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { statusCode: error.status, message: error.message },
      { status: error.status },
    );
  }
  console.error(error);
  return NextResponse.json(
    { statusCode: 500, message: "Error interno del servidor" },
    { status: 500 },
  );
}

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function jsonNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
