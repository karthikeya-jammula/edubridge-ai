// ============================================
// GET/POST/DELETE /api/admin/users
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "ADMIN");
    if (roleError) return roleError;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");

    const where = {
      deletedAt: null,
      ...(role && { role: role as "STUDENT" | "TEACHER" | "ADMIN" }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          studentProfile: {
            select: { averageScore: true, totalQuizzesTaken: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "ADMIN");
    if (roleError) return roleError;

    const body = await request.json();
    const { userId, isActive, role } = body;

    if (!userId) return errorResponse("userId is required");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return notFoundResponse("User not found");

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(typeof isActive === "boolean" && { isActive }),
        ...(role && { role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return successResponse(updated, "User updated");
  } catch (error) {
    console.error("Admin update user error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "ADMIN");
    if (roleError) return roleError;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) return errorResponse("userId is required");

    // Soft delete
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), isActive: false },
    });

    return successResponse(null, "User deleted");
  } catch (error) {
    console.error("Admin delete user error:", error);
    return serverErrorResponse();
  }
}
