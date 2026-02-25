// ============================================
// GET /api/teacher/student/[studentId]
// Teacher inspects a student's full profile
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { successResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "TEACHER", "ADMIN");
    if (roleError) return roleError;

    const { studentId } = await params;

    // Fetch student with full profile, weak topics, and quiz attempts
    const student = await prisma.user.findUnique({
      where: { id: studentId, role: "STUDENT", deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        studentProfile: {
          select: {
            averageScore: true,
            totalQuizzesTaken: true,
            currentDifficulty: true,
            streakDays: true,
            lastActiveAt: true,
            learningStyle: true,
            careerInterests: true,
            weakTopics: {
              include: {
                topic: {
                  select: {
                    name: true,
                    subject: { select: { name: true } },
                  },
                },
              },
              orderBy: { proficiencyScore: "asc" },
            },
          },
        },
        quizAttempts: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            score: true,
            maxScore: true,
            percentage: true,
            timeTaken: true,
            completedAt: true,
            createdAt: true,
            quiz: {
              select: {
                id: true,
                title: true,
                difficulty: true,
                subject: { select: { name: true } },
                creator: { select: { name: true } },
              },
            },
          },
        },
        labSessions: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            experimentTitle: true,
            status: true,
            score: true,
            duration: true,
            createdAt: true,
          },
        },
        studyPlans: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            description: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!student) {
      return notFoundResponse("Student not found");
    }

    // Compute additional analytics
    const attempts = student.quizAttempts;
    const totalAttempts = attempts.length;
    const avgPercentage =
      totalAttempts > 0
        ? Math.round(
            (attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts) * 100
          ) / 100
        : 0;
    const avgTimeTaken =
      totalAttempts > 0
        ? Math.round(
            attempts.filter((a) => a.timeTaken != null).reduce((sum, a) => sum + (a.timeTaken || 0), 0) /
              Math.max(attempts.filter((a) => a.timeTaken != null).length, 1)
          )
        : 0;
    const bestScore = totalAttempts > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;
    const worstScore = totalAttempts > 0 ? Math.min(...attempts.map((a) => a.percentage)) : 0;

    // Score trend (last 10 attempts, oldest first)
    const scoreTrend = attempts
      .slice(0, 10)
      .reverse()
      .map((a) => ({
        quizTitle: a.quiz?.title || "Unknown",
        percentage: a.percentage,
        date: a.createdAt.toISOString(),
      }));

    // Subject-wise breakdown
    const subjectMap = new Map<string, { total: number; sum: number }>();
    for (const attempt of attempts) {
      const subject = attempt.quiz?.subject?.name || "General";
      const existing = subjectMap.get(subject) || { total: 0, sum: 0 };
      existing.total += 1;
      existing.sum += attempt.percentage;
      subjectMap.set(subject, existing);
    }
    const subjectBreakdown = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      attempts: data.total,
      avgScore: Math.round((data.sum / data.total) * 100) / 100,
    }));

    return successResponse({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        isActive: student.isActive,
        joinedAt: student.createdAt.toISOString(),
        profile: student.studentProfile
          ? {
              averageScore: student.studentProfile.averageScore,
              totalQuizzesTaken: student.studentProfile.totalQuizzesTaken,
              currentDifficulty: student.studentProfile.currentDifficulty,
              streakDays: student.studentProfile.streakDays,
              lastActiveAt: student.studentProfile.lastActiveAt?.toISOString(),
              learningStyle: student.studentProfile.learningStyle,
              careerInterests: student.studentProfile.careerInterests,
              weakTopics: student.studentProfile.weakTopics.map((wt) => ({
                topic: wt.topic?.name || "Unknown",
                subject: wt.topic?.subject?.name || "General",
                proficiency: wt.proficiencyScore,
                attempts: wt.attemptCount,
              })),
            }
          : null,
      },
      analytics: {
        totalAttempts,
        avgPercentage,
        avgTimeTaken,
        bestScore,
        worstScore,
        scoreTrend,
        subjectBreakdown,
      },
      quizAttempts: student.quizAttempts.map((a) => ({
        id: a.id,
        quizId: a.quiz?.id,
        quizTitle: a.quiz?.title || "Unknown",
        subject: a.quiz?.subject?.name || "General",
        difficulty: a.quiz?.difficulty,
        createdBy: a.quiz?.creator?.name || "Unknown",
        score: a.score,
        maxScore: a.maxScore,
        percentage: a.percentage,
        timeTaken: a.timeTaken,
        completedAt: a.completedAt?.toISOString(),
        attemptedAt: a.createdAt.toISOString(),
      })),
      labSessions: student.labSessions.map((l) => ({
        id: l.id,
        experimentTitle: l.experimentTitle,
        status: l.status,
        score: l.score,
        duration: l.duration,
        date: l.createdAt.toISOString(),
      })),
      studyPlans: student.studyPlans.map((sp) => ({
        id: sp.id,
        title: sp.title,
        description: sp.description,
        isActive: sp.isActive,
        createdAt: sp.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Student profile error:", error);
    return serverErrorResponse();
  }
}
