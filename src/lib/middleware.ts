// ============================================
// EduBridge AI – Auth Middleware
// ============================================

import { NextRequest } from "next/server";
import { verifyToken, JwtPayload } from "@/lib/auth";
import { unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";
import { Role } from "@prisma/client";

export function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Check cookie
  const token = request.cookies.get("token")?.value;
  return token || null;
}

export function authenticateRequest(
  request: NextRequest
): JwtPayload | ReturnType<typeof unauthorizedResponse> {
  const token = getTokenFromRequest(request);

  if (!token) {
    return unauthorizedResponse("No authentication token provided");
  }

  try {
    const payload = verifyToken(token);
    return payload;
  } catch {
    return unauthorizedResponse("Invalid or expired token");
  }
}

export function authorizeRoles(payload: JwtPayload, ...roles: Role[]) {
  if (!roles.includes(payload.role)) {
    return forbiddenResponse(
      `Access denied. Required roles: ${roles.join(", ")}`
    );
  }
  return null;
}

// Helper to check if result is an error response (NextResponse)
export function isAuthError(
  result: JwtPayload | ReturnType<typeof unauthorizedResponse>
): result is ReturnType<typeof unauthorizedResponse> {
  return result instanceof Response;
}
