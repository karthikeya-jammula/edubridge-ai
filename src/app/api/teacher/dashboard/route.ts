// ============================================
// GET /api/teacher/dashboard
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { successResponse, serverErrorResponse } from "@/lib/api-response";
import { calculateRiskScore } from "@/services/personalization";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "TEACHER", "ADMIN");
    if (roleError) return roleError;

    // Get all students with profiles
    const students = await prisma.user.findMany({
      where: { role: "STUDENT", isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        studentProfile: {
          select: {
            averageScore: true,
            totalQuizzesTaken: true,
            currentDifficulty: true,
            streakDays: true,
            lastActiveAt: true,
            weakTopics: {
              include: { topic: { select: { name: true, subject: { select: { name: true } } } } },
              where: { proficiencyScore: { lt: 70 } },
              orderBy: { proficiencyScore: "asc" },
            },
          },
        },
      },
    });

    // Calculate risk scores for all students
    const studentsWithRisk = await Promise.all(
      students.map(async (student: any) => ({
        ...student,
        riskScore: await calculateRiskScore(student.id),
      }))
    );

    // Aggregate class-level stats
    const profiles = students
      .map((s: any) => s.studentProfile)
      .filter(Boolean);

    const classStats = {
      totalStudents: students.length,
      averageScore:
        profiles.length > 0
          ? Math.round(
            (profiles.reduce((sum: number, p: any) => sum + (p?.averageScore || 0), 0) /
              profiles.length) *
            100
          ) / 100
          : 0,
      atRiskCount: studentsWithRisk.filter((s: any) => s.riskScore > 60).length,
      activeToday: profiles.filter((p: any) => {
        if (!p?.lastActiveAt) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(p.lastActiveAt) >= today;
      }).length,
    };

    // Weak topic clustering (find most common weak topics)
    const topicCounts = new Map<string, { count: number; avgScore: number; scores: number[] }>();
    for (const student of students) {
      for (const wt of student.studentProfile?.weakTopics || []) {
        const key = wt.topic.name;
        const existing = topicCounts.get(key) || { count: 0, avgScore: 0, scores: [] };
        existing.count += 1;
        existing.scores.push(wt.proficiencyScore);
        topicCounts.set(key, existing);
      }
    }

    const weakTopicClusters = Array.from(topicCounts.entries())
      .map(([topic, data]: [string, any]) => ({
        topic,
        studentCount: data.count,
        averageProficiency:
          Math.round(
            (data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length) * 100
          ) / 100,
      }))
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 10);

    // Performance distribution (heatmap data)
    const scoreDistribution = {
      excellent: profiles.filter((p: any) => (p?.averageScore || 0) >= 80).length,
      good: profiles.filter((p: any) => (p?.averageScore || 0) >= 60 && (p?.averageScore || 0) < 80).length,
      average: profiles.filter((p: any) => (p?.averageScore || 0) >= 40 && (p?.averageScore || 0) < 60).length,
      needsImprovement: profiles.filter((p: any) => (p?.averageScore || 0) < 40).length,
    };

    // Recent quiz data
    const recentQuizzes = await prisma.quiz.findMany({
      where: { creatorId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        subject: { select: { name: true } },
        _count: { select: { attempts: true, questions: true } },
      },
    });

    const quizzesCreated = await prisma.quiz.count({ where: { creatorId: auth.userId, deletedAt: null } });

    return successResponse({
      summary: {
        totalStudents: classStats.totalStudents,
        avgClassScore: classStats.averageScore,
        atRiskStudents: classStats.atRiskCount,
        quizzesCreated: quizzesCreated,
      },
      students: studentsWithRisk.map((s: any) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        avgScore: s.studentProfile?.averageScore || 0,
        quizzesTaken: s.studentProfile?.totalQuizzesTaken || 0,
        riskScore: s.riskScore,
        weakTopics: s.studentProfile?.weakTopics?.map((wt: any) => wt.topic?.name) || [],
        lastActive: s.studentProfile?.lastActiveAt?.toISOString() || new Date().toISOString(),
      })),
      weakTopicClusters: weakTopicClusters.map((wt: any) => ({
        topic: wt.topic,
        count: wt.studentCount,
        avgScore: wt.averageProficiency,
      })),
      recentQuizzes: recentQuizzes.map((q: any) => ({
        id: q.id,
        title: q.title,
        subject: q.subject?.name || "General",
        attempts: q._count?.attempts || 0,
        avgScore: 0,
      })),
    });
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    return serverErrorResponse();
  }
}
