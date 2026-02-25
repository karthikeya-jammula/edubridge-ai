// ============================================
// POST /api/student/quiz – Submit quiz attempt
// GET  /api/student/quiz – Get available quizzes
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { quizAttemptSchema } from "@/lib/validations";
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";
import { updateStudentProfile } from "@/services/personalization";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "STUDENT");
    if (roleError) return roleError;

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const difficulty = searchParams.get("difficulty");

    const quizzes = await prisma.quiz.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        ...(subjectId && { subjectId }),
        ...(difficulty && { difficulty: difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }),
      },
      include: {
        subject: { select: { name: true } },
        questions: true,
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ quizzes });
  } catch (error) {
    console.error("Get quizzes error:", error);
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
    const parsed = quizAttemptSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message);
    }

    const { quizId, answers, timeTaken } = parsed.data;

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return notFoundResponse("Quiz not found");
    }

    // Grade the quiz
    let score = 0;
    const maxScore = quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0);

    for (const question of quiz.questions) {
      if (answers[question.id] === question.correctAnswer) {
        score += question.points;
      }
    }

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    // Save attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: auth.userId,
        quizId,
        score,
        maxScore,
        percentage: Math.round(percentage * 100) / 100,
        answers,
        timeTaken,
        completedAt: new Date(),
      },
    });

    // Update student profile
    await updateStudentProfile(auth.userId, score, maxScore);

    return successResponse(
      {
        attempt,
        score,
        maxScore,
        percentage: Math.round(percentage * 100) / 100,
        results: quiz.questions.map((q: any) => ({
          questionId: q.id,
          correct: answers[q.id] === q.correctAnswer,
          correctAnswer: q.correctAnswer,
          userAnswer: answers[q.id] || null,
          explanation: q.explanation,
        })),
      },
      "Quiz submitted successfully"
    );
  } catch (error) {
    console.error("Submit quiz error:", error);
    return serverErrorResponse();
  }
}
