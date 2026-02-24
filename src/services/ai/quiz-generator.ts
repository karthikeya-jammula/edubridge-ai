// ============================================
// EduBridge AI – Quiz Generation Service
// ============================================

import { chatCompletion, DEMO_MODE } from "./openai-client";
import { GenerateQuizInput } from "@/lib/validations";

export interface GeneratedQuestion {
  questionText: string;
  questionType: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface GeneratedQuiz {
  title: string;
  description: string;
  questions: GeneratedQuestion[];
}

function getDemoQuiz(input: GenerateQuizInput): GeneratedQuiz {
  const topic = input.topic;
  const subject = input.subject;
  const count = input.questionCount;
  const type = input.questionType;

  const mcqQuestions: GeneratedQuestion[] = [
    {
      questionText: `Which of the following best describes the primary concept of ${topic} in ${subject}?`,
      questionType: "MCQ",
      options: [
        `A. A process that involves systematic analysis of ${topic}`,
        `B. A random occurrence with no predictable pattern`,
        `C. A concept limited only to theoretical applications`,
        `D. An outdated theory no longer used in modern ${subject}`,
      ],
      correctAnswer: "A",
      explanation: `${topic} is fundamentally about systematic processes and analysis. Option A correctly captures this core principle.`,
      points: 1,
    },
    {
      questionText: `What is a key real-world application of ${topic}?`,
      questionType: "MCQ",
      options: [
        "A. Entertainment and gaming only",
        `B. Problem-solving in ${subject} and related fields`,
        "C. It has no practical applications",
        "D. It is only used in academic research",
      ],
      correctAnswer: "B",
      explanation: `${topic} has wide practical applications, particularly in ${subject} and related fields, making B the correct answer.`,
      points: 1,
    },
    {
      questionText: `Which factor is most important when studying ${topic}?`,
      questionType: "MCQ",
      options: [
        "A. Memorizing all formulas without understanding",
        "B. Understanding the fundamental principles and their interactions",
        "C. Focusing only on advanced concepts",
        "D. Ignoring practical examples",
      ],
      correctAnswer: "B",
      explanation: "Understanding fundamental principles and how they interact is the most important factor in mastering any concept.",
      points: 1,
    },
    {
      questionText: `How does ${topic} relate to other areas of ${subject}?`,
      questionType: "MCQ",
      options: [
        "A. It is completely independent and isolated",
        "B. It only connects to one other area",
        `C. It forms an interconnected foundation with multiple areas of ${subject}`,
        "D. The relationship is not yet established",
      ],
      correctAnswer: "C",
      explanation: `${topic} is deeply interconnected with other areas of ${subject}, forming a foundational web of knowledge.`,
      points: 1,
    },
    {
      questionText: `What common misconception do students have about ${topic}?`,
      questionType: "MCQ",
      options: [
        "A. It is easy to understand",
        `B. It only applies in textbook scenarios, not in real life`,
        "C. It is the most important topic in all of science",
        "D. It was discovered recently",
      ],
      correctAnswer: "B",
      explanation: `A common misconception is that ${topic} only applies in textbooks, when in reality it has many real-world applications.`,
      points: 1,
    },
  ];

  const tfQuestions: GeneratedQuestion[] = [
    {
      questionText: `${topic} has practical applications in everyday life.`,
      questionType: "TRUE_FALSE",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: `${topic} has numerous practical applications that impact daily life and various industries.`,
      points: 1,
    },
    {
      questionText: `${topic} is only relevant to the field of ${subject} and has no cross-disciplinary applications.`,
      questionType: "TRUE_FALSE",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: `${topic} is interdisciplinary and connects to many fields beyond just ${subject}.`,
      points: 1,
    },
    {
      questionText: `Understanding the fundamentals of ${topic} is essential before moving to advanced concepts.`,
      questionType: "TRUE_FALSE",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "A strong foundation in the basics is crucial for understanding advanced aspects of any topic.",
      points: 1,
    },
    {
      questionText: `${topic} was developed entirely by a single scientist.`,
      questionType: "TRUE_FALSE",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: `Most scientific concepts, including ${topic}, are the result of contributions from many researchers over time.`,
      points: 1,
    },
    {
      questionText: `Students can learn ${topic} through experiments and hands-on activities.`,
      questionType: "TRUE_FALSE",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "Hands-on learning and experimentation are among the most effective ways to understand scientific concepts.",
      points: 1,
    },
  ];

  const shortQuestions: GeneratedQuestion[] = [
    {
      questionText: `Define ${topic} in your own words.`,
      questionType: "SHORT_ANSWER",
      options: null,
      correctAnswer: `${topic} is a concept in ${subject} that involves the systematic study and application of fundamental principles to understand and solve real-world problems.`,
      explanation: "A good definition should capture the core essence and practical relevance of the concept.",
      points: 2,
    },
    {
      questionText: `Give one real-world example of ${topic}.`,
      questionType: "SHORT_ANSWER",
      options: null,
      correctAnswer: `An example of ${topic} can be observed in everyday technology and natural processes around us.`,
      explanation: "Connecting concepts to real-world examples demonstrates understanding.",
      points: 2,
    },
    {
      questionText: `Why is ${topic} important in the study of ${subject}?`,
      questionType: "SHORT_ANSWER",
      options: null,
      correctAnswer: `${topic} is important because it forms a foundational building block for understanding more complex concepts in ${subject}.`,
      explanation: "Understanding importance helps students appreciate why they are learning a concept.",
      points: 2,
    },
    {
      questionText: `Name two fields where ${topic} is applied.`,
      questionType: "SHORT_ANSWER",
      options: null,
      correctAnswer: `${topic} is applied in engineering/technology and environmental science/research.`,
      explanation: "Most concepts in science have interdisciplinary applications.",
      points: 2,
    },
    {
      questionText: `What is a common mistake students make when studying ${topic}?`,
      questionType: "SHORT_ANSWER",
      options: null,
      correctAnswer: "A common mistake is memorizing facts without understanding the underlying principles and their connections.",
      explanation: "Awareness of common mistakes helps students avoid them.",
      points: 2,
    },
  ];

  const pool = type === "MCQ" ? mcqQuestions : type === "TRUE_FALSE" ? tfQuestions : shortQuestions;
  const questions = pool.slice(0, Math.min(count, pool.length));

  return {
    title: `${topic} – ${subject} Quiz`,
    description: `Test your knowledge of ${topic} in ${subject}. Difficulty: ${input.difficulty || "BEGINNER"}`,
    questions,
  };
}

export async function generateQuiz(input: GenerateQuizInput): Promise<GeneratedQuiz> {
  // Return demo quiz when OpenAI is not configured
  if (DEMO_MODE) {
    return getDemoQuiz(input);
  }

  const systemPrompt = `You are an expert quiz creator for educational platforms.
Generate high-quality questions that test understanding, not just memorization.
Always provide clear explanations for correct answers.
Return ONLY valid JSON matching the specified schema.`;

  const formatInstructions = input.questionType === "MCQ"
    ? 'Each question must have exactly 4 options labeled "A", "B", "C", "D". correctAnswer should be the letter (e.g., "A").'
    : input.questionType === "TRUE_FALSE"
    ? 'options should be ["True", "False"]. correctAnswer should be "True" or "False".'
    : 'options should be null. correctAnswer should be a short text answer.';

  const userPrompt = `Generate a quiz with these specifications:
- Topic: ${input.topic}
- Subject: ${input.subject}
- Difficulty: ${input.difficulty || "BEGINNER"}
- Number of questions: ${input.questionCount}
- Question type: ${input.questionType}

${formatInstructions}

Return JSON with this exact structure:
{
  "title": "Quiz title",
  "description": "Brief description",
  "questions": [
    {
      "questionText": "The question",
      "questionType": "${input.questionType}",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "A",
      "explanation": "Why this is correct",
      "points": 1
    }
  ]
}`;

  const response = await chatCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.7, maxTokens: 3000, responseFormat: "json_object" }
  );

  const parsed: GeneratedQuiz = JSON.parse(response);
  return parsed;
}
