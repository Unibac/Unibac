import { NextResponse } from "next/server";

import { jsonError, jsonOk, type ApiError } from "@/lib/server/api-error";
import {
  getSessionUsuario,
  requireSessionUsuario,
  toAuthProfile,
} from "@/lib/server/session";
import {
  loginWithUsuario,
  logoutSession,
  registerPublicUser,
} from "@/modules/auth/server/auth-service";
import type { LoginInput, RegisterPublicInput } from "@/modules/auth/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginInput;
    const result = await loginWithUsuario(body);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
