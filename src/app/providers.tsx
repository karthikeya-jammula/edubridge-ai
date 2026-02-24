// ============================================
// EduBridge AI – Client Providers
// ============================================

"use client";

import { AuthProvider } from "@/context/auth-context";
import { AccessibilityProvider } from "@/context/accessibility-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AccessibilityProvider>{children}</AccessibilityProvider>
    </AuthProvider>
  );
}
