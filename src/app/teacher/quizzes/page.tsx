// ============================================
// EduBridge AI – Teacher Manage Quizzes Page
// ============================================

"use client";

import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Trash2,
  Send,
  Loader2,
  Brain,
  CheckCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  isPublished: boolean;
  createdAt: string;
  subject?: { name: string };
  _count?: { questions: number; attempts: number };
}

export default function ManageQuizzesPage() {
  const { apiFetch } = useApi();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [quizDetails, setQuizDetails] = useState<Record<string, any>>({});

  // Quiz creation
  const [showCreate, setShowCreate] = useState(false);
  const [quizSubject, setQuizSubject] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [quizDifficulty, setQuizDifficulty] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("INTERMEDIATE");
  const [quizCount, setQuizCount] = useState(5);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  // Actions
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Confirm delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    const res = await apiFetch<{ quizzes: Quiz[] }>("/api/teacher/quiz");
    if (res.success && res.data) {
      setQuizzes(res.data.quizzes || []);
    }
    setLoading(false);
  };

  const handleGenerateQuiz = async () => {
    if (!quizSubject || !quizTopic) return;
    setGeneratingQuiz(true);
    setSaveSuccess(false);

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
    }
    setGeneratingQuiz(false);
  };

  const handleSaveQuiz = async (publish: boolean) => {
    if (!generatedQuiz?.quiz) return;
    setSavingQuiz(true);

    const res = await apiFetch<any>("/api/teacher/quiz", {
      method: "POST",
      body: JSON.stringify({
        title: generatedQuiz.quiz.title,
        description: generatedQuiz.quiz.description,
        subject: quizSubject,
        topic: quizTopic,
        difficulty: quizDifficulty,
        questions: generatedQuiz.quiz.questions,
        publish,
      }),
    });

    if (res.success) {
      setSaveSuccess(true);
      setGeneratedQuiz(null);
      setQuizSubject("");
      setQuizTopic("");
      setShowCreate(false);
      loadQuizzes();
    }
    setSavingQuiz(false);
  };

  const handlePublish = async (quizId: string) => {
    setPublishingId(quizId);
    const res = await apiFetch<any>(`/api/teacher/quiz/${quizId}/publish`, {
      method: "PUT",
    });
    if (res.success) {
      setQuizzes((prev) =>
        prev.map((q) => (q.id === quizId ? { ...q, isPublished: true } : q))
      );
    }
    setPublishingId(null);
  };

  const handleDelete = async (quizId: string) => {
    setDeletingId(quizId);
    const res = await apiFetch<any>(`/api/teacher/quiz/${quizId}`, {
      method: "DELETE",
    });
    if (res.success) {
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      setConfirmDeleteId(null);
    }
    setDeletingId(null);
  };

  const toggleQuizDetails = async (quizId: string) => {
    if (expandedQuiz === quizId) {
      setExpandedQuiz(null);
      return;
    }
    setExpandedQuiz(quizId);
    if (!quizDetails[quizId]) {
      const res = await apiFetch<any>(`/api/teacher/quiz/${quizId}`);
      if (res.success && res.data) {
        setQuizDetails((prev) => ({ ...prev, [quizId]: res.data }));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Manage Quizzes
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, publish, and manage your quizzes
          </p>
        </div>
        <Button
          onClick={() => { setShowCreate(!showCreate); setGeneratedQuiz(null); setSaveSuccess(false); }}
          className="gap-2"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Create Quiz
        </Button>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Quiz saved and students notified successfully!</span>
        </div>
      )}

      {/* Create Quiz Panel */}
      {showCreate && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" /> AI Quiz Generator
            </CardTitle>
            <CardDescription>
              Create a quiz with AI. Choose subject, topic, difficulty and number of questions.
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
                  Questions: {quizCount}
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

            <Button
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz || !quizSubject || !quizTopic}
              className="gap-2"
            >
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
                  <CardTitle className="text-lg">
                    {generatedQuiz.quiz?.title || "Generated Quiz"}
                  </CardTitle>
                  <CardDescription>
                    {quizSubject} – {quizTopic} ({quizDifficulty}) •{" "}
                    {generatedQuiz.quiz?.questions?.length || 0} questions
                  </CardDescription>
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
                            className={`text-xs p-2 rounded ${
                              opt.startsWith(q.correctAnswer)
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
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleSaveQuiz(true)}
                      disabled={savingQuiz}
                      className="gap-2"
                    >
                      {savingQuiz ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Publish & Notify Students
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSaveQuiz(false)}
                      disabled={savingQuiz}
                      className="gap-2"
                    >
                      Save as Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quiz List */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">
          Your Quizzes ({quizzes.length})
        </h2>

        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No quizzes yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Create Quiz" to generate your first quiz with AI
              </p>
            </CardContent>
          </Card>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz.id} className="overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => toggleQuizDetails(quiz.id)}
                >
                  <BookOpen className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{quiz.title}</h3>
                      <Badge
                        variant={quiz.isPublished ? "default" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {quiz.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {quiz.subject?.name || "Unknown Subject"} •{" "}
                      {quiz._count?.questions || 0} questions •{" "}
                      {quiz._count?.attempts || 0} attempts •{" "}
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {expandedQuiz === quiz.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-1 ml-3 shrink-0">
                  {!quiz.isPublished && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(quiz.id)}
                      disabled={publishingId === quiz.id}
                      className="gap-1"
                    >
                      {publishingId === quiz.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Publish
                    </Button>
                  )}

                  {confirmDeleteId === quiz.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(quiz.id)}
                        disabled={deletingId === quiz.id}
                        className="gap-1"
                      >
                        {deletingId === quiz.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDeleteId(quiz.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded Quiz Details */}
              {expandedQuiz === quiz.id && (
                <div className="border-t p-4 bg-muted/30 space-y-3">
                  {quizDetails[quiz.id] ? (
                    quizDetails[quiz.id].quiz?.questions?.map((q: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-background space-y-2">
                        <p className="font-medium text-sm">
                          Q{i + 1}. {q.questionText}
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {(typeof q.options === "string"
                            ? JSON.parse(q.options)
                            : q.options
                          )?.map((opt: string, j: number) => (
                            <div
                              key={j}
                              className={`text-xs p-2 rounded ${
                                opt.startsWith(q.correctAnswer)
                                  ? "bg-green-100 dark:bg-green-900/30 font-medium"
                                  : "bg-muted/50"
                              }`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
