// ============================================
// POST /api/student/study-plan – Generate study plan
// GET  /api/student/study-plan – Get active plans
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { studyPlanSchema } from "@/lib/validations";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";
import { identifyWeakTopics } from "@/services/personalization";
import { generateStudyPlan } from "@/services/ai";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "STUDENT");
    if (roleError) return roleError;

    const plans = await prisma.studyPlan.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ plans });
  } catch (error) {
    console.error("Get study plans error:", error);
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
    const parsed = studyPlanSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    // Get weak topics
    const weakTopics = await identifyWeakTopics(auth.userId);
    const topicsForPlan = weakTopics.map((t) => ({
      name: t.topicName,
      proficiencyScore: t.proficiencyScore,
    }));

    if (topicsForPlan.length === 0) {
      topicsForPlan.push(
        { name: "General Review", proficiencyScore: 50 }
      );
    }

    // Get subject name if provided
    let subjectName: string | undefined;
    if (parsed.data.subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: parsed.data.subjectId },
      });
      subjectName = subject?.name;
    }

    // Generate AI study plan
    const aiPlan = await generateStudyPlan(
      topicsForPlan,
      subjectName,
      parsed.data.durationWeeks
    );

    // Save to database
    const plan = await prisma.studyPlan.create({
      data: {
        userId: auth.userId,
        title: aiPlan.title,
        description: aiPlan.description,
        goals: aiPlan.goals,
        schedule: aiPlan.schedule,
        isActive: true,
      },
    });

    return successResponse(
      { plan, details: aiPlan },
      "Study plan generated successfully",
      201
    );
  } catch (error) {
    console.error("Generate study plan error:", error);
    return serverErrorResponse();
  }
}
