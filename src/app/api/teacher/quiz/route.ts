// ============================================
// POST /api/teacher/quiz – Save quiz & notify students
// GET  /api/teacher/quiz – Get teacher's quizzes
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "TEACHER", "ADMIN");
    if (roleError) return roleError;

    const quizzes = await prisma.quiz.findMany({
      where: {
        creatorId: auth.userId,
        deletedAt: null,
      },
      include: {
        subject: { select: { name: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ quizzes });
  } catch (error) {
    console.error("Get teacher quizzes error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "TEACHER", "ADMIN");
    if (roleError) return roleError;

    const body = await request.json();
    const { title, description, subject, topic, difficulty, questions, publish } = body;

    if (!title || !subject || !questions?.length) {
      return errorResponse("Title, subject, and questions are required");
    }

    // Find or create subject
    let subjectRecord = await prisma.subject.findUnique({
      where: { name: subject },
    });

    if (!subjectRecord) {
      subjectRecord = await prisma.subject.create({
        data: { name: subject, description: `${subject} subject` },
      });
    }

    // Create quiz with questions
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: description || `Quiz on ${topic || subject}`,
        difficulty: difficulty || "BEGINNER",
        isPublished: publish ?? true,
        subjectId: subjectRecord.id,
        creatorId: auth.userId,
        questions: {
          create: questions.map((q: any, index: number) => ({
            questionText: q.questionText,
            questionType: q.questionType || "MCQ",
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "",
            points: q.points || 1,
            orderIndex: index,
          })),
        },
      },
      include: {
        questions: true,
        subject: { select: { name: true } },
      },
    });

    // If published, notify all students
    if (publish !== false) {
      const students = await prisma.user.findMany({
        where: { role: "STUDENT", isActive: true, deletedAt: null },
        select: { id: true },
      });

      // Create notifications for all students
      if (students.length > 0) {
        await prisma.notification.createMany({
          data: students.map((student) => ({
            userId: student.id,
            title: "New Quiz Available! 📝",
            message: `${auth.name} published a new quiz: "${title}" in ${subject}. Test your knowledge now!`,
            type: "quiz",
            quizId: quiz.id,
          })),
        });
      }
    }

    return successResponse({ 
      quiz,
      message: `Quiz created and ${publish !== false ? 'students notified!' : 'saved as draft'}` 
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    return serverErrorResponse();
  }
}
