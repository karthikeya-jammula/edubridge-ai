// ============================================
// EduBridge AI – Study Plan Generator Service
// ============================================

import { chatCompletion, DEMO_MODE } from "./openai-client";

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

function getDemoStudyPlan(
  weakTopics: { name: string; proficiencyScore: number }[],
  subjectName?: string,
  durationWeeks = 4
): MicroStudyPlan {
  const subject = subjectName || "General Studies";
  const topics = weakTopics.length > 0 ? weakTopics : [{ name: "Fundamentals", proficiencyScore: 50 }];

  return {
    title: `${subject} – ${durationWeeks}-Week Improvement Plan`,
    description: `A personalized study plan targeting your weak areas in ${subject}. This plan focuses on building foundational understanding and progressively advancing to mastery.`,
    goals: topics.map((t) => ({
      topic: t.name,
      targetScore: Math.min(t.proficiencyScore + 30, 95),
      deadline: `Week ${Math.ceil(durationWeeks / topics.length)}`,
    })),
    schedule: [
      {
        day: "Monday",
        topics: [topics[0]?.name || "Review"],
        duration: 45,
        activities: [
          `Watch video lecture on ${topics[0]?.name || "key concepts"}`,
          "Take notes using the Cornell method",
          "Complete 5 practice problems",
        ],
      },
      {
        day: "Tuesday",
        topics: [topics[1]?.name || topics[0]?.name || "Practice"],
        duration: 40,
        activities: [
          "Review previous day's notes",
          `Read textbook chapter on ${topics[1]?.name || "next topic"}`,
          "Attempt quiz on EduBridge AI",
        ],
      },
      {
        day: "Wednesday",
        topics: topics.map((t) => t.name),
        duration: 50,
        activities: [
          "Mixed practice session covering all weak topics",
          "Use EduBridge AI Explainer for difficult concepts",
          "Create mind maps for visual learning",
        ],
      },
      {
        day: "Thursday",
        topics: [topics[0]?.name || "Deep Dive"],
        duration: 45,
        activities: [
          "Solve challenging problems from past exams",
          "Discuss tricky concepts with study group",
          "Use virtual lab for hands-on practice",
        ],
      },
      {
        day: "Friday",
        topics: [topics[topics.length - 1]?.name || "Advanced"],
        duration: 40,
        activities: [
          `Deep dive into ${topics[topics.length - 1]?.name || "advanced concepts"}`,
          "Watch supplementary video tutorials",
          "Complete worksheet exercises",
        ],
      },
      {
        day: "Saturday",
        topics: topics.map((t) => t.name),
        duration: 60,
        activities: [
          "Take full-length practice quiz on EduBridge AI",
          "Review all incorrect answers with AI explanations",
          "Revise weak areas identified during the week",
        ],
      },
      {
        day: "Sunday",
        topics: ["Review & Rest"],
        duration: 30,
        activities: [
          "Light review of the week's key concepts",
          "Organize study materials for next week",
          "Rest and recharge – mental health matters!",
        ],
      },
    ],
    tips: [
      "Use the Pomodoro Technique: 25 minutes focused study, 5 minutes break",
      "Teach concepts to someone else – it solidifies your understanding",
      "Use EduBridge AI's 'Explain Like I'm 10' feature for complex topics",
      "Take regular quizzes to track progress and identify remaining gaps",
      "Don't skip sleep – your brain consolidates learning during rest",
      "Translate explanations into your preferred language for better comprehension",
    ],
  };
}

export async function generateStudyPlan(
  weakTopics: { name: string; proficiencyScore: number }[],
  subjectName?: string,
  durationWeeks = 4
): Promise<MicroStudyPlan> {
  // Return demo study plan when OpenAI is not configured
  if (DEMO_MODE) {
    return getDemoStudyPlan(weakTopics, subjectName, durationWeeks);
  }

  try {
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
  } catch {
    return getDemoStudyPlan(weakTopics, subjectName, durationWeeks);
  }
}
