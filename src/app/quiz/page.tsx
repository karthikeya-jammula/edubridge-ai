// ============================================
// EduBridge AI – Quiz Page
// Students can generate & take quizzes
// ============================================

"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Brain,
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  subject: { name: string };
  _count: { questions: number };
}

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[];
}

interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  results: {
    questionId: string;
    correct: boolean;
    correctAnswer: string;
    userAnswer: string | null;
    explanation: string;
  }[];
}

interface GeneratedQuiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const { apiFetch } = useApi();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizWithQuestions | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  // AI Quiz Generation
  const [showGenerator, setShowGenerator] = useState(false);
  const [genSubject, setGenSubject] = useState("");
  const [genTopic, setGenTopic] = useState("");
  const [genDifficulty, setGenDifficulty] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [genCount, setGenCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    const res = await apiFetch<{ quizzes: Quiz[] }>("/api/student/quiz");
    if (res.success && res.data) {
      setQuizzes(res.data.quizzes);
    }
    setLoading(false);
  };

  const generateQuiz = async () => {
    if (!genSubject || !genTopic) return;
    setGenerating(true);

    const res = await apiFetch<{ quiz: GeneratedQuiz }>("/api/ai/generate-quiz", {
      method: "POST",
      body: JSON.stringify({
        subject: genSubject,
        topic: genTopic,
        difficulty: genDifficulty,
        questionCount: genCount,
        questionType: "MCQ",
      }),
    });

    if (res.success && res.data?.quiz) {
      // Convert generated quiz to playable format
      const quiz = res.data.quiz;
      const playableQuiz: QuizWithQuestions = {
        id: `gen-${Date.now()}`,
        title: quiz.title,
        description: quiz.description,
        difficulty: genDifficulty,
        subject: { name: genSubject },
        _count: { questions: quiz.questions.length },
        questions: quiz.questions.map((q, i) => ({
          ...q,
          id: `q-${i}`,
        })),
      };
      setActiveQuiz(playableQuiz);
      setCurrentQuestion(0);
      setAnswers({});
      setResult(null);
      setStartTime(Date.now());
      setShowGenerator(false);
    }
    setGenerating(false);
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz as QuizWithQuestions);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setStartTime(Date.now());
  };

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);

    // For AI-generated quizzes, calculate locally
    if (activeQuiz.id.startsWith("gen-")) {
      const results = activeQuiz.questions.map((q) => {
        const userAnswer = answers[q.id] || null;
        const correct = userAnswer === q.correctAnswer;
        return {
          questionId: q.id,
          correct,
          correctAnswer: q.correctAnswer,
          userAnswer,
          explanation: q.explanation,
        };
      });
      const score = results.filter((r) => r.correct).length;
      const maxScore = activeQuiz.questions.length;
      setResult({
        score,
        maxScore,
        percentage: (score / maxScore) * 100,
        results,
      });
      setSubmitting(false);
      return;
    }

    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    const res = await apiFetch<QuizResult>("/api/student/quiz", {
      method: "POST",
      body: JSON.stringify({
        quizId: activeQuiz.id,
        answers,
        timeTaken,
      }),
    });

    if (res.success && res.data) {
      setResult(res.data);
    }
    setSubmitting(false);
  };

  const resetQuiz = () => {
    setActiveQuiz(null);
    setResult(null);
    setAnswers({});
    setCurrentQuestion(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show result
  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {result.percentage >= 70 ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-3xl">
              {result.percentage >= 70 ? "Great job!" : "Keep practicing!"}
            </CardTitle>
            <CardDescription>
              You scored {result.score}/{result.maxScore} ({result.percentage.toFixed(1)}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={result.percentage} className="mb-6 h-4" />

            <div className="space-y-4">
              {result.results.map((r, i) => (
                <div
                  key={r.questionId}
                  className={`p-4 rounded-lg border ${
                    r.correct ? "border-green-200 bg-green-50 dark:bg-green-950/20" : "border-red-200 bg-red-50 dark:bg-red-950/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {r.correct ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">Question {i + 1}</p>
                      {!r.correct && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Your answer: {r.userAnswer || "No answer"} | Correct: {r.correctAnswer}
                        </p>
                      )}
                      {r.explanation && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{r.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <Button onClick={resetQuiz} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active quiz - show questions
  if (activeQuiz?.questions?.length) {
    const question = activeQuiz.questions[currentQuestion];
    const totalQuestions = activeQuiz.questions.length;
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{activeQuiz.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Question {currentQuestion + 1} of {totalQuestions}
          </div>
        </div>

        <Progress value={progress} className="h-2" />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{question.questionText}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options?.map((option, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(question.id, option.charAt(0))}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  answers[question.id] === option.charAt(0)
                    ? "border-primary bg-primary/10"
                    : "hover:bg-muted"
                }`}
              >
                {option}
              </button>
            ))}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion < totalQuestions - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion((p) => p + 1)}
                  className="gap-2"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={submitQuiz}
                  disabled={submitting}
                  className="gap-2"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Submit Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz list
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            Quizzes
          </h1>
          <p className="text-muted-foreground mt-1">Test your knowledge with adaptive quizzes</p>
        </div>
        <Button onClick={() => setShowGenerator(!showGenerator)} className="gap-2">
          <Sparkles className="h-4 w-4" />
          {showGenerator ? "Hide Generator" : "Generate Quiz with AI"}
        </Button>
      </div>

      {/* AI Quiz Generator */}
      {showGenerator && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Quiz Generator
            </CardTitle>
            <CardDescription>
              Enter any topic and let AI create a personalized quiz for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Subject</label>
                <Input
                  placeholder="e.g., Physics, Mathematics, History"
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Topic / Concept</label>
                <Input
                  placeholder="e.g., Newton's Laws, Quadratic Equations"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Difficulty</label>
                <select
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value as typeof genDifficulty)}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Number of Questions</label>
                <select
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>
            <Button
              onClick={generateQuiz}
              disabled={generating || !genSubject || !genTopic}
              className="w-full gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <Badge>{quiz.difficulty}</Badge>
                </div>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {quiz.subject?.name} &bull; {quiz._count?.questions || 0} questions
                  </span>
                  <Button size="sm" onClick={() => startQuiz(quiz)} className="gap-1">
                    Start <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !showGenerator ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No quizzes available yet.</p>
            <Button onClick={() => setShowGenerator(true)} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Your First Quiz
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
