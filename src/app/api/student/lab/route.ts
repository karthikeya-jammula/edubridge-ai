// ============================================
// POST /api/student/lab – Create lab session
// GET  /api/student/lab – Get lab sessions
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { labSessionSchema } from "@/lib/validations";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "STUDENT");
    if (roleError) return roleError;

    const sessions = await prisma.labSession.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      include: { topic: { select: { name: true, subject: { select: { name: true } } } } },
    });

    return successResponse({ sessions });
  } catch (error) {
    console.error("Get lab sessions error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "STUDENT");
    if (roleError) return roleError;

    const body = await request.json();
    const parsed = labSessionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const session = await prisma.labSession.create({
      data: {
        userId: auth.userId,
        experimentTitle: parsed.data.experimentTitle,
        topicId: parsed.data.topicId,
        experimentData: parsed.data.experimentData as any,
        status: "IN_PROGRESS",
      },
    });

    return successResponse(session, "Lab session started", 201);
  } catch (error) {
    console.error("Create lab session error:", error);
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const body = await request.json();
    const { sessionId, experimentData, status, score, feedback, duration } = body;

    if (!sessionId) return errorResponse("sessionId is required");

    const session = await prisma.labSession.update({
      where: { id: sessionId },
      data: {
        ...(experimentData && { experimentData }),
        ...(status && { status }),
        ...(score !== undefined && { score }),
        ...(feedback && { feedback }),
        ...(duration && { duration }),
      },
    });

    return successResponse(session, "Lab session updated");
  } catch (error) {
    console.error("Update lab session error:", error);
    return serverErrorResponse();
  }
}
