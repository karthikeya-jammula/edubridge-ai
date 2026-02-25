// ============================================
// EduBridge AI – Student Dashboard
// ============================================

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  BriefcaseBusiness,
  FlaskConical,
  GraduationCap,
  Flame,
  Target,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Bell,
  X,
  CheckCheck,
} from "lucide-react";

interface DashboardData {
  profile: {
    averageScore: number;
    totalQuizzesTaken: number;
    currentDifficulty: string;
    streakDays: number;
    weakTopics: { topic: { name: string; subject: { name: string } }; proficiencyScore: number }[];
  } | null;
  recentAttempts: {
    id: string;
    percentage: number;
    createdAt: string;
    quiz: { title: string; subject: { name: string } };
  }[];
  studyPlans: { id: string; title: string; isActive: boolean }[];
  subjects: { id: string; name: string }[];
  weakTopics: { topicName: string; proficiencyScore: number }[];
  riskScore: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  quizId?: string;
  createdAt: string;
}

export default function StudentDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { apiFetch } = useApi();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load dashboard data (once)
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "STUDENT") {
      router.push(user.role === "TEACHER" ? "/teacher" : "/admin");
      return;
    }

    const loadDashboard = async () => {
      try {
        const dashRes = await apiFetch<DashboardData>("/api/student/dashboard");
        if (dashRes.success && dashRes.data) {
          setData(dashRes.data);
        }
      } catch (err) {
        console.error("[Dashboard] load error:", err);
      }
      setLoading(false);
    };
    loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Fetch notifications using token from localStorage (avoids stale closure)
  useEffect(() => {
    if (authLoading || !user || user.role !== "STUDENT") return;

    const fetchNotifs = async () => {
      const authToken = localStorage.getItem("edubridge_token");
      if (!authToken) {
        console.log("[Dashboard Notif] No token in localStorage");
        return;
      }
      try {
        const res = await fetch("/api/student/notifications", {
          headers: { "Authorization": "Bearer " + authToken },
        });
        console.log("[Dashboard Notif] Response status:", res.status);
        if (!res.ok) {
          const text = await res.text();
          console.error("[Dashboard Notif] Error response:", text);
          return;
        }
        const json = await res.json();
        console.log("[Dashboard Notif] Response data:", JSON.stringify(json).slice(0, 300));
        if (json.success && json.data && Array.isArray(json.data.notifications)) {
          setNotifications(json.data.notifications);
          setUnreadCount(
            typeof json.data.unreadCount === "number"
              ? json.data.unreadCount
              : json.data.notifications.filter((n: Notification) => !n.isRead).length
          );
        }
      } catch (err) {
        console.error("[Dashboard Notif] Fetch error:", err);
      }
    };

    // Immediate + poll every 5s
    fetchNotifs();
    const id = setInterval(fetchNotifs, 5000);
    return () => clearInterval(id);
  }, [user, authLoading]);

  const markAllRead = async () => {
    const authToken = localStorage.getItem("edubridge_token");
    if (!authToken) return;
    try {
      await fetch("/api/student/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + authToken,
        },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const profile = data?.profile;

  return (
    <div className="space-y-6">
      {/* Notifications Banner */}
      {unreadCount > 0 && !showNotifications && (
        <Card className="border-primary bg-primary/5 cursor-pointer" onClick={() => setShowNotifications(true)}>
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="h-5 w-5 text-primary" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              </div>
              <span className="font-medium">You have {unreadCount} new notification{unreadCount > 1 ? 's' : ''}!</span>
            </div>
            <Button size="sm" variant="ghost">View</Button>
          </CardContent>
        </Card>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notifications
              </CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button size="sm" variant="ghost" onClick={markAllRead} className="gap-1 text-xs">
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setShowNotifications(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border ${notif.isRead ? 'bg-muted/30' : 'bg-primary/5 border-primary/30'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm ${!notif.isRead ? 'font-medium' : ''}`}>{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                    </div>
                    {notif.quizId && (
                      <Link href="/quiz">
                        <Button size="sm" variant="outline" className="text-xs shrink-0">
                          Take Quiz
                        </Button>
                      </Link>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No notifications yet</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Here&apos;s your learning progress</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/explain">
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" /> AI Explainer
            </Button>
          </Link>
          <Link href="/quiz">
            <Button className="gap-2">
              <GraduationCap className="h-4 w-4" /> Take Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.averageScore?.toFixed(1) || 0}%</div>
            <Progress value={profile?.averageScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.totalQuizzesTaken || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Keep practicing!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.streakDays || 0} days</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(profile?.streakDays || 0) > 0 ? "Great consistency!" : "Start your streak today!"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Difficulty Level</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                profile?.currentDifficulty === "ADVANCED"
                  ? "default"
                  : profile?.currentDifficulty === "INTERMEDIATE"
                  ? "secondary"
                  : "outline"
              }
              className="text-sm"
            >
              {profile?.currentDifficulty || "BEGINNER"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">Adaptive difficulty</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weak Topics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Focus Areas
            </CardTitle>
            <CardDescription>Topics that need more practice</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.weakTopics && data.weakTopics.length > 0 ? (
              <div className="space-y-4">
                {data.weakTopics.map((topic, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{topic.topicName}</p>
                      <Progress value={topic.proficiencyScore} className="mt-1" />
                    </div>
                    <Badge
                      variant={
                        topic.proficiencyScore >= 60
                          ? "secondary"
                          : topic.proficiencyScore >= 40
                          ? "warning"
                          : "destructive"
                      }
                      className="ml-4"
                    >
                      {topic.proficiencyScore.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Take some quizzes to identify your focus areas!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/explain" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <BookOpen className="h-4 w-4" /> AI Explainer
              </Button>
            </Link>
            <Link href="/quiz" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <GraduationCap className="h-4 w-4" /> Practice Quiz
              </Button>
            </Link>
            <Link href="/lab" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FlaskConical className="h-4 w-4" /> Virtual Lab
              </Button>
            </Link>
            <Link href="/career" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <BriefcaseBusiness className="h-4 w-4" /> Career Map
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quiz Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quiz Results</CardTitle>
          <CardDescription>Your latest quiz performance</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.recentAttempts && data.recentAttempts.length > 0 ? (
            <div className="space-y-3">
              {data.recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-sm">{attempt.quiz.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {attempt.quiz.subject.name} &bull;{" "}
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      attempt.percentage >= 80
                        ? "success"
                        : attempt.percentage >= 60
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {attempt.percentage.toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No quiz attempts yet. Start learning!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
