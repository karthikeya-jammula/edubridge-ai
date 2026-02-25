// ============================================
// GET/PUT /api/student/notifications
// Get notifications & mark as read
// ============================================

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, isAuthError, authorizeRoles } from "@/lib/middleware";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (isAuthError(auth)) return auth;

    const roleError = authorizeRoles(auth, "STUDENT", "TEACHER");
    if (roleError) return roleError;

    const notifications = await prisma.notification.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: auth.userId, isRead: false },
    });

    return successResponse({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
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
