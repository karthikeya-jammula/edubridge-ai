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
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background dark:from-indigo-950/40 dark:via-background dark:to-background animate-fade-in" />

      {/* Animated Hero Section */}
      <section className="relative text-center py-24 md:py-32 px-4 w-full flex flex-col items-center justify-center min-h-[85vh]">
        {/* Floating blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000" />

        <div className="relative z-10 flex justify-center mb-8">
          <div className="relative p-6 rounded-3xl bg-background/50 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            <GraduationCap className="h-20 w-20 text-indigo-600 dark:text-indigo-400 drop-shadow-lg transform group-hover:scale-110 transition-transform duration-500" aria-hidden="true" />
          </div>
        </div>
        <h1 className="relative z-10 text-6xl md:text-8xl font-extrabold tracking-tight mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 animate-gradient-x">
            EduBridge AI
          </span>
          <span className="block text-2xl md:text-4xl font-medium text-foreground/80 mt-6 tracking-normal">
            The Future of Inclusive Learning
          </span>
        </h1>
        <p className="relative z-10 text-xl text-muted-foreground w-full max-w-3xl mx-auto mb-12 leading-relaxed">
          An AI-powered education platform that shatters accessibility barriers,
          supports global languages, dynamically adapts to every learner, and
          accelerates career readiness.
        </p>
        <div className="relative z-10 flex flex-col sm:flex-row gap-6 justify-center w-full max-w-md mx-auto">
          <Link
            href="/login"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white bg-indigo-600 rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x" />
            <Sparkles className="relative z-10 h-5 w-5" />
            <span className="relative z-10">Get Started Free</span>
            <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-input bg-background/50 backdrop-blur-md hover:bg-accent hover:text-accent-foreground font-semibold text-lg transition-all hover:scale-105"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Grid with High-End Cards */}
      <section className="w-full max-w-7xl py-24 px-4 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
            Engineered for Every Mind
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform leverages cutting-edge AI to personalize the educational journey for students, teachers, and institutions alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Accessibility,
              title: "Accessible Learning",
              description: "Built-in text-to-speech, dyslexia-friendly fonts, high contrast mode, and full screen reader support.",
              color: "from-blue-500 to-cyan-400"
            },
            {
              icon: Globe,
              title: "Multilingual Support",
              description: "Real-time AI translations in 20+ languages including regional dialects to break language barriers.",
              color: "from-emerald-500 to-teal-400"
            },
            {
              icon: Brain,
              title: "Adaptive Personalization",
              description: "Smart difficulty scaling, weak topic clustering, and dynamically generated micro study plans.",
              color: "from-purple-500 to-pink-400"
            },
            {
              icon: BarChart3,
              title: "Teacher Analytics",
              description: "Intelligent performance heatmaps, at-risk student detection, and actionable class-level insights.",
              color: "from-orange-500 to-amber-400"
            },
            {
              icon: FlaskConical,
              title: "Virtual Labs",
              description: "Immersive, interactive science experiments accessible from any web browser on any device.",
              color: "from-red-500 to-rose-400"
            },
            {
              icon: BriefcaseBusiness,
              title: "Career Mapping",
              description: "AI-generated 6-month roadmaps, skill gap analysis, and curated resource recommendations.",
              color: "from-indigo-500 to-blue-400"
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative p-8 rounded-3xl border border-border/50 bg-background/40 backdrop-blur-xl hover:bg-background/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                  <Icon className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* User Roles Section with Glassmorphism */}
      <section className="w-full max-w-7xl py-24 px-4 relative z-10">
        <div className="p-8 md:p-16 rounded-[3rem] bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-transparent border border-white/10 backdrop-blur-3xl relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full filter blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full filter blur-[100px] translate-y-1/3 -translate-x-1/3" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              A Unified Ecosystem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-background/50 backdrop-blur-md border border-border/50 hover:bg-background/80 transition-all hover:-translate-y-1">
                <div className="p-5 rounded-full bg-blue-500/20 text-blue-500 mb-6 drop-shadow-md">
                  <GraduationCap className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-2xl mb-4">Students</h3>
                <p className="text-muted-foreground text-lg">
                  Experience adaptive quizzes, deep AI explanations, immersive virtual labs, and hyper-personalized study journeys.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-background/50 backdrop-blur-md border border-border/50 hover:bg-background/80 transition-all hover:-translate-y-1">
                <div className="p-5 rounded-full bg-green-500/20 text-green-500 mb-6 drop-shadow-md">
                  <BarChart3 className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-2xl mb-4">Teachers</h3>
                <p className="text-muted-foreground text-lg">
                  Access rich class analytics, drop-out risk detection, weak topic tracking, and instant AI-assisted quiz generation.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-background/50 backdrop-blur-md border border-border/50 hover:bg-background/80 transition-all hover:-translate-y-1">
                <div className="p-5 rounded-full bg-purple-500/20 text-purple-500 mb-6 drop-shadow-md">
                  <Sparkles className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-2xl mb-4">Administrators</h3>
                <p className="text-muted-foreground text-lg">
                  Oversee entire institutions with advanced user management, global system metrics, and scalable platform controls.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border/50 py-12 text-center text-muted-foreground relative z-10 bg-background/50 backdrop-blur-lg mt-auto">
        <p className="text-lg font-medium">&copy; {new Date().getFullYear()} EduBridge AI. Designed for the Future of Education.</p>
      </footer>
    </div>
  );
}
