// ============================================
// EduBridge AI – Teacher Dashboard Page
// Analytics, student management, quiz creation
// Student profile inspection & quiz analytics
// ============================================

"use client";

import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BarChart3,
  AlertTriangle,
  BookOpen,
  Brain,
  TrendingUp,
  TrendingDown,
  Loader2,
  Plus,
  Search,
  Send,
  CheckCircle,
  Eye,
  ArrowLeft,
  Clock,
  Award,
  Target,
  Flame,
  GraduationCap,
  FileText,
  User,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  avgScore: number;
  quizzesTaken: number;
  riskScore: number;
  weakTopics: string[];
  lastActive: string;
}

interface DashboardData {
  summary: {
    totalStudents: number;
    avgClassScore: number;
    atRiskStudents: number;
    quizzesCreated: number;
  };
  students: Student[];
  weakTopicClusters: { topic: string; count: number; avgScore: number }[];
  recentQuizzes: { id: string; title: string; subject: string; attempts: number; avgScore: number }[];
}

interface StudentProfileData {
  student: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    joinedAt: string;
    profile: {
      averageScore: number;
      totalQuizzesTaken: number;
      currentDifficulty: string;
      streakDays: number;
      lastActiveAt: string;
      learningStyle: string | null;
      careerInterests: any;
      weakTopics: { topic: string; subject: string; proficiency: number; attempts: number }[];
    } | null;
  };
  analytics: {
    totalAttempts: number;
    avgPercentage: number;
    avgTimeTaken: number;
    bestScore: number;
    worstScore: number;
    scoreTrend: { quizTitle: string; percentage: number; date: string }[];
    subjectBreakdown: { subject: string; attempts: number; avgScore: number }[];
  };
  quizAttempts: {
    id: string;
    quizId: string;
    quizTitle: string;
    subject: string;
    difficulty: string;
    createdBy: string;
    score: number;
    maxScore: number;
    percentage: number;
    timeTaken: number | null;
    completedAt: string | null;
    attemptedAt: string;
  }[];
  labSessions: {
    id: string;
    experimentTitle: string;
    status: string;
    score: number | null;
    duration: number | null;
    date: string;
  }[];
}

interface QuizAnalyticsData {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    subject: string;
    difficulty: string;
    isPublished: boolean;
    timeLimit: number | null;
    questionCount: number;
    createdBy: string;
    createdAt: string;
  };
  analytics: {
    totalAttempts: number;
    uniqueStudents: number;
    avgScore: number;
    avgTimeTaken: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
    scoreDistribution: { excellent: number; good: number; average: number; poor: number };
  };
  attempts: {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    score: number;
    maxScore: number;
    percentage: number;
    timeTaken: number | null;
    completedAt: string | null;
    attemptedAt: string;
  }[];
}

export default function TeacherPage() {
  const { apiFetch } = useApi();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  // AI Quiz Generation
  const [quizSubject, setQuizSubject] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("INTERMEDIATE");
  const [quizCount, setQuizCount] = useState(5);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [publishingQuiz, setPublishingQuiz] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Student Profile Inspection
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Quiz Analytics
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizAnalytics, setQuizAnalytics] = useState<QuizAnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const res = await apiFetch<DashboardData>("/api/teacher/dashboard");
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  const handleGenerateQuiz = async () => {
    if (!quizSubject || !quizTopic) return;
    setGeneratingQuiz(true);

    const res = await apiFetch<any>("/api/ai/generate-quiz", {
      method: "POST",
      body: JSON.stringify({
        subject: quizSubject,
        topic: quizTopic,
        difficulty: quizDifficulty,
        questionCount: quizCount,
        questionType: "MCQ",
      }),
    });

    if (res.success && res.data) {
      setGeneratedQuiz(res.data);
      setPublishSuccess(false);
    }
    setGeneratingQuiz(false);
  };

  const handlePublishQuiz = async () => {
    if (!generatedQuiz?.quiz) return;
    setPublishingQuiz(true);

    const res = await apiFetch<any>("/api/teacher/quiz", {
      method: "POST",
      body: JSON.stringify({
        title: generatedQuiz.quiz.title,
        description: generatedQuiz.quiz.description,
        subject: quizSubject,
        topic: quizTopic,
        difficulty: quizDifficulty,
        questions: generatedQuiz.quiz.questions,
        publish: true,
      }),
    });

    if (res.success) {
      setPublishSuccess(true);
      loadDashboard(); // Refresh stats
    }
    setPublishingQuiz(false);
  };

  const handleInspectStudent = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setLoadingProfile(true);
    const res = await apiFetch<StudentProfileData>(`/api/teacher/student/${studentId}`);
    if (res.success && res.data) {
      setStudentProfile(res.data);
    }
    setLoadingProfile(false);
  };

  const handleViewQuizAnalytics = async (quizId: string) => {
    setSelectedQuizId(quizId);
    setLoadingAnalytics(true);
    const res = await apiFetch<QuizAnalyticsData>(`/api/teacher/quiz/${quizId}/attempts`);
    if (res.success && res.data) {
      setQuizAnalytics(res.data);
    }
    setLoadingAnalytics(false);
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "—";
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredStudents = data?.students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Teacher Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Student analytics, performance tracking & quiz management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{data?.summary?.totalStudents || 0}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{data?.summary?.avgClassScore || 0}%</p>
                <p className="text-xs text-muted-foreground">Class Average</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{data?.summary?.atRiskStudents || 0}</p>
                <p className="text-xs text-muted-foreground">At-Risk Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{data?.summary?.quizzesCreated || 0}</p>
                <p className="text-xs text-muted-foreground">Quizzes Created</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="quiz">Create Quiz</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weak Topic Clusters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-orange-500" /> Weak Topic Clusters
                </CardTitle>
                <CardDescription>Topics where students struggle most</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.weakTopicClusters && data.weakTopicClusters.length > 0 ? (
                  data.weakTopicClusters.slice(0, 8).map((cluster, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{cluster.topic}</span>
                        <span className="text-muted-foreground">
                          {cluster.count} students · {cluster.avgScore}%
                        </span>
                      </div>
                      <Progress value={cluster.avgScore} className="h-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" /> Recent Quizzes
                </CardTitle>
                <CardDescription>Click a quiz to see analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.recentQuizzes && data.recentQuizzes.length > 0 ? (
                  data.recentQuizzes.map((quiz, i) => (
                    <div
                      key={i}
                      onClick={() => handleViewQuizAnalytics(quiz.id)}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{quiz.title}</p>
                        <p className="text-xs text-muted-foreground">{quiz.subject}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">{quiz.avgScore}%</p>
                          <p className="text-xs text-muted-foreground">{quiz.attempts} attempts</p>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No quizzes yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* At-Risk Students */}
          {filteredStudents.filter((s) => s.riskScore >= 70).length > 0 && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" /> At-Risk Students
                </CardTitle>
                <CardDescription>Students who may need additional support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredStudents
                    .filter((s) => s.riskScore >= 70)
                    .map((student) => (
                      <div
                        key={student.id}
                        className="p-3 rounded-lg border border-red-200 dark:border-red-900 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{student.name}</p>
                          <Badge variant="destructive" className="text-xs">
                            Risk: {student.riskScore}%
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {student.weakTopics.slice(0, 3).map((topic, j) => (
                            <Badge key={j} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Avg Score: {student.avgScore}% · Quizzes: {student.quizzesTaken}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p className="text-xs text-muted-foreground">Click a student row to inspect their full profile</p>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Student</th>
                  <th className="text-left p-3 font-medium">Avg Score</th>
                  <th className="text-left p-3 font-medium">Quizzes</th>
                  <th className="text-left p-3 font-medium">Risk</th>
                  <th className="text-left p-3 font-medium">Weak Topics</th>
                  <th className="text-center p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => handleInspectStudent(student.id)}
                    >
                      <td className="p-3">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {student.avgScore >= 60 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          {student.avgScore}%
                        </div>
                      </td>
                      <td className="p-3">{student.quizzesTaken}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            student.riskScore >= 70
                              ? "destructive"
                              : student.riskScore >= 40
                                ? "warning"
                                : "success"
                          }
                          className="text-xs"
                        >
                          {student.riskScore}%
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {student.weakTopics.slice(0, 2).map((topic, j) => (
                            <Badge key={j} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {student.weakTopics.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{student.weakTopics.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-xs"
                          onClick={(e) => { e.stopPropagation(); handleInspectStudent(student.id); }}
                        >
                          <Eye className="h-3 w-3" /> View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-3 text-center text-muted-foreground">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Create Quiz Tab */}
        <TabsContent value="quiz" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" /> AI Quiz Generator
              </CardTitle>
              <CardDescription>
                Create quizzes automatically using AI. Specify the subject, topic, and difficulty.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject *</label>
                  <input
                    type="text"
                    value={quizSubject}
                    onChange={(e) => setQuizSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Topic *</label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="e.g. Quadratic Equations"
                    className="w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <div className="flex gap-2">
                    {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((d) => (
                      <Button
                        key={d}
                        size="sm"
                        variant={quizDifficulty === d ? "default" : "outline"}
                        onClick={() => setQuizDifficulty(d)}
                      >
                        {d}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Number of Questions: {quizCount}
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={20}
                    value={quizCount}
                    onChange={(e) => setQuizCount(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <Button onClick={handleGenerateQuiz} disabled={generatingQuiz || !quizSubject || !quizTopic} className="gap-2">
                {generatingQuiz ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                {generatingQuiz ? "Generating..." : "Generate Quiz with AI"}
              </Button>

              {/* Generated Quiz Preview */}
              {generatedQuiz && (
                <Card className="mt-4 border-primary/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{generatedQuiz.quiz?.title || "Generated Quiz Preview"}</CardTitle>
                        <CardDescription>
                          {quizSubject} – {quizTopic} ({quizDifficulty}) • {generatedQuiz.quiz?.questions?.length || 0} questions
                        </CardDescription>
                      </div>
                      {publishSuccess ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" /> Published!
                        </Badge>
                      ) : (
                        <Button onClick={handlePublishQuiz} disabled={publishingQuiz} className="gap-2">
                          {publishingQuiz ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          {publishingQuiz ? "Publishing..." : "Publish & Notify Students"}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {generatedQuiz.quiz?.questions?.map((q: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <p className="font-medium text-sm">
                          Q{i + 1}. {q.questionText}
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {q.options?.map((opt: string, j: number) => (
                            <div
                              key={j}
                              className={`text-xs p-2 rounded ${opt.startsWith(q.correctAnswer)
                                  ? "bg-green-100 dark:bg-green-900/30 font-medium"
                                  : "bg-background"
                                }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="text-xs text-muted-foreground">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════ */}
      {/* STUDENT PROFILE INSPECTION PANEL                   */}
      {/* ═══════════════════════════════════════════════════ */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-8 overflow-y-auto">
          <div className="bg-background rounded-xl shadow-2xl max-w-4xl w-full mx-4 mb-8 border">
            {loadingProfile ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading student profile...</span>
              </div>
            ) : studentProfile ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{studentProfile.student.name}</h2>
                      <p className="text-sm text-muted-foreground">{studentProfile.student.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedStudentId(null); setStudentProfile(null); }}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Close
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 pb-3">
                  <div className="rounded-lg border p-3 text-center">
                    <Award className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{studentProfile.analytics.avgPercentage}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <FileText className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{studentProfile.analytics.totalAttempts}</p>
                    <p className="text-xs text-muted-foreground">Quizzes Taken</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <Clock className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{formatTime(studentProfile.analytics.avgTimeTaken)}</p>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{studentProfile.student.profile?.streakDays || 0}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>

                {/* Additional Stats Row */}
                <div className="grid grid-cols-3 gap-3 px-6 pb-3">
                  <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-2 text-center">
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">{studentProfile.analytics.bestScore}%</p>
                    <p className="text-xs text-muted-foreground">Best Score</p>
                  </div>
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-2 text-center">
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">{studentProfile.analytics.worstScore}%</p>
                    <p className="text-xs text-muted-foreground">Lowest Score</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2 text-center">
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400">{studentProfile.student.profile?.currentDifficulty || "—"}</p>
                    <p className="text-xs text-muted-foreground">Difficulty Level</p>
                  </div>
                </div>

                {/* Subject Breakdown */}
                {studentProfile.analytics.subjectBreakdown.length > 0 && (
                  <div className="px-6 pb-3">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <Target className="h-4 w-4" /> Subject Performance
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {studentProfile.analytics.subjectBreakdown.map((sb, i) => (
                        <div key={i} className="rounded-lg border p-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">{sb.subject}</span>
                            <span>{sb.avgScore}%</span>
                          </div>
                          <Progress value={sb.avgScore} className="h-1.5" />
                          <p className="text-xs text-muted-foreground">{sb.attempts} attempts</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weak Topics */}
                {studentProfile.student.profile?.weakTopics && studentProfile.student.profile.weakTopics.length > 0 && (
                  <div className="px-6 pb-3">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-orange-500" /> Weak Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {studentProfile.student.profile.weakTopics.map((wt, i) => (
                        <div key={i} className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs">
                          <span className="font-medium">{wt.topic}</span>
                          <span className="text-muted-foreground">({wt.subject})</span>
                          <Badge variant={wt.proficiency < 40 ? "destructive" : "warning"} className="text-[10px] ml-1 px-1 py-0">
                            {wt.proficiency}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Score Trend */}
                {studentProfile.analytics.scoreTrend.length > 0 && (
                  <div className="px-6 pb-3">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" /> Recent Score Trend
                    </h3>
                    <div className="flex items-end gap-1 h-20">
                      {studentProfile.analytics.scoreTrend.map((pt, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${pt.quizTitle}: ${pt.percentage}%`}>
                          <span className="text-[9px] text-muted-foreground">{pt.percentage}%</span>
                          <div
                            className={`w-full rounded-t ${pt.percentage >= 70 ? "bg-green-500" : pt.percentage >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ height: `${Math.max(pt.percentage * 0.6, 4)}px` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attempted Quizzes Table */}
                <div className="px-6 pb-6">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <GraduationCap className="h-4 w-4 text-purple-500" /> Attempted Quizzes ({studentProfile.quizAttempts.length})
                  </h3>
                  {studentProfile.quizAttempts.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0">
                          <tr className="bg-muted/50">
                            <th className="text-left p-2 font-medium">Quiz</th>
                            <th className="text-left p-2 font-medium">Subject</th>
                            <th className="text-left p-2 font-medium">Difficulty</th>
                            <th className="text-center p-2 font-medium">Score</th>
                            <th className="text-center p-2 font-medium">Time</th>
                            <th className="text-right p-2 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentProfile.quizAttempts.map((attempt) => (
                            <tr key={attempt.id} className="border-t hover:bg-muted/20">
                              <td className="p-2 font-medium">{attempt.quizTitle}</td>
                              <td className="p-2 text-muted-foreground">{attempt.subject}</td>
                              <td className="p-2">
                                <Badge variant="outline" className="text-[10px]">{attempt.difficulty}</Badge>
                              </td>
                              <td className="p-2 text-center">
                                <span className={`font-bold ${attempt.percentage >= 70 ? "text-green-600" : attempt.percentage >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                                  {attempt.percentage}%
                                </span>
                                <span className="text-muted-foreground ml-1">({attempt.score}/{attempt.maxScore})</span>
                              </td>
                              <td className="p-2 text-center text-muted-foreground">{formatTime(attempt.timeTaken)}</td>
                              <td className="p-2 text-right text-muted-foreground">{formatDateTime(attempt.attemptedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 text-center border rounded-lg">No quizzes attempted yet</p>
                  )}
                </div>

                {/* Lab Sessions */}
                {studentProfile.labSessions.length > 0 && (
                  <div className="px-6 pb-6">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      🧪 Lab Sessions ({studentProfile.labSessions.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {studentProfile.labSessions.map((lab) => (
                        <div key={lab.id} className="rounded-lg border p-2 text-xs space-y-1">
                          <p className="font-medium">{lab.experimentTitle}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={lab.status === "COMPLETED" ? "success" : "secondary"} className="text-[10px]">
                              {lab.status}
                            </Badge>
                            {lab.score != null && <span className="text-muted-foreground">Score: {lab.score}</span>}
                          </div>
                          <p className="text-muted-foreground">{formatDate(lab.date)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>Could not load student profile.</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setSelectedStudentId(null)}>Close</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* QUIZ ANALYTICS PANEL                               */}
      {/* ═══════════════════════════════════════════════════ */}
      {selectedQuizId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-8 overflow-y-auto">
          <div className="bg-background rounded-xl shadow-2xl max-w-4xl w-full mx-4 mb-8 border">
            {loadingAnalytics ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading quiz analytics...</span>
              </div>
            ) : quizAnalytics ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div>
                    <h2 className="text-xl font-bold">{quizAnalytics.quiz.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {quizAnalytics.quiz.subject} · {quizAnalytics.quiz.difficulty} · {quizAnalytics.quiz.questionCount} questions
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedQuizId(null); setQuizAnalytics(null); }}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Close
                  </Button>
                </div>

                {/* Analytics Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 pb-3">
                  <div className="rounded-lg border p-3 text-center">
                    <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{quizAnalytics.analytics.uniqueStudents}</p>
                    <p className="text-xs text-muted-foreground">Students Attempted</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <BarChart3 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{quizAnalytics.analytics.avgScore}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <Clock className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{formatTime(quizAnalytics.analytics.avgTimeTaken)}</p>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{quizAnalytics.analytics.passRate}%</p>
                    <p className="text-xs text-muted-foreground">Pass Rate</p>
                  </div>
                </div>

                {/* Score Range + Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-6 pb-3">
                  <div className="rounded-lg border p-3">
                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Score Range</h4>
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{quizAnalytics.analytics.highestScore}%</p>
                        <p className="text-xs text-muted-foreground">Highest</p>
                      </div>
                      <div className="flex-1 mx-4 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                          style={{ width: "100%" }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{quizAnalytics.analytics.lowestScore}%</p>
                        <p className="text-xs text-muted-foreground">Lowest</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Score Distribution</h4>
                    <div className="grid grid-cols-4 gap-1 text-center text-xs">
                      <div>
                        <div className="h-8 bg-green-500/20 rounded flex items-center justify-center">
                          <span className="font-bold text-green-700 dark:text-green-400">{quizAnalytics.analytics.scoreDistribution.excellent}</span>
                        </div>
                        <p className="text-muted-foreground mt-1">80%+</p>
                      </div>
                      <div>
                        <div className="h-8 bg-blue-500/20 rounded flex items-center justify-center">
                          <span className="font-bold text-blue-700 dark:text-blue-400">{quizAnalytics.analytics.scoreDistribution.good}</span>
                        </div>
                        <p className="text-muted-foreground mt-1">60-79%</p>
                      </div>
                      <div>
                        <div className="h-8 bg-yellow-500/20 rounded flex items-center justify-center">
                          <span className="font-bold text-yellow-700 dark:text-yellow-400">{quizAnalytics.analytics.scoreDistribution.average}</span>
                        </div>
                        <p className="text-muted-foreground mt-1">40-59%</p>
                      </div>
                      <div>
                        <div className="h-8 bg-red-500/20 rounded flex items-center justify-center">
                          <span className="font-bold text-red-700 dark:text-red-400">{quizAnalytics.analytics.scoreDistribution.poor}</span>
                        </div>
                        <p className="text-muted-foreground mt-1">&lt;40%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attempts Table */}
                <div className="px-6 pb-6">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <GraduationCap className="h-4 w-4 text-purple-500" /> 
                    All Attempts ({quizAnalytics.analytics.totalAttempts})
                  </h3>
                  {quizAnalytics.attempts.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0">
                          <tr className="bg-muted/50">
                            <th className="text-left p-2 font-medium">Student Name</th>
                            <th className="text-left p-2 font-medium">Email</th>
                            <th className="text-center p-2 font-medium">Score</th>
                            <th className="text-center p-2 font-medium">Percentage</th>
                            <th className="text-center p-2 font-medium">Time Taken</th>
                            <th className="text-right p-2 font-medium">Attempted At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quizAnalytics.attempts.map((attempt) => (
                            <tr
                              key={attempt.id}
                              className="border-t hover:bg-muted/20 cursor-pointer"
                              onClick={() => {
                                setSelectedQuizId(null);
                                setQuizAnalytics(null);
                                handleInspectStudent(attempt.studentId);
                              }}
                              title="Click to view student profile"
                            >
                              <td className="p-2 font-medium">{attempt.studentName}</td>
                              <td className="p-2 text-muted-foreground">{attempt.studentEmail}</td>
                              <td className="p-2 text-center">{attempt.score}/{attempt.maxScore}</td>
                              <td className="p-2 text-center">
                                <span className={`font-bold ${attempt.percentage >= 70 ? "text-green-600" : attempt.percentage >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                                  {attempt.percentage}%
                                </span>
                              </td>
                              <td className="p-2 text-center text-muted-foreground">{formatTime(attempt.timeTaken)}</td>
                              <td className="p-2 text-right text-muted-foreground">{formatDateTime(attempt.attemptedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 text-center border rounded-lg">No attempts yet</p>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>Could not load quiz analytics.</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setSelectedQuizId(null)}>Close</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
