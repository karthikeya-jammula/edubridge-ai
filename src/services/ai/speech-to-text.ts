// ============================================
// EduBridge AI – Speech-to-Text Service
// ============================================

import { SttInput } from "@/lib/validations";

export interface SttResult {
  text: string;
  confidence: number;
  language: string;
}

export async function speechToText(input: SttInput): Promise<SttResult> {
  // Production: Use Google Cloud Speech-to-Text or OpenAI Whisper
  if (process.env.OPENAI_API_KEY) {
    return await openaiWhisper(input);
  }

  // Fallback response for client-side Web Speech API
  return {
    text: "",
    confidence: 0,
    language: input.language || "en",
  };
}

async function openaiWhisper(input: SttInput): Promise<SttResult> {
  const audioBuffer = Buffer.from(input.audio, "base64");

  // Create a File-like object for the OpenAI API
  const blob = new Blob([audioBuffer], { type: "audio/webm" });
  const file = new File([blob], "audio.webm", { type: "audio/webm" });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-1");
  formData.append("language", input.language || "en");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Whisper API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    text: data.text,
    confidence: 0.95,
    language: input.language || "en",
  };
}

export default speechToText;
