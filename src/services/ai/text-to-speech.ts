// ============================================
// EduBridge AI – Text-to-Speech Service
// ============================================

import { TtsInput } from "@/lib/validations";

// Using browser-compatible Web Speech API approach
// For production, integrate Google Cloud TTS or AWS Polly

export interface TtsResult {
  audioContent: string; // base64 encoded audio
  contentType: string;
}

export async function textToSpeech(input: TtsInput): Promise<TtsResult> {
  // Production implementation would use Google Cloud TTS:
  // const client = new textToSpeech.TextToSpeechClient();
  // For now, we return a structured response that the frontend
  // can use with the Web Speech API

  // If GOOGLE_APPLICATION_CREDENTIALS is set, use Google Cloud TTS
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_PROJECT_ID) {
    return await googleCloudTts(input);
  }

  // Fallback: return text for client-side Web Speech API
  return {
    audioContent: Buffer.from(
      JSON.stringify({
        text: input.text,
        language: input.language,
        speed: input.speed,
        useWebSpeechAPI: true,
      })
    ).toString("base64"),
    contentType: "application/json",
  };
}

async function googleCloudTts(input: TtsInput): Promise<TtsResult> {
  // Google Cloud TTS integration
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize`;
  
  const languageCodeMap: Record<string, string> = {
    en: "en-US",
    hi: "hi-IN",
    te: "te-IN",
    ta: "ta-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
  };

  const body = {
    input: { text: input.text },
    voice: {
      languageCode: languageCodeMap[input.language || "en"] || "en-US",
      ssmlGender: "NEUTRAL",
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: input.speed || 1.0,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN || ""}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Google TTS API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    audioContent: data.audioContent,
    contentType: "audio/mp3",
  };
}

export default textToSpeech;
