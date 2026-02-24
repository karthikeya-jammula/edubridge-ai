// ============================================
// EduBridge AI – Landing Page
// ============================================

import Link from "next/link";
import {
  GraduationCap,
  Globe,
  Brain,
  FlaskConical,
  BarChart3,
  BriefcaseBusiness,
  Accessibility,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Accessibility,
    title: "Accessible Learning",
    description:
      "Built-in text-to-speech, dyslexia-friendly fonts, high contrast mode, and screen reader support.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "AI-powered translations in 20+ languages including Hindi, Telugu, Tamil, and more regional languages.",
  },
  {
    icon: Brain,
    title: "Adaptive Personalization",
    description:
      "Smart difficulty adjustment, weak topic identification, and AI-generated micro study plans.",
  },
  {
    icon: BarChart3,
    title: "Teacher Analytics",
    description:
      "Performance heatmaps, at-risk student detection, and class-level insights for educators.",
  },
  {
    icon: FlaskConical,
    title: "Virtual Lab",
    description:
      "Interactive science experiments accessible from any device – bridging the gap for rural schools.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Career Mapping",
    description:
      "AI-generated 6-month roadmaps, skill gap analysis, and personalized resource recommendations.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="text-center py-20 max-w-4xl" aria-labelledby="hero-title">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-primary/10">
            <GraduationCap className="h-16 w-16 text-primary" aria-hidden="true" />
          </div>
        </div>
        <h1 id="hero-title" className="text-5xl font-bold tracking-tight mb-6">
          EduBridge AI
          <span className="block text-2xl font-normal text-muted-foreground mt-2">
            Inclusive Adaptive Learning Ecosystem
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          An AI-powered education platform that breaks accessibility barriers,
          supports multiple languages, adapts to every learner, and prepares
          students for their future careers.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="h-5 w-5" />
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border border-input bg-background hover:bg-accent font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-6xl py-16" aria-labelledby="features-title">
        <h2 id="features-title" className="text-3xl font-bold text-center mb-12">
          Built for Every Learner
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
            >
              <feature.icon className="h-10 w-10 text-primary mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* User Roles Section */}
      <section className="w-full max-w-4xl py-16 text-center" aria-labelledby="roles-title">
        <h2 id="roles-title" className="text-3xl font-bold mb-8">
          For Everyone in Education
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
            <GraduationCap className="h-10 w-10 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Students</h3>
            <p className="text-sm text-muted-foreground">
              Adaptive quizzes, AI explanations, virtual labs, and personalized study plans.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-green-50 dark:bg-green-950/20">
            <BarChart3 className="h-10 w-10 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Teachers</h3>
            <p className="text-sm text-muted-foreground">
              Class analytics, risk detection, weak topic clusters, and AI quiz generation.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-purple-50 dark:bg-purple-950/20">
            <Sparkles className="h-10 w-10 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Administrators</h3>
            <p className="text-sm text-muted-foreground">
              User management, system metrics, module configuration, and platform oversight.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t py-8 mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EduBridge AI. Built for inclusive education.</p>
      </footer>
    </div>
  );
}
