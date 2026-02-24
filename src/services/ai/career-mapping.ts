// ============================================
// EduBridge AI – Career Mapping AI Service
// ============================================

import { chatCompletion } from "./openai-client";
import { CareerMappingInput } from "@/lib/validations";

export interface CareerRoadmap {
  careerPaths: {
    title: string;
    matchScore: number;
    description: string;
    requiredSkills: string[];
    currentSkillGaps: string[];
  }[];
  sixMonthPlan: {
    month: number;
    focus: string;
    skills: string[];
    resources: { title: string; type: string; url?: string }[];
    milestones: string[];
  }[];
  recommendations: string[];
}

export async function generateCareerRoadmap(
  input: CareerMappingInput,
  studentProfile?: { averageScore: number; weakTopics: string[] }
): Promise<CareerRoadmap> {
  const systemPrompt = `You are a career counselor and education advisor AI.
Analyze the student's profile and generate a practical, actionable career roadmap.
Be specific with resources and timelines.
Return ONLY valid JSON matching the specified schema.`;

  const userPrompt = `Generate a career roadmap for a student with:
- Interests: ${input.interests.join(", ")}
- Strengths: ${input.strengths?.join(", ") || "Not specified"}
- Current Level: ${input.currentLevel || "BEGINNER"}
${studentProfile ? `- Average Score: ${studentProfile.averageScore}%` : ""}
${studentProfile?.weakTopics?.length ? `- Areas needing improvement: ${studentProfile.weakTopics.join(", ")}` : ""}

Return JSON:
{
  "careerPaths": [
    {
      "title": "Career name",
      "matchScore": 85,
      "description": "Why this fits",
      "requiredSkills": ["skill1"],
      "currentSkillGaps": ["gap1"]
    }
  ],
  "sixMonthPlan": [
    {
      "month": 1,
      "focus": "Foundation",
      "skills": ["skill1"],
      "resources": [{"title": "Resource", "type": "course", "url": "https://..."}],
      "milestones": ["Complete X"]
    }
  ],
  "recommendations": ["Tip 1", "Tip 2"]
}

Provide exactly 3 career paths and 6 months of planning.`;

  const response = await chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.7, maxTokens: 3000, responseFormat: "json_object" }
  );

  return JSON.parse(response) as CareerRoadmap;
}
