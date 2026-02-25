// ============================================
// GET/PUT/POST /api/student/notifications
// Get notifications, mark as read, create test notification
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "STUDENT", "TEACHER");
    if (roleError) return roleError;

    console.log("[Notifications GET] userId:", auth.userId, "role:", auth.role);

    let notifications = await prisma.notification.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Auto-create a welcome notification for students with zero notifications
    if (notifications.length === 0 && auth.role === "STUDENT") {
      const welcome = await prisma.notification.create({
        data: {
          userId: auth.userId,
          title: "Welcome to EduBridge AI! 🎓",
          message: "Start your learning journey! Head to Quizzes to test your knowledge, or try the AI Explainer to learn any topic.",
          type: "announcement",
        },
      });

      // Also check if there are any published quizzes to notify about
      const publishedQuizzes = await prisma.quiz.findMany({
        where: { isPublished: true, deletedAt: null },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { subject: { select: { name: true } }, creator: { select: { name: true } } },
      });

      for (const quiz of publishedQuizzes) {
        await prisma.notification.create({
          data: {
            userId: auth.userId,
            title: "New Quiz Available! 📝",
            message: `${quiz.creator?.name || "Teacher"} published \"${quiz.title}\" in ${quiz.subject?.name || "General"}. Take it now!`,
            type: "quiz",
            quizId: quiz.id,
          },
        });
      }

      // Re-fetch after creating
      notifications = await prisma.notification.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }

    const unreadCount = await prisma.notification.count({
      where: { userId: auth.userId, isRead: false },
    });

    console.log("[Notifications GET] Found:", notifications.length, "unread:", unreadCount);

    return successResponse({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return serverErrorResponse();
  }
}

// POST – Create a test notification for the logged-in user (for debugging)
export async function POST(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "STUDENT", "TEACHER");
    if (roleError) return roleError;

    const notification = await prisma.notification.create({
      data: {
        userId: auth.userId,
        title: "New Quiz Available! 📝",
        message: "A new quiz has been published. Test your knowledge now!",
        type: "quiz",
      },
    });

    console.log("[Notifications POST] Created test notification:", notification.id, "for user:", auth.userId);

    return successResponse({ notification, message: "Test notification created" });
  } catch (error) {
    console.error("Create test notification error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "STUDENT", "TEACHER");
    if (roleError) return roleError;

    const body = await request.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: { userId: auth.userId, isRead: false },
        data: { isRead: true },
      });
    } else if (notificationId) {
      // Mark single notification as read
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    }

    return successResponse({ message: "Notifications updated" });
  } catch (error) {
    console.error("Update notifications error:", error);
    return serverErrorResponse();
  }
}
