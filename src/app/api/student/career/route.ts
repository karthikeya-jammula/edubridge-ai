// ============================================
// POST /api/student/career – Generate career roadmap
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { careerMappingSchema } from "@/lib/validations";
import { generateCareerRoadmap } from "@/services/ai";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "STUDENT");
    if (roleError) return roleError;

    const body = await request.json();
    const parsed = careerMappingSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    // Get student profile for context
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: auth.userId },
      include: {
        weakTopics: {
          include: { topic: true },
          where: { proficiencyScore: { lt: 70 } },
        },
      },
    });

    const studentContext = profile
      ? {
          averageScore: profile.averageScore,
          weakTopics: profile.weakTopics.map((wt: any) => wt.topic.name),
        }
      : undefined;

    const roadmap = await generateCareerRoadmap(parsed.data, studentContext);

    // Update career interests in profile
    if (profile) {
      await prisma.studentProfile.update({
        where: { userId: auth.userId },
        data: { careerInterests: parsed.data.interests },
      });
    }

    return successResponse({ roadmap }, "Career roadmap generated");
  } catch (error) {
    console.error("Career mapping error:", error);
    return serverErrorResponse();
  }
}
