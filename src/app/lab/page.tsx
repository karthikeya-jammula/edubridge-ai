// ============================================
// EduBridge AI – Virtual Lab Page
// ============================================

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  Beaker,
  Atom,
  Zap,
  Loader2,
} from "lucide-react";

interface Experiment {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  icon: "beaker" | "atom" | "zap";
  steps: string[];
  variables: { name: string; min: number; max: number; default: number; unit: string }[];
}

const EXPERIMENTS: Experiment[] = [
  {
    id: "pendulum",
    title: "Simple Pendulum",
    description: "Explore how length and gravity affect the period of a pendulum.",
    category: "Physics",
    difficulty: "BEGINNER",
    icon: "atom",
    steps: [
      "Set the pendulum length using the slider",
      "Click 'Start Experiment' to begin",
      "Observe the period and frequency",
      "Try different lengths and note the relationship",
    ],
    variables: [
      { name: "Length", min: 10, max: 200, default: 100, unit: "cm" },
      { name: "Gravity", min: 1, max: 20, default: 9.8, unit: "m/s²" },
    ],
  },
  {
    id: "ohms-law",
    title: "Ohm's Law Circuit",
    description: "Verify Ohm's Law by varying voltage and resistance in a circuit.",
    category: "Physics",
    difficulty: "INTERMEDIATE",
    icon: "zap",
    steps: [
      "Adjust voltage using the slider",
      "Set the resistance value",
      "Observe the current reading",
      "Verify V = IR relationship",
    ],
    variables: [
      { name: "Voltage", min: 1, max: 24, default: 12, unit: "V" },
      { name: "Resistance", min: 1, max: 100, default: 10, unit: "Ω" },
    ],
  },
  {
    id: "acid-base",
    title: "Acid-Base Titration",
    description: "Perform a virtual titration to find the endpoint and equivalence point.",
    category: "Chemistry",
    difficulty: "INTERMEDIATE",
    icon: "beaker",
    steps: [
      "Select the acid concentration",
      "Slowly add base using the slider",
      "Watch the pH indicator change color",
      "Identify the equivalence point",
    ],
    variables: [
      { name: "Acid Concentration", min: 0.01, max: 1.0, default: 0.1, unit: "M" },
      { name: "Base Added", min: 0, max: 50, default: 0, unit: "mL" },
    ],
  },
];

const iconMap = {
  beaker: Beaker,
  atom: Atom,
  zap: Zap,
};

export default function LabPage() {
  const { apiFetch } = useApi();
  const [activeExperiment, setActiveExperiment] = useState<Experiment | null>(null);
  const [variables, setVariables] = useState<Record<string, number>>({});
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (activeExperiment) {
      const defaults: Record<string, number> = {};
      activeExperiment.variables.forEach((v) => {
        defaults[v.name] = v.default;
      });
      setVariables(defaults);
    }
  }, [activeExperiment]);

  useEffect(() => {
    if (!running || !canvasRef.current || !activeExperiment) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (activeExperiment.id === "pendulum") {
        const length = variables["Length"] || 100;
        const gravity = variables["Gravity"] || 9.8;
        const period = 2 * Math.PI * Math.sqrt(length / 100 / gravity);
        const angle = 0.5 * Math.sin((2 * Math.PI * time) / period);

        const pivotX = canvas.width / 2;
        const pivotY = 50;
        const bobX = pivotX + (length * 1.5) * Math.sin(angle);
        const bobY = pivotY + (length * 1.5) * Math.cos(angle);

        // String
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pivot
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#64748b";
        ctx.fill();

        // Bob
        ctx.beginPath();
        ctx.arc(bobX, bobY, 15, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();

        // Display
        ctx.fillStyle = "#f8fafc";
        ctx.font = "14px sans-serif";
        ctx.fillText(`Period: ${period.toFixed(3)}s`, 20, 30);
        ctx.fillText(`Frequency: ${(1 / period).toFixed(3)} Hz`, 20, 50);

        setResults({ Period: parseFloat(period.toFixed(3)), Frequency: parseFloat((1 / period).toFixed(3)) });
      } else if (activeExperiment.id === "ohms-law") {
        const voltage = variables["Voltage"] || 12;
        const resistance = variables["Resistance"] || 10;
        const current = voltage / resistance;

        // Draw circuit
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(60, 60, canvas.width - 120, canvas.height - 120);
        ctx.stroke();

        // Battery
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(canvas.width / 2 - 20, 45, 40, 30);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "12px sans-serif";
        ctx.fillText(`${voltage}V`, canvas.width / 2 - 10, 65);

        // Resistor
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(canvas.width / 2 - 20, canvas.height - 75, 40, 30);
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(`${resistance}Ω`, canvas.width / 2 - 10, canvas.height - 55);

        // Current indicator (animated dots)
        const dotPos = (time * 100) % (2 * (canvas.width - 120) + 2 * (canvas.height - 120));
        ctx.beginPath();
        ctx.arc(60 + (dotPos % (canvas.width - 120)), 60, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24";
        ctx.fill();

        ctx.fillStyle = "#f8fafc";
        ctx.font = "16px sans-serif";
        ctx.fillText(`Current: ${current.toFixed(3)} A`, 20, 30);
        ctx.fillText(`Power: ${(voltage * current).toFixed(2)} W`, 20, 50);

        setResults({ Current: parseFloat(current.toFixed(3)), Power: parseFloat((voltage * current).toFixed(2)) });
      } else if (activeExperiment.id === "acid-base") {
        const concentration = variables["Acid Concentration"] || 0.1;
        const baseAdded = variables["Base Added"] || 0;
        
        // Simple pH calculation
        const equivalencePoint = 25 * concentration * 10;
        const pH = baseAdded < equivalencePoint
          ? 1 + (6 * baseAdded) / equivalencePoint
          : 7 + Math.min(6, (baseAdded - equivalencePoint) * 0.5);

        // Flask
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 60, 80);
        ctx.lineTo(canvas.width / 2 - 40, canvas.height - 60);
        ctx.lineTo(canvas.width / 2 + 40, canvas.height - 60);
        ctx.lineTo(canvas.width / 2 + 60, 80);
        ctx.closePath();
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Liquid
        const liquidHeight = 100 + baseAdded * 2;
        const liquidY = canvas.height - 60 - Math.min(liquidHeight, canvas.height - 140);
        const hue = pH < 7 ? 0 : pH > 7 ? 240 : 120; // red -> green -> blue
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.7)`;
        ctx.fillRect(canvas.width / 2 - 38, liquidY, 76, canvas.height - 60 - liquidY);

        ctx.fillStyle = "#f8fafc";
        ctx.font = "16px sans-serif";
        ctx.fillText(`pH: ${pH.toFixed(2)}`, 20, 30);
        ctx.fillText(`Indicator: ${pH < 4 ? "Red (Acidic)" : pH < 7 ? "Orange" : pH < 8 ? "Green (Neutral)" : "Blue (Basic)"}`, 20, 50);

        setResults({ pH: parseFloat(pH.toFixed(2)) });
      }

      time += 0.016;
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [running, variables, activeExperiment]);

  const saveSession = async () => {
    if (!activeExperiment) return;
    setSaving(true);
    await apiFetch("/api/student/lab", {
      method: "POST",
      body: JSON.stringify({
        experimentTitle: activeExperiment.title,
        experimentData: { variables, results },
      }),
    });
    setSaving(false);
  };

  if (activeExperiment) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{activeExperiment.title}</h1>
            <p className="text-muted-foreground">{activeExperiment.description}</p>
          </div>
          <Button variant="outline" onClick={() => { setActiveExperiment(null); setRunning(false); }}>
            Back to Labs
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas */}
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={350}
                className="w-full rounded-lg bg-slate-900"
                aria-label={`${activeExperiment.title} simulation`}
              />
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => setRunning(!running)}
                  className="gap-2"
                >
                  {running ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {running ? "Reset" : "Start Experiment"}
                </Button>
                <Button
                  variant="outline"
                  onClick={saveSession}
                  disabled={saving || Object.keys(results).length === 0}
                  className="gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Save Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Variables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeExperiment.variables.map((v) => (
                  <div key={v.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{v.name}</span>
                      <span className="text-muted-foreground">
                        {variables[v.name]?.toFixed(v.min < 1 ? 2 : 0)} {v.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={v.min}
                      max={v.max}
                      step={v.min < 1 ? 0.01 : 1}
                      value={variables[v.name] || v.default}
                      onChange={(e) =>
                        setVariables((prev) => ({ ...prev, [v.name]: parseFloat(e.target.value) }))
                      }
                      className="w-full"
                      aria-label={`${v.name} slider`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {Object.keys(results).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(results).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="font-medium">{key}</span>
                      <Badge variant="secondary">{val}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {activeExperiment.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="font-bold text-primary">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Experiments list
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FlaskConical className="h-8 w-8 text-primary" />
          Virtual Lab
        </h1>
        <p className="text-muted-foreground mt-1">
          Interactive science experiments you can run from anywhere
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPERIMENTS.map((exp) => {
          const Icon = iconMap[exp.icon];
          return (
            <Card key={exp.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveExperiment(exp)}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{exp.title}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{exp.category}</Badge>
                      <Badge variant="outline">{exp.difficulty}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{exp.description}</p>
                <Button className="w-full mt-4 gap-2" variant="outline">
                  <Play className="h-4 w-4" /> Launch Experiment
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
