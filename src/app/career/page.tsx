// ============================================
// EduBridge AI – Career Mapping Page
// ============================================

"use client";

import React, { useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BriefcaseBusiness,
  Loader2,
  Sparkles,
  Target,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

interface CareerPath {
  title: string;
  matchScore: number;
  description: string;
  requiredSkills: string[];
  currentSkillGaps: string[];
}

interface MonthPlan {
  month: number;
  focus: string;
  skills: string[];
  resources: { title: string; type: string; url?: string }[];
  milestones: string[];
}

interface CareerRoadmap {
  careerPaths: CareerPath[];
  sixMonthPlan: MonthPlan[];
  recommendations: string[];
}

const INTEREST_OPTIONS = [
  "Engineering", "Medicine", "Computer Science", "Data Science",
  "Design", "Business", "Education", "Research", "Arts",
  "Environmental Science", "Psychology", "Law", "Finance",
];

const STRENGTH_OPTIONS = [
  "Problem Solving", "Mathematics", "Communication", "Leadership",
  "Creativity", "Programming", "Writing", "Research", "Teamwork",
  "Critical Thinking", "Analysis", "Organization",
];

export default function CareerPage() {
  const { apiFetch } = useApi();
  const [interests, setInterests] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [level, setLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSelection = (item: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleGenerate = async () => {
    if (interests.length === 0) {
      setError("Please select at least one interest");
      return;
    }
    setError("");
    setLoading(true);

    const res = await apiFetch<{ roadmap: CareerRoadmap }>("/api/student/career", {
      method: "POST",
      body: JSON.stringify({ interests, strengths, currentLevel: level }),
    });

    if (res.success && res.data) {
      setRoadmap(res.data.roadmap);
    } else {
      setError(res.error || "Failed to generate roadmap");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BriefcaseBusiness className="h-8 w-8 text-primary" />
          Career Mapping
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-powered career guidance with personalized roadmaps
        </p>
      </div>

      {/* Input Section */}
      {!roadmap && (
        <Card>
          <CardHeader>
            <CardTitle>Tell us about yourself</CardTitle>
            <CardDescription>Select your interests and strengths for AI-powered career mapping</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interests */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Interests * (select at least one)
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <Button
                    key={interest}
                    variant={interests.includes(interest) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSelection(interest, interests, setInterests)}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div>
              <label className="block text-sm font-medium mb-2">Strengths (optional)</label>
              <div className="flex flex-wrap gap-2">
                {STRENGTH_OPTIONS.map((strength) => (
                  <Button
                    key={strength}
                    variant={strengths.includes(strength) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSelection(strength, strengths, setStrengths)}
                  >
                    {strength}
                  </Button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium mb-2">Current Level</label>
              <div className="flex gap-2">
                {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((l) => (
                  <Button
                    key={l}
                    variant={level === l ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLevel(l)}
                  >
                    {l}
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm" role="alert">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}

            <Button onClick={handleGenerate} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Generating Roadmap..." : "Generate Career Roadmap"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Roadmap Results */}
      {roadmap && (
        <>
          <Button variant="outline" onClick={() => setRoadmap(null)} className="gap-2">
            Start Over
          </Button>

          {/* Career Paths */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" /> Recommended Career Paths
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roadmap.careerPaths.map((path, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                      <Badge variant={path.matchScore >= 80 ? "success" : "secondary"}>
                        {path.matchScore}% match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{path.description}</p>
                    <Progress value={path.matchScore} className="h-2" />

                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {path.requiredSkills.map((skill, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {path.currentSkillGaps.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-destructive mb-1">Skill Gaps:</p>
                        <div className="flex flex-wrap gap-1">
                          {path.currentSkillGaps.map((gap, j) => (
                            <Badge key={j} variant="destructive" className="text-xs">
                              {gap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 6-Month Plan */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" /> 6-Month Roadmap
            </h2>
            <div className="space-y-4">
              {roadmap.sixMonthPlan.map((month) => (
                <Card key={month.month}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {month.month}
                      </div>
                      <div>
                        <CardTitle className="text-lg">Month {month.month}: {month.focus}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {month.skills.map((skill, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> Resources
                        </p>
                        <ul className="space-y-1">
                          {month.resources.map((res, j) => (
                            <li key={j} className="text-xs">
                              {res.url ? (
                                <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  {res.title}
                                </a>
                              ) : (
                                res.title
                              )}
                              <Badge variant="outline" className="ml-1 text-[10px]">{res.type}</Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Milestones
                        </p>
                        <ul className="space-y-1">
                          {month.milestones.map((m, j) => (
                            <li key={j} className="text-xs flex items-start gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {roadmap.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {roadmap.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
