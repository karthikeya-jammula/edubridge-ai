// ============================================
// EduBridge AI – Quiz Page
// ============================================

"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ArrowRight,
  RotateCcw,
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

  const startQuiz = (quiz: Quiz) => {
    // In production, fetch questions from API. Using quiz data for now.
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
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          Quizzes
        </h1>
        <p className="text-muted-foreground mt-1">Test your knowledge with adaptive quizzes</p>
      </div>

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
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No quizzes available yet. Check back soon!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
