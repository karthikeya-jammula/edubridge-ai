// ============================================
// EduBridge AI – AI Explainer Page
// ============================================

"use client";

import React, { useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useAccessibility } from "@/context/accessibility-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Globe,
  Loader2,
  Volume2,
  VolumeX,
  Sparkles,
  Baby,
} from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "te", name: "Telugu" },
  { code: "ta", name: "Tamil" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "bn", name: "Bengali" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
];

export default function ExplainPage() {
  const { apiFetch } = useApi();
  const { speak, stopSpeaking } = useAccessibility();

  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [language, setLanguage] = useState("en");
  const [simplify, setSimplify] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [translating, setTranslating] = useState(false);

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setExplanation("");
    setTranslatedText("");

    const res = await apiFetch<{ explanation: string }>("/api/ai/explain", {
      method: "POST",
      body: JSON.stringify({ topic, subject, difficulty, language, simplify }),
    });

    if (res.success && res.data) {
      setExplanation(res.data.explanation);
    } else {
      setExplanation(`Error: ${res.error || "Failed to get explanation"}`);
    }
    setLoading(false);
  };

  const handleTranslate = async (targetLang: string) => {
    if (!explanation) return;
    setTranslating(true);

    const res = await apiFetch<{ translatedText: string }>("/api/ai/translate", {
      method: "POST",
      body: JSON.stringify({ text: explanation, targetLanguage: targetLang }),
    });

    if (res.success && res.data) {
      setTranslatedText(res.data.translatedText);
    }
    setTranslating(false);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speak(translatedText || explanation, language);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          AI Explainer
        </h1>
        <p className="text-muted-foreground mt-1">
          Get clear, accessible explanations in your preferred language
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>What do you want to learn?</CardTitle>
          <CardDescription>Enter a topic and customize the explanation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleExplain} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium mb-1">
                  Topic *
                </label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, Newton's Laws"
                  required
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Subject (optional)
                </label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Biology, Physics"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium mb-1">
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant={simplify ? "default" : "outline"}
                  onClick={() => setSimplify(!simplify)}
                  className="w-full gap-2"
                >
                  <Baby className="h-4 w-4" />
                  Explain Like I&apos;m 10
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={loading || !topic.trim()} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "Generating..." : "Explain"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Explanation Output */}
      {explanation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Explanation</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSpeak}
                  className="gap-1"
                  aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
                >
                  {isSpeaking ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  {isSpeaking ? "Stop" : "Read Aloud"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
              {explanation}
            </div>

            {/* Translate Section */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Translate to:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages
                  .filter((l) => l.code !== language)
                  .map((lang) => (
                    <Button
                      key={lang.code}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTranslate(lang.code)}
                      disabled={translating}
                    >
                      {lang.name}
                    </Button>
                  ))}
              </div>

              {translating && (
                <div className="flex items-center gap-2 mt-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Translating...</span>
                </div>
              )}

              {translatedText && (
                <div className="mt-4 p-4 rounded-lg bg-muted">
                  <Badge className="mb-2">Translated</Badge>
                  <div className="whitespace-pre-wrap text-sm">{translatedText}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
