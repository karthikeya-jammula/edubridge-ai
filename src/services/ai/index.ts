// ============================================
// EduBridge AI – AI Service Barrel Export
// ============================================

export { chatCompletion } from "./openai-client";
export { explainTopic } from "./explain";
export { translateText, getSupportedLanguages } from "./translate";
export { generateQuiz } from "./quiz-generator";
export { textToSpeech } from "./text-to-speech";
export { speechToText } from "./speech-to-text";
export { generateCareerRoadmap } from "./career-mapping";
export { generateStudyPlan } from "./study-plan";
export { generateCacheKey, getCachedResponse, setCachedResponse } from "./cache";

export type { GeneratedQuiz, GeneratedQuestion } from "./quiz-generator";
export type { TtsResult } from "./text-to-speech";
export type { SttResult } from "./speech-to-text";
export type { CareerRoadmap } from "./career-mapping";
export type { MicroStudyPlan } from "./study-plan";
