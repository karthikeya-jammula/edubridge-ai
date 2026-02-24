// ============================================
// EduBridge AI – Personalization Engine
// ============================================

import prisma from "@/lib/prisma";
import { Difficulty } from "@prisma/client";

// ─── ADAPTIVE DIFFICULTY ────────────────────────────

export function calculateAdaptiveDifficulty(
  averageScore: number,
  recentScores: number[]
): Difficulty {
  // Use exponential moving average for recent performance
  const recentAvg =
    recentScores.length > 0
      ? recentScores.reduce((sum, s, i) => {
          const weight = Math.pow(0.7, recentScores.length - 1 - i);
          return sum + s * weight;
        }, 0) /
        recentScores.reduce((sum, _, i) => {
          return sum + Math.pow(0.7, recentScores.length - 1 - i);
        }, 0)
      : averageScore;

  // Blend overall and recent (60% recent, 40% overall)
  const blendedScore = recentAvg * 0.6 + averageScore * 0.4;

  if (blendedScore >= 80) return "ADVANCED";
  if (blendedScore >= 50) return "INTERMEDIATE";
  return "BEGINNER";
}

// ─── WEAK TOPIC IDENTIFICATION ──────────────────────

export async function identifyWeakTopics(userId: string) {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { weakTopics: { include: { topic: true } } },
  });

  if (!profile) return [];

  // Get recent quiz attempts with topic data
  const recentAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      quiz: {
        include: {
          questions: {
            include: { topic: true },
          },
        },
      },
    },
  });

  // Aggregate performance by topic
  const topicPerformance = new Map<
    string,
    { correct: number; total: number; topicName: string }
  >();

  for (const attempt of recentAttempts) {
    const answers = attempt.answers as Record<string, string>;
    for (const question of attempt.quiz.questions) {
      if (!question.topicId || !question.topic) continue;

      const existing = topicPerformance.get(question.topicId) || {
        correct: 0,
        total: 0,
        topicName: question.topic.name,
      };

      existing.total += 1;
      if (answers[question.id] === question.correctAnswer) {
        existing.correct += 1;
      }
      topicPerformance.set(question.topicId, existing);
    }
  }

  // Update weak topics in database
  const weakTopics: {
    topicId: string;
    topicName: string;
    proficiencyScore: number;
    attemptCount: number;
  }[] = [];

  for (const [topicId, perf] of topicPerformance) {
    const proficiencyScore = (perf.correct / perf.total) * 100;

    await prisma.weakTopic.upsert({
      where: {
        profileId_topicId: {
          profileId: profile.id,
          topicId,
        },
      },
      update: {
        proficiencyScore,
        attemptCount: perf.total,
      },
      create: {
        profileId: profile.id,
        topicId,
        proficiencyScore,
        attemptCount: perf.total,
      },
    });

    if (proficiencyScore < 70) {
      weakTopics.push({
        topicId,
        topicName: perf.topicName,
        proficiencyScore,
        attemptCount: perf.total,
      });
    }
  }

  return weakTopics.sort((a, b) => a.proficiencyScore - b.proficiencyScore);
}

// ─── UPDATE STUDENT PROFILE ─────────────────────────

export async function updateStudentProfile(
  userId: string,
  quizScore: number,
  maxScore: number
) {
  const percentage = (quizScore / maxScore) * 100;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    await prisma.studentProfile.create({
      data: {
        userId,
        totalQuizzesTaken: 1,
        averageScore: percentage,
        lastActiveAt: new Date(),
      },
    });
    return;
  }

  // Calculate new running average
  const newTotal = profile.totalQuizzesTaken + 1;
  const newAverage =
    (profile.averageScore * profile.totalQuizzesTaken + percentage) / newTotal;

  // Get recent scores for adaptive difficulty
  const recentAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { percentage: true },
  });

  const recentScores = recentAttempts.map((a) => a.percentage);
  const newDifficulty = calculateAdaptiveDifficulty(newAverage, recentScores);

  // Calculate streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = profile.lastActiveAt
    ? new Date(profile.lastActiveAt)
    : null;
  let newStreak = profile.streakDays;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  await prisma.studentProfile.update({
    where: { userId },
    data: {
      totalQuizzesTaken: newTotal,
      averageScore: Math.round(newAverage * 100) / 100,
      currentDifficulty: newDifficulty,
      streakDays: newStreak,
      lastActiveAt: new Date(),
    },
  });
}

// ─── RISK SCORING (for teachers) ────────────────────

export async function calculateRiskScore(userId: string): Promise<number> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { weakTopics: true },
  });

  if (!profile) return 50; // neutral risk

  let risk = 0;

  // Low average score increases risk
  if (profile.averageScore < 40) risk += 30;
  else if (profile.averageScore < 60) risk += 15;

  // Many weak topics increases risk
  const weakCount = profile.weakTopics.filter(
    (t) => t.proficiencyScore < 50
  ).length;
  risk += Math.min(weakCount * 10, 30);

  // Low streak / inactivity
  if (profile.streakDays === 0) risk += 15;
  else if (profile.streakDays < 3) risk += 5;

  // Few quizzes taken
  if (profile.totalQuizzesTaken < 3) risk += 10;

  // Inactivity check
  if (profile.lastActiveAt) {
    const daysSinceActive = Math.floor(
      (Date.now() - profile.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceActive > 7) risk += 15;
    else if (daysSinceActive > 3) risk += 5;
  }

  return Math.min(risk, 100);
}
