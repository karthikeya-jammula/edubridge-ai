// ============================================
// EduBridge AI – Career Mapping AI Service
// ============================================

import { chatCompletion, DEMO_MODE } from "./openai-client";
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

function getDemoCareerRoadmap(input: CareerMappingInput): CareerRoadmap {
  const interests = input.interests;
  const primary = interests[0] || "Technology";
  const secondary = interests[1] || "Science";

  return {
    careerPaths: [
      {
        title: `${primary} Specialist`,
        matchScore: 92,
        description: `Based on your strong interest in ${primary}, this career path offers excellent growth opportunities. ${primary} specialists are in high demand across industries, with competitive salaries and diverse work environments.`,
        requiredSkills: ["Critical Thinking", "Problem Solving", `${primary} Fundamentals`, "Communication", "Data Analysis"],
        currentSkillGaps: ["Advanced Certifications", "Industry Experience", "Project Management"],
      },
      {
        title: `${secondary} & ${primary} Researcher`,
        matchScore: 85,
        description: `Combining your interests in ${secondary} and ${primary}, research roles allow you to explore cutting-edge innovations. This path leads to academic or industry research positions.`,
        requiredSkills: ["Research Methodology", "Statistical Analysis", `${secondary} Knowledge`, "Technical Writing", "Collaboration"],
        currentSkillGaps: ["Research Publications", "Lab Experience", "Grant Writing"],
      },
      {
        title: `${primary} Educator & Consultant`,
        matchScore: 78,
        description: `If you enjoy teaching, becoming a ${primary} educator or consultant allows you to share knowledge while building expertise. Consultants earn well and enjoy flexible work arrangements.`,
        requiredSkills: ["Subject Matter Expertise", "Public Speaking", "Curriculum Design", "Mentoring", "Adaptability"],
        currentSkillGaps: ["Teaching Certification", "Industry Network", "Content Creation"],
      },
    ],
    sixMonthPlan: [
      {
        month: 1,
        focus: "Foundation Building",
        skills: [`${primary} Basics`, "Study Skills", "Time Management"],
        resources: [
          { title: `Introduction to ${primary} - Khan Academy`, type: "course", url: "https://www.khanacademy.org" },
          { title: `${primary} Fundamentals eBook`, type: "book" },
        ],
        milestones: ["Complete foundational course", "Score 80%+ on practice tests"],
      },
      {
        month: 2,
        focus: "Skill Development",
        skills: ["Problem Solving", "Critical Analysis", "Research Methods"],
        resources: [
          { title: `Coursera ${primary} Specialization`, type: "course", url: "https://www.coursera.org" },
          { title: "Practice Problem Sets", type: "exercise" },
        ],
        milestones: ["Complete 2 projects", "Join an online study group"],
      },
      {
        month: 3,
        focus: "Practical Application",
        skills: ["Project Work", "Hands-on Labs", "Collaboration"],
        resources: [
          { title: `${primary} Lab Simulations`, type: "lab" },
          { title: "Group Project Platform", type: "tool", url: "https://github.com" },
        ],
        milestones: ["Build first portfolio project", "Get peer review feedback"],
      },
      {
        month: 4,
        focus: "Intermediate Concepts",
        skills: [`Advanced ${primary}`, "Data Analysis", "Technical Communication"],
        resources: [
          { title: `Intermediate ${primary} - edX`, type: "course", url: "https://www.edx.org" },
          { title: "Technical Writing Guide", type: "book" },
        ],
        milestones: ["Pass intermediate assessment", "Write first technical report"],
      },
      {
        month: 5,
        focus: "Specialization",
        skills: [`${secondary} Integration`, "Specialized Tools", "Innovation"],
        resources: [
          { title: `${secondary} & ${primary} Cross-Discipline Course`, type: "course" },
          { title: "Industry Webinars", type: "video" },
        ],
        milestones: ["Choose specialization area", "Attend 2 industry events"],
      },
      {
        month: 6,
        focus: "Career Preparation",
        skills: ["Resume Building", "Interview Skills", "Professional Networking"],
        resources: [
          { title: "LinkedIn Learning Career Prep", type: "course", url: "https://www.linkedin.com/learning" },
          { title: "Mock Interview Platform", type: "tool" },
        ],
        milestones: ["Complete portfolio website", "Apply to 5 opportunities", "Get 1 mentorship connection"],
      },
    ],
    recommendations: [
      `Focus on building a strong foundation in ${primary} before moving to advanced topics`,
      `Join online communities related to ${primary} and ${secondary} to network with professionals`,
      "Create a portfolio of projects to showcase your practical skills to potential employers",
      "Seek mentorship from professionals already working in your desired career path",
      "Stay updated with industry trends by following relevant publications and conferences",
    ],
  };
}

export async function generateCareerRoadmap(
  input: CareerMappingInput,
  studentProfile?: { averageScore: number; weakTopics: string[] }
): Promise<CareerRoadmap> {
  // Return demo roadmap when OpenAI is not configured
  if (DEMO_MODE) {
    return getDemoCareerRoadmap(input);
  }

  try {
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
  } catch {
    return getDemoCareerRoadmap(input);
  }
}
