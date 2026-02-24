// ============================================
// POST /api/auth/login
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email, isActive: true, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        avatarUrl: true,
        preferredLang: true,
      },
    });

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return errorResponse("Invalid email or password", 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    void _;

    return successResponse(
      { user: userWithoutPassword, token },
      "Login successful"
    );
  } catch (error) {
    console.error("Login error:", error);
    return serverErrorResponse();
  }
}
