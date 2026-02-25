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
  Play,
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
  const [videoId, setVideoId] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setExplanation("");
    setTranslatedText("");
    setLanguage("en");
    setShowVideo(false);
    setVideoId("");

    // Fetch explanation and YouTube video in parallel
    const searchQuery = [topic.trim(), subject?.trim()].filter(Boolean).join(" ") + " explained";

    const [res, videoRes] = await Promise.all([
      apiFetch<{ explanation: string }>("/api/ai/explain", {
        method: "POST",
        body: JSON.stringify({ topic, subject, difficulty, language: "en", simplify }),
      }),
      fetch(`/api/ai/youtube-search?q=${encodeURIComponent(searchQuery)}`)
        .then(r => r.json())
        .catch(() => null),
    ]);

    // Set video
    if (videoRes?.success && videoRes?.data?.videoId) {
      setVideoId(videoRes.data.videoId);
    }

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Translate to:</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    if (e.target.value !== "en") {
                      handleTranslate(e.target.value);
                    } else {
                      setTranslatedText("");
                    }
                  }}
                  disabled={translating}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="en">English (Original)</option>
                  {languages
                    .filter((l) => l.code !== "en")
                    .map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                </select>
                {translating && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Translating...</span>
                  </div>
                )}
              </div>

              {translatedText && (
                <div className="mt-4 p-4 rounded-lg bg-muted">
                  <Badge className="mb-2">
                    {languages.find(l => l.code === language)?.name || "Translated"}
                  </Badge>
                  <div className="whitespace-pre-wrap text-sm">{translatedText}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {/* YouTube Visual Learning Section */}
      {explanation && videoId && (
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-glow" />
          <Card className="relative rounded-2xl border-0 bg-background overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Play className="h-5 w-5 text-red-500" />
                  Visual Learning
                </CardTitle>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.youtube.com/watch?v=${videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Open on YouTube ↗
                  </a>
                  <Button
                    variant={showVideo ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowVideo(!showVideo)}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {showVideo ? "Hide Video" : "▶ Watch Video"}
                  </Button>
                </div>
              </div>
              <CardDescription>
                Prefer to learn visually? Watch the top YouTube video on <strong>{topic}</strong>
              </CardDescription>
            </CardHeader>
            {showVideo && (
              <CardContent className="pt-0">
                <div className="relative w-full rounded-xl overflow-hidden shadow-2xl" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title={`YouTube video about ${topic}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: "none" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Top result from YouTube for your topic
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
