// ============================================
// GET /api/student/dashboard
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { successResponse, serverErrorResponse } from "@/lib/api-response";
import { identifyWeakTopics, calculateRiskScore } from "@/services/personalization";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "STUDENT");
    if (roleError) return roleError;

    // Get student profile
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: auth.userId },
      include: {
        weakTopics: {
          include: { topic: { include: { subject: true } } },
          orderBy: { proficiencyScore: "asc" },
          take: 5,
        },
      },
    });

    // Get recent quiz attempts
    const recentAttempts = await prisma.quizAttempt.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        quiz: {
          select: { title: true, subject: { select: { name: true } } },
        },
      },
    });

    // Get active study plans
    const studyPlans = await prisma.studyPlan.findMany({
      where: { userId: auth.userId, isActive: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // Get lab sessions
    const labSessions = await prisma.labSession.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Calculate weak topics and risk
    const weakTopics = await identifyWeakTopics(auth.userId);
    const riskScore = await calculateRiskScore(auth.userId);

    // Get available subjects
    const subjects = await prisma.subject.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true, iconUrl: true },
    });

    return successResponse({
      profile,
      recentAttempts,
      studyPlans,
      labSessions,
      weakTopics,
      riskScore,
      subjects,
    });
  } catch (error) {
    console.error("Student dashboard error:", error);
    return serverErrorResponse();
  }
}
