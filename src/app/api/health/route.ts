import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/server/api-error";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return jsonOk({ status: "ok", database: "connected" });
  } catch (error) {
    return jsonError(error);
  }
}
