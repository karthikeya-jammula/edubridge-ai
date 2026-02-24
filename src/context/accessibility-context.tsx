// ============================================
// EduBridge AI – Accessibility Context Provider
// ============================================

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AccessibilityPrefs {
  highContrast: boolean;
  dyslexiaFont: boolean;
  fontSize: number; // 1 = normal, 1.25 = large, 1.5 = extra large
  reducedMotion: boolean;
  screenReaderMode: boolean;
}

interface AccessibilityContextType {
  prefs: AccessibilityPrefs;
  setPrefs: (prefs: Partial<AccessibilityPrefs>) => void;
  resetPrefs: () => void;
  speak: (text: string, lang?: string) => void;
  stopSpeaking: () => void;
}

const defaultPrefs: AccessibilityPrefs = {
  highContrast: false,
  dyslexiaFont: false,
  fontSize: 1,
  reducedMotion: false,
  screenReaderMode: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefsState] = useState<AccessibilityPrefs>(defaultPrefs);

  useEffect(() => {
    const saved = localStorage.getItem("edubridge_a11y");
    if (saved) {
      try {
        setPrefsState({ ...defaultPrefs, ...JSON.parse(saved) });
      } catch {
        // ignore invalid JSON
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("edubridge_a11y", JSON.stringify(prefs));

    // Apply to document
    const root = document.documentElement;
    root.style.fontSize = `${prefs.fontSize * 16}px`;
    root.classList.toggle("high-contrast", prefs.highContrast);
    root.classList.toggle("dyslexia-font", prefs.dyslexiaFont);
    root.classList.toggle("reduced-motion", prefs.reducedMotion);
  }, [prefs]);

  const setPrefs = (partial: Partial<AccessibilityPrefs>) => {
    setPrefsState((prev) => ({ ...prev, ...partial }));
  };

  const resetPrefs = () => {
    setPrefsState(defaultPrefs);
  };

  const speak = (text: string, lang = "en") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  };

  return (
    <AccessibilityContext.Provider value={{ prefs, setPrefs, resetPrefs, speak, stopSpeaking }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
