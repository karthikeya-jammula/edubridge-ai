// ============================================
// EduBridge AI – Teacher Dashboard Page
// Analytics, student management, quiz creation
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
        count: quizCount,
      }),
    });

    if (res.success && res.data) {
      setGeneratedQuiz(res.data);
    }
    setGeneratingQuiz(false);
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
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.recentQuizzes && data.recentQuizzes.length > 0 ? (
                  data.recentQuizzes.map((quiz, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{quiz.title}</p>
                        <p className="text-xs text-muted-foreground">{quiz.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{quiz.avgScore}%</p>
                        <p className="text-xs text-muted-foreground">{quiz.attempts} attempts</p>
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
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Student</th>
                  <th className="text-left p-3 font-medium">Avg Score</th>
                  <th className="text-left p-3 font-medium">Quizzes</th>
                  <th className="text-left p-3 font-medium">Risk</th>
                  <th className="text-left p-3 font-medium">Weak Topics</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="border-t hover:bg-muted/30">
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-muted-foreground">
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
                    <CardTitle className="text-lg">Generated Quiz Preview</CardTitle>
                    <CardDescription>
                      {quizSubject} – {quizTopic} ({quizDifficulty})
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {generatedQuiz.questions?.map((q: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <p className="font-medium text-sm">
                          Q{i + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {q.options?.map((opt: string, j: number) => (
                            <div
                              key={j}
                              className={`text-xs p-2 rounded ${j === q.correctIndex
                                  ? "bg-green-100 dark:bg-green-900/30 font-medium"
                                  : "bg-background"
                                }`}
                            >
                              {String.fromCharCode(65 + j)}. {opt}
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
    </div>
  );
}
