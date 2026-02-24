// ============================================
// EduBridge AI – Study Plan Generator Service
// ============================================

import { chatCompletion } from "./openai-client";

export interface MicroStudyPlan {
  title: string;
  description: string;
  goals: {
    topic: string;
    targetScore: number;
    deadline: string;
  }[];
  schedule: {
    day: string;
    topics: string[];
    duration: number; // minutes
    activities: string[];
  }[];
  tips: string[];
}

export async function generateStudyPlan(
  weakTopics: { name: string; proficiencyScore: number }[],
  subjectName?: string,
  durationWeeks = 4
): Promise<MicroStudyPlan> {
  const systemPrompt = `You are an adaptive learning AI that creates personalized study plans.
Focus on weak areas while reinforcing strengths.
Create realistic, achievable daily plans.
Return ONLY valid JSON.`;

  const topicsList = weakTopics
    .map((t) => `${t.name} (current score: ${t.proficiencyScore}%)`)
    .join(", ");

  const userPrompt = `Create a ${durationWeeks}-week micro study plan for a student with these weak topics:
${topicsList}
${subjectName ? `Subject: ${subjectName}` : ""}

Return JSON:
{
  "title": "Study plan title",
  "description": "Brief overview",
  "goals": [
    {"topic": "Topic name", "targetScore": 80, "deadline": "Week 2"}
  ],
  "schedule": [
    {
      "day": "Monday",
      "topics": ["Topic 1"],
      "duration": 45,
      "activities": ["Watch video on X", "Practice 5 problems"]
    }
  ],
  "tips": ["Study tip 1"]
}

Include 7 days in the schedule (one week cycle) and goals for each weak topic.`;

  const response = await chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.6, maxTokens: 2500, responseFormat: "json_object" }
  );

  return JSON.parse(response) as MicroStudyPlan;
}
