// ============================================
// EduBridge AI – Zod Validation Schemas
// ============================================

import { z } from "zod";

// ─── Auth ───────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional().default("STUDENT"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── AI ─────────────────────────────────────────────

export const explainSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  subject: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  language: z.string().optional().default("en"),
  simplify: z.boolean().optional().default(false),
});

export const translateSchema = z.object({
  text: z.string().min(1, "Text is required"),
  targetLanguage: z.string().min(2, "Target language code is required"),
  sourceLanguage: z.string().optional().default("en"),
});

export const generateQuizSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  subject: z.string().min(1, "Subject is required"),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  questionCount: z.number().min(1).max(20).optional().default(5),
  questionType: z.enum(["MCQ", "TRUE_FALSE", "SHORT_ANSWER"]).optional().default("MCQ"),
});

export const ttsSchema = z.object({
  text: z.string().min(1, "Text is required").max(5000),
  language: z.string().optional().default("en"),
  speed: z.number().min(0.5).max(2.0).optional().default(1.0),
});

export const sttSchema = z.object({
  audio: z.string().min(1, "Audio data is required"), // base64
  language: z.string().optional().default("en"),
});

// ─── Quiz Attempt ───────────────────────────────────

export const quizAttemptSchema = z.object({
  quizId: z.string().min(1),
  answers: z.record(z.string(), z.string()), // questionId -> answer
  timeTaken: z.number().optional(),
});

// ─── Study Plan ─────────────────────────────────────

export const studyPlanSchema = z.object({
  subjectId: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
  durationWeeks: z.number().min(1).max(26).optional().default(4),
});

// ─── Career ─────────────────────────────────────────

export const careerMappingSchema = z.object({
  interests: z.array(z.string()).min(1, "At least one interest is required"),
  strengths: z.array(z.string()).optional(),
  currentLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
});

// ─── Lab Session ────────────────────────────────────

export const labSessionSchema = z.object({
  experimentTitle: z.string().min(1),
  topicId: z.string().optional(),
  experimentData: z.record(z.string(), z.unknown()),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ExplainInput = z.infer<typeof explainSchema>;
export type TranslateInput = z.infer<typeof translateSchema>;
export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;
export type TtsInput = z.infer<typeof ttsSchema>;
export type SttInput = z.infer<typeof sttSchema>;
export type QuizAttemptInput = z.infer<typeof quizAttemptSchema>;
export type StudyPlanInput = z.infer<typeof studyPlanSchema>;
export type CareerMappingInput = z.infer<typeof careerMappingSchema>;
export type LabSessionInput = z.infer<typeof labSessionSchema>;
