// ============================================
// EduBridge AI – Virtual Lab Page (Enhanced HD Graphics)
// ============================================

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  Play,
  RotateCcw,
  CheckCircle2,
  Beaker,
  Atom,
  Zap,
  Loader2,
  Waves,
  Circle,
  ArrowDown,
  Magnet,
  Trash2,
} from "lucide-react";

interface Experiment {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  icon: "beaker" | "atom" | "zap" | "waves" | "circle" | "arrow" | "magnet";
  steps: string[];
  variables: { name: string; min: number; max: number; default: number; unit: string; step?: number }[];
}

interface SavedResult {
  id: number;
  timestamp: Date;
  variables: Record<string, number>;
  results: Record<string, number>;
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
      { name: "Gravity", min: 1, max: 20, default: 9.8, unit: "m/s²", step: 0.1 },
    ],
  },
  {
    id: "projectile",
    title: "Projectile Motion",
    description: "Observe the parabolic trajectory of a projectile under gravity.",
    category: "Physics",
    difficulty: "BEGINNER",
    icon: "arrow",
    steps: [
      "Set the initial velocity",
      "Adjust the launch angle",
      "Click 'Start Experiment' to launch",
      "Observe range, max height, and flight time",
    ],
    variables: [
      { name: "Initial Velocity", min: 10, max: 100, default: 50, unit: "m/s" },
      { name: "Angle", min: 5, max: 85, default: 45, unit: "°" },
    ],
  },
  {
    id: "wave",
    title: "Wave Interference",
    description: "Visualize constructive and destructive wave interference patterns.",
    category: "Physics",
    difficulty: "INTERMEDIATE",
    icon: "waves",
    steps: [
      "Set the wave frequency",
      "Adjust the amplitude",
      "Observe interference patterns",
      "Note how frequency affects the pattern",
    ],
    variables: [
      { name: "Frequency", min: 0.5, max: 5, default: 2, unit: "Hz", step: 0.1 },
      { name: "Amplitude", min: 10, max: 100, default: 50, unit: "px" },
      { name: "Phase Diff", min: 0, max: 360, default: 0, unit: "°" },
    ],
  },
  {
    id: "spring-mass",
    title: "Spring-Mass Oscillation",
    description: "Study simple harmonic motion with spring constant and mass.",
    category: "Physics",
    difficulty: "INTERMEDIATE",
    icon: "circle",
    steps: [
      "Set the spring constant (k)",
      "Adjust the mass attached",
      "Start to observe oscillation",
      "Note the relationship T = 2π√(m/k)",
    ],
    variables: [
      { name: "Spring Constant", min: 1, max: 50, default: 20, unit: "N/m" },
      { name: "Mass", min: 0.1, max: 5, default: 1, unit: "kg", step: 0.1 },
    ],
  },
  {
    id: "free-fall",
    title: "Free Fall Motion",
    description: "Drop objects and verify equations of motion under gravity.",
    category: "Physics",
    difficulty: "BEGINNER",
    icon: "arrow",
    steps: [
      "Set the initial height",
      "Adjust gravity value",
      "Drop the object",
      "Observe velocity and time of fall",
    ],
    variables: [
      { name: "Height", min: 10, max: 500, default: 100, unit: "m" },
      { name: "Gravity", min: 1, max: 20, default: 9.8, unit: "m/s²", step: 0.1 },
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
    id: "electric-field",
    title: "Electric Field Lines",
    description: "Visualize electric field lines between point charges.",
    category: "Physics",
    difficulty: "ADVANCED",
    icon: "magnet",
    steps: [
      "Set the positive charge magnitude",
      "Set the negative charge magnitude",
      "Observe field line patterns",
      "Note density indicates field strength",
    ],
    variables: [
      { name: "Positive Charge", min: 1, max: 10, default: 5, unit: "μC" },
      { name: "Negative Charge", min: 1, max: 10, default: 5, unit: "μC" },
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
      { name: "Acid Concentration", min: 0.01, max: 1.0, default: 0.1, unit: "M", step: 0.01 },
      { name: "Base Added", min: 0, max: 50, default: 0, unit: "mL" },
    ],
  },
];

const iconMap = {
  beaker: Beaker,
  atom: Atom,
  zap: Zap,
  waves: Waves,
  circle: Circle,
  arrow: ArrowDown,
  magnet: Magnet,
};

export default function LabPage() {
  const { apiFetch } = useApi();
  const [activeExperiment, setActiveExperiment] = useState<Experiment | null>(null);
  const [variables, setVariables] = useState<Record<string, number>>({});
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (activeExperiment) {
      const defaults: Record<string, number> = {};
      activeExperiment.variables.forEach((v) => {
        defaults[v.name] = v.default;
      });
      setVariables(defaults);
      setSavedResults([]);
      setResults({});
    }
  }, [activeExperiment]);

  // High-quality graphics rendering
  useEffect(() => {
    if (!running || !canvasRef.current || !activeExperiment) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    let animationId: number;
    let time = 0;
    let projectileTime = 0;
    let freeFallTime = 0;

    const drawGradientBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(1, "#1e293b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawGrid = (opacity: number = 0.1) => {
      ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const animate = () => {
      drawGradientBackground();
      drawGrid();

      if (activeExperiment.id === "pendulum") {
        const length = variables["Length"] || 100;
        const gravity = variables["Gravity"] || 9.8;
        const period = 2 * Math.PI * Math.sqrt(length / 100 / gravity);
        const angle = 0.5 * Math.sin((2 * Math.PI * time) / period);

        const pivotX = canvas.width / 2;
        const pivotY = 80;
        const bobX = pivotX + (length * 1.8) * Math.sin(angle);
        const bobY = pivotY + (length * 1.8) * Math.cos(angle);

        // Draw mount/ceiling
        ctx.fillStyle = "#475569";
        ctx.fillRect(pivotX - 80, 40, 160, 20);
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 12, 0, Math.PI * 2);
        ctx.fill();

        // String with shadow
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Bob with gradient and glow
        const bobGradient = ctx.createRadialGradient(bobX - 8, bobY - 8, 0, bobX, bobY, 25);
        bobGradient.addColorStop(0, "#60a5fa");
        bobGradient.addColorStop(0.7, "#3b82f6");
        bobGradient.addColorStop(1, "#1d4ed8");
        ctx.beginPath();
        ctx.arc(bobX, bobY, 22, 0, Math.PI * 2);
        ctx.fillStyle = bobGradient;
        ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Highlight on bob
        ctx.beginPath();
        ctx.arc(bobX - 6, bobY - 6, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fill();

        // Info panel
        ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
        ctx.fillRect(15, 15, 200, 65);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1;
        ctx.strokeRect(15, 15, 200, 65);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 16px Inter, system-ui, sans-serif";
        ctx.fillText(`Period: ${period.toFixed(3)}s`, 25, 40);
        ctx.fillText(`Frequency: ${(1 / period).toFixed(3)} Hz`, 25, 65);

        setResults({ Period: parseFloat(period.toFixed(3)), Frequency: parseFloat((1 / period).toFixed(3)) });

      } else if (activeExperiment.id === "projectile") {
        const v0 = variables["Initial Velocity"] || 50;
        const angleDeg = variables["Angle"] || 45;
        const angleRad = (angleDeg * Math.PI) / 180;
        const g = 9.8;

        const vx = v0 * Math.cos(angleRad);
        const vy = v0 * Math.sin(angleRad);
        const tFlight = (2 * vy) / g;
        const range = vx * tFlight;
        const maxHeight = (vy * vy) / (2 * g);

        const scale = Math.min(canvas.width * 0.8 / range, (canvas.height - 100) / maxHeight, 3);
        const groundY = canvas.height - 60;
        const startX = 60;

        // Ground
        ctx.fillStyle = "#4ade80";
        ctx.fillRect(0, groundY, canvas.width, 60);

        // Draw trajectory path
        ctx.beginPath();
        ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        for (let t = 0; t <= tFlight; t += 0.05) {
          const px = startX + vx * t * scale;
          const py = groundY - (vy * t - 0.5 * g * t * t) * scale;
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Current position
        const t = projectileTime % (tFlight + 1);
        if (t <= tFlight) {
          const px = startX + vx * t * scale;
          const py = groundY - (vy * t - 0.5 * g * t * t) * scale;

          // Ball with glow
          const ballGrad = ctx.createRadialGradient(px - 4, py - 4, 0, px, py, 15);
          ballGrad.addColorStop(0, "#fbbf24");
          ballGrad.addColorStop(1, "#d97706");
          ctx.beginPath();
          ctx.arc(px, py, 12, 0, Math.PI * 2);
          ctx.fillStyle = ballGrad;
          ctx.shadowColor = "rgba(251, 191, 36, 0.6)";
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        projectileTime += 0.03;

        // Info panel
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(15, 15, 220, 90);
        ctx.strokeStyle = "#fbbf24";
        ctx.strokeRect(15, 15, 220, 90);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 15px Inter, system-ui, sans-serif";
        ctx.fillText(`Range: ${range.toFixed(1)} m`, 25, 40);
        ctx.fillText(`Max Height: ${maxHeight.toFixed(1)} m`, 25, 62);
        ctx.fillText(`Flight Time: ${tFlight.toFixed(2)} s`, 25, 84);

        setResults({
          Range: parseFloat(range.toFixed(1)),
          "Max Height": parseFloat(maxHeight.toFixed(1)),
          "Flight Time": parseFloat(tFlight.toFixed(2)),
        });

      } else if (activeExperiment.id === "wave") {
        const freq = variables["Frequency"] || 2;
        const amp = variables["Amplitude"] || 50;
        const phaseDiff = ((variables["Phase Diff"] || 0) * Math.PI) / 180;

        const centerY = canvas.height / 2;

        // Wave 1
        ctx.beginPath();
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 3;
        for (let x = 0; x < canvas.width; x++) {
          const y = centerY - 60 + amp * Math.sin(freq * (x / 50) - time * 5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Wave 2
        ctx.beginPath();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        for (let x = 0; x < canvas.width; x++) {
          const y = centerY + 60 + amp * Math.sin(freq * (x / 50) - time * 5 + phaseDiff);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Resultant wave
        ctx.beginPath();
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 4;
        ctx.shadowColor = "rgba(168, 85, 247, 0.5)";
        ctx.shadowBlur = 10;
        for (let x = 0; x < canvas.width; x++) {
          const y1 = amp * Math.sin(freq * (x / 50) - time * 5);
          const y2 = amp * Math.sin(freq * (x / 50) - time * 5 + phaseDiff);
          const y = centerY + (y1 + y2) / 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Labels
        ctx.font = "14px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#3b82f6";
        ctx.fillText("Wave 1", 20, centerY - 60 - amp - 10);
        ctx.fillStyle = "#ef4444";
        ctx.fillText("Wave 2", 20, centerY + 60 + amp + 20);
        ctx.fillStyle = "#a855f7";
        ctx.fillText("Resultant", canvas.width - 80, centerY + 10);

        const interference =
          phaseDiff < 0.5 || phaseDiff > 5.78
            ? "Constructive"
            : Math.abs(phaseDiff - Math.PI) < 0.5
              ? "Destructive"
              : "Partial";

        setResults({
          Wavelength: parseFloat((50 / freq).toFixed(1)),
          Interference: interference === "Constructive" ? 2 : interference === "Destructive" ? 0 : 1,
        });

      } else if (activeExperiment.id === "spring-mass") {
        const k = variables["Spring Constant"] || 20;
        const m = variables["Mass"] || 1;
        const omega = Math.sqrt(k / m);
        const period = (2 * Math.PI) / omega;
        const amplitude = 80;
        const y = amplitude * Math.cos(omega * time);

        const anchorX = canvas.width / 2;
        const anchorY = 40;
        const massY = 180 + y;

        // Ceiling
        ctx.fillStyle = "#475569";
        ctx.fillRect(anchorX - 60, 20, 120, 25);

        // Spring visualization (zigzag)
        ctx.beginPath();
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 3;
        ctx.moveTo(anchorX, anchorY + 5);
        const coils = 12;
        const coilWidth = 20;
        const springHeight = massY - anchorY - 30;
        for (let i = 0; i <= coils; i++) {
          const cy = anchorY + 5 + (i * springHeight) / coils;
          const cx = anchorX + (i % 2 === 0 ? -coilWidth : coilWidth);
          ctx.lineTo(cx, cy);
        }
        ctx.lineTo(anchorX, massY - 25);
        ctx.stroke();

        // Mass block with gradient
        const massGrad = ctx.createLinearGradient(anchorX - 35, massY - 25, anchorX + 35, massY + 25);
        massGrad.addColorStop(0, "#22c55e");
        massGrad.addColorStop(1, "#15803d");
        ctx.fillStyle = massGrad;
        ctx.shadowColor = "rgba(34, 197, 94, 0.4)";
        ctx.shadowBlur = 15;
        ctx.fillRect(anchorX - 35, massY - 25, 70, 50);
        ctx.shadowBlur = 0;

        // Mass label
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Inter, system-ui, sans-serif";
        ctx.fillText(`${m} kg`, anchorX - 18, massY + 5);

        // Info panel
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(15, 15, 200, 65);
        ctx.strokeStyle = "#22c55e";
        ctx.strokeRect(15, 15, 200, 65);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 15px Inter, system-ui, sans-serif";
        ctx.fillText(`Period: ${period.toFixed(3)} s`, 25, 40);
        ctx.fillText(`ω: ${omega.toFixed(2)} rad/s`, 25, 65);

        setResults({
          Period: parseFloat(period.toFixed(3)),
          "Angular Freq": parseFloat(omega.toFixed(2)),
        });

      } else if (activeExperiment.id === "free-fall") {
        const h = variables["Height"] || 100;
        const g = variables["Gravity"] || 9.8;
        const tTotal = Math.sqrt((2 * h) / g);

        const scale = Math.min((canvas.height - 100) / h, 2);
        const groundY = canvas.height - 40;
        const t = Math.min(freeFallTime % (tTotal + 1), tTotal);
        const fallen = 0.5 * g * t * t;
        const velocity = g * t;
        const ballY = 60 + fallen * scale;

        // Height ruler
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(60, 60);
        ctx.lineTo(60, groundY);
        ctx.stroke();
        for (let i = 0; i <= h; i += h / 10) {
          const ry = 60 + i * scale;
          ctx.beginPath();
          ctx.moveTo(50, ry);
          ctx.lineTo(70, ry);
          ctx.stroke();
          ctx.fillStyle = "#94a3b8";
          ctx.font = "12px Inter, system-ui, sans-serif";
          ctx.fillText(`${(h - i).toFixed(0)}m`, 15, ry + 4);
        }

        // Ground
        ctx.fillStyle = "#4ade80";
        ctx.fillRect(0, groundY, canvas.width, 40);

        // Ball
        const ballX = canvas.width / 2;
        const actualBallY = Math.min(ballY, groundY - 18);
        const ballGrad = ctx.createRadialGradient(ballX - 5, actualBallY - 5, 0, ballX, actualBallY, 18);
        ballGrad.addColorStop(0, "#f472b6");
        ballGrad.addColorStop(1, "#db2777");
        ctx.beginPath();
        ctx.arc(ballX, actualBallY, 18, 0, Math.PI * 2);
        ctx.fillStyle = ballGrad;
        ctx.shadowColor = "rgba(244, 114, 182, 0.5)";
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        freeFallTime += 0.02;

        // Info panel
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(canvas.width - 225, 15, 210, 90);
        ctx.strokeStyle = "#f472b6";
        ctx.strokeRect(canvas.width - 225, 15, 210, 90);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 15px Inter, system-ui, sans-serif";
        ctx.fillText(`Time to fall: ${tTotal.toFixed(2)} s`, canvas.width - 215, 40);
        ctx.fillText(`Final velocity: ${(g * tTotal).toFixed(1)} m/s`, canvas.width - 215, 62);
        ctx.fillText(`Current v: ${velocity.toFixed(1)} m/s`, canvas.width - 215, 84);

        setResults({
          "Fall Time": parseFloat(tTotal.toFixed(2)),
          "Final Velocity": parseFloat((g * tTotal).toFixed(1)),
        });

      } else if (activeExperiment.id === "ohms-law") {
        const voltage = variables["Voltage"] || 12;
        const resistance = variables["Resistance"] || 10;
        const current = voltage / resistance;
        const power = voltage * current;

        // Draw circuit wires with glow
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 4;
        ctx.shadowColor = "rgba(59, 130, 246, 0.4)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(60, 60, canvas.width - 120, canvas.height - 120, 15);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Battery
        const batteryGrad = ctx.createLinearGradient(canvas.width / 2 - 30, 40, canvas.width / 2 + 30, 75);
        batteryGrad.addColorStop(0, "#22c55e");
        batteryGrad.addColorStop(1, "#15803d");
        ctx.fillStyle = batteryGrad;
        ctx.fillRect(canvas.width / 2 - 30, 40, 60, 35);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Inter, system-ui, sans-serif";
        ctx.fillText(`${voltage}V`, canvas.width / 2 - 12, 63);

        // Plus/Minus symbols
        ctx.fillStyle = "#ef4444";
        ctx.fillText("+", canvas.width / 2 + 40, 60);
        ctx.fillStyle = "#3b82f6";
        ctx.fillText("−", canvas.width / 2 - 50, 60);

        // Resistor with zigzag
        ctx.beginPath();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 4;
        const resX = canvas.width / 2 - 40;
        const resY = canvas.height - 70;
        ctx.moveTo(resX, resY);
        for (let i = 0; i < 8; i++) {
          ctx.lineTo(resX + 10 + i * 10, resY + (i % 2 === 0 ? -10 : 10));
        }
        ctx.lineTo(resX + 80, resY);
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.fillText(`${resistance}Ω`, canvas.width / 2 - 15, canvas.height - 45);

        // Animated current dots
        const pathLength = 2 * (canvas.width - 120) + 2 * (canvas.height - 120);
        for (let i = 0; i < 8; i++) {
          const dotPos = ((time * 150 * (current / 2)) + i * (pathLength / 8)) % pathLength;
          let dx, dy;
          if (dotPos < canvas.width - 120) {
            dx = 60 + dotPos;
            dy = 60;
          } else if (dotPos < canvas.width - 120 + canvas.height - 120) {
            dx = canvas.width - 60;
            dy = 60 + (dotPos - (canvas.width - 120));
          } else if (dotPos < 2 * (canvas.width - 120) + canvas.height - 120) {
            dx = canvas.width - 60 - (dotPos - (canvas.width - 120) - (canvas.height - 120));
            dy = canvas.height - 60;
          } else {
            dx = 60;
            dy = canvas.height - 60 - (dotPos - 2 * (canvas.width - 120) - (canvas.height - 120));
          }
          ctx.beginPath();
          ctx.arc(dx, dy, 6, 0, Math.PI * 2);
          ctx.fillStyle = "#fbbf24";
          ctx.shadowColor = "rgba(251, 191, 36, 0.8)";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Info panel
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(15, 15, 200, 70);
        ctx.strokeStyle = "#fbbf24";
        ctx.strokeRect(15, 15, 200, 70);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 15px Inter, system-ui, sans-serif";
        ctx.fillText(`Current: ${current.toFixed(3)} A`, 25, 40);
        ctx.fillText(`Power: ${power.toFixed(2)} W`, 25, 65);

        setResults({ Current: parseFloat(current.toFixed(3)), Power: parseFloat(power.toFixed(2)) });

      } else if (activeExperiment.id === "electric-field") {
        const posCharge = variables["Positive Charge"] || 5;
        const negCharge = variables["Negative Charge"] || 5;

        const posX = canvas.width / 3;
        const negX = (2 * canvas.width) / 3;
        const centerY = canvas.height / 2;

        // Draw field lines
        const numLines = 12;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < numLines; i++) {
          const angle = (i / numLines) * 2 * Math.PI;
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${(i * 30) % 360}, 70%, 60%, 0.6)`;

          let x = posX + 30 * Math.cos(angle);
          let y = centerY + 30 * Math.sin(angle);
          ctx.moveTo(x, y);

          for (let step = 0; step < 100; step++) {
            const dx1 = x - posX;
            const dy1 = y - centerY;
            const r1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            const dx2 = x - negX;
            const dy2 = y - centerY;
            const r2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

            if (r1 < 25 || r2 < 25 || x < 0 || x > canvas.width || y < 0 || y > canvas.height) break;

            const Ex = (posCharge * dx1) / (r1 * r1 * r1) - (negCharge * dx2) / (r2 * r2 * r2);
            const Ey = (posCharge * dy1) / (r1 * r1 * r1) - (negCharge * dy2) / (r2 * r2 * r2);
            const E = Math.sqrt(Ex * Ex + Ey * Ey);

            x += (Ex / E) * 5;
            y += (Ey / E) * 5;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Positive charge
        const posGrad = ctx.createRadialGradient(posX - 5, centerY - 5, 0, posX, centerY, 25);
        posGrad.addColorStop(0, "#f87171");
        posGrad.addColorStop(1, "#dc2626");
        ctx.beginPath();
        ctx.arc(posX, centerY, 25, 0, Math.PI * 2);
        ctx.fillStyle = posGrad;
        ctx.shadowColor = "rgba(220, 38, 38, 0.6)";
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px Inter, system-ui, sans-serif";
        ctx.fillText("+", posX - 7, centerY + 7);

        // Negative charge
        const negGrad = ctx.createRadialGradient(negX - 5, centerY - 5, 0, negX, centerY, 25);
        negGrad.addColorStop(0, "#60a5fa");
        negGrad.addColorStop(1, "#2563eb");
        ctx.beginPath();
        ctx.arc(negX, centerY, 25, 0, Math.PI * 2);
        ctx.fillStyle = negGrad;
        ctx.shadowColor = "rgba(37, 99, 235, 0.6)";
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.fillText("−", negX - 6, centerY + 7);

        // Info
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(15, 15, 180, 50);
        ctx.strokeStyle = "#a855f7";
        ctx.strokeRect(15, 15, 180, 50);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 14px Inter, system-ui, sans-serif";
        ctx.fillText(`+Q: ${posCharge} μC`, 25, 35);
        ctx.fillText(`-Q: ${negCharge} μC`, 25, 55);

        setResults({
          "Field Strength": parseFloat(((posCharge + negCharge) / 2).toFixed(1)),
        });

      } else if (activeExperiment.id === "acid-base") {
        const concentration = variables["Acid Concentration"] || 0.1;
        const baseAdded = variables["Base Added"] || 0;

        const equivalencePoint = 25 * concentration * 10;
        const pH =
          baseAdded < equivalencePoint
            ? 1 + (6 * baseAdded) / equivalencePoint
            : 7 + Math.min(6, (baseAdded - equivalencePoint) * 0.5);

        // Erlenmeyer flask shape
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 20, 60);
        ctx.lineTo(canvas.width / 2 - 20, 100);
        ctx.lineTo(canvas.width / 2 - 70, canvas.height - 60);
        ctx.lineTo(canvas.width / 2 + 70, canvas.height - 60);
        ctx.lineTo(canvas.width / 2 + 20, 100);
        ctx.lineTo(canvas.width / 2 + 20, 60);
        ctx.closePath();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.8)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Liquid with gradient based on pH
        const liquidHeight = 120 + baseAdded * 2.5;
        const liquidY = canvas.height - 60 - Math.min(liquidHeight, canvas.height - 170);
        const hue = pH < 4 ? 0 : pH < 7 ? 30 + (pH - 4) * 30 : pH < 8 ? 120 : 240;

        const liquidGrad = ctx.createLinearGradient(0, liquidY, 0, canvas.height - 60);
        liquidGrad.addColorStop(0, `hsla(${hue}, 80%, 55%, 0.8)`);
        liquidGrad.addColorStop(1, `hsla(${hue}, 80%, 40%, 0.9)`);

        // Calculate flask width at liquid level
        const ratio = (canvas.height - 60 - liquidY) / (canvas.height - 160);
        const halfWidth = 20 + ratio * 50;

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - halfWidth, liquidY);
        ctx.lineTo(canvas.width / 2 - 68, canvas.height - 62);
        ctx.lineTo(canvas.width / 2 + 68, canvas.height - 62);
        ctx.lineTo(canvas.width / 2 + halfWidth, liquidY);
        ctx.closePath();
        ctx.fillStyle = liquidGrad;
        ctx.fill();

        // Burette on the right
        ctx.fillStyle = "#475569";
        ctx.fillRect(canvas.width - 100, 40, 30, 200);
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width - 100, 40, 30, 200);

        // Drip animation
        if (time % 1 < 0.5) {
          ctx.beginPath();
          ctx.arc(canvas.width - 85, 250 + (time % 0.5) * 100, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#3b82f6";
          ctx.fill();
        }

        // Info panel
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.fillRect(15, 15, 260, 70);
        ctx.strokeStyle = `hsl(${hue}, 80%, 50%)`;
        ctx.strokeRect(15, 15, 260, 70);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 16px Inter, system-ui, sans-serif";
        ctx.fillText(`pH: ${pH.toFixed(2)}`, 25, 40);
        const indicator =
          pH < 4 ? "Red (Acidic)" : pH < 7 ? "Orange" : pH < 8 ? "Green (Neutral)" : "Blue (Basic)";
        ctx.fillText(`Indicator: ${indicator}`, 25, 65);

        setResults({ pH: parseFloat(pH.toFixed(2)) });
      }

      time += 0.016;
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [running, variables, activeExperiment]);

  // Save result to table
  const saveToTable = () => {
    if (Object.keys(results).length === 0) return;
    const newResult: SavedResult = {
      id: Date.now(),
      timestamp: new Date(),
      variables: { ...variables },
      results: { ...results },
    };
    setSavedResults((prev) => [...prev, newResult]);
  };

  const deleteResult = (id: number) => {
    setSavedResults((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAllResults = () => {
    setSavedResults([]);
  };

  if (activeExperiment) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{activeExperiment.title}</h1>
            <p className="text-muted-foreground">{activeExperiment.description}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setActiveExperiment(null);
              setRunning(false);
            }}
          >
            Back to Labs
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas - HD Quality */}
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full rounded-lg bg-slate-900"
                style={{ imageRendering: "auto" }}
                aria-label={`${activeExperiment.title} simulation`}
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={() => setRunning(!running)} className="gap-2" size="lg">
                  {running ? <RotateCcw className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {running ? "Reset" : "Start Experiment"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={saveToTable}
                  disabled={Object.keys(results).length === 0 || !running}
                  className="gap-2"
                  size="lg"
                >
                  <CheckCircle2 className="h-5 w-5" />
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
                      <span className="text-primary font-bold">
                        {variables[v.name]?.toFixed(v.step && v.step < 1 ? 2 : v.min < 1 ? 2 : 0)} {v.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={v.min}
                      max={v.max}
                      step={v.step || (v.min < 1 ? 0.01 : 1)}
                      value={variables[v.name] || v.default}
                      onChange={(e) =>
                        setVariables((prev) => ({ ...prev, [v.name]: parseFloat(e.target.value) }))
                      }
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                      aria-label={`${v.name} slider`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {Object.keys(results).length > 0 && (
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">Live Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(results).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="font-medium">{key}</span>
                      <Badge variant="secondary" className="text-base px-3">
                        {val}
                      </Badge>
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

        {/* Saved Results Table */}
        {savedResults.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Saved Results ({savedResults.length})
              </CardTitle>
              <Button variant="destructive" size="sm" onClick={clearAllResults} className="gap-1">
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-2 font-semibold">#</th>
                      <th className="text-left py-3 px-2 font-semibold">Time</th>
                      {activeExperiment.variables.map((v) => (
                        <th key={v.name} className="text-left py-3 px-2 font-semibold">
                          {v.name}
                        </th>
                      ))}
                      {Object.keys(savedResults[0]?.results || {}).map((key) => (
                        <th key={key} className="text-left py-3 px-2 font-semibold text-primary">
                          {key}
                        </th>
                      ))}
                      <th className="text-center py-3 px-2 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedResults.map((result, idx) => (
                      <tr key={result.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-2">{idx + 1}</td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {result.timestamp.toLocaleTimeString()}
                        </td>
                        {activeExperiment.variables.map((v) => (
                          <td key={v.name} className="py-3 px-2">
                            {result.variables[v.name]?.toFixed(v.min < 1 ? 2 : 0)} {v.unit}
                          </td>
                        ))}
                        {Object.entries(result.results).map(([key, val]) => (
                          <td key={key} className="py-3 px-2">
                            <Badge variant="outline" className="text-primary">
                              {val}
                            </Badge>
                          </td>
                        ))}
                        <td className="py-3 px-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteResult(result.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Experiments list
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FlaskConical className="h-8 w-8 text-primary" />
          Virtual Lab
        </h1>
        <p className="text-muted-foreground mt-1">
          Interactive science experiments with HD graphics you can run from anywhere
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {EXPERIMENTS.map((exp) => {
          const Icon = iconMap[exp.icon];
          return (
            <Card
              key={exp.id}
              className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => setActiveExperiment(exp)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">{exp.title}</CardTitle>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                    {exp.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                    {exp.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{exp.description}</p>
                <Button className="w-full mt-4 gap-2" variant="outline" size="sm">
                  <Play className="h-4 w-4" /> Launch
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
