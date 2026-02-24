// ============================================
// EduBridge AI – API Client Hook
// ============================================

"use client";

import { useAuth } from "@/context/auth-context";
import { useCallback } from "react";

export function useApi() {
  const { token } = useAuth();

  const apiFetch = useCallback(
    async <T = unknown>(
      url: string,
      options?: RequestInit
    ): Promise<{ success: boolean; data?: T; error?: string; message?: string }> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options?.headers as Record<string, string>),
      };

      const res = await fetch(url, {
        ...options,
        headers,
      });

      const data = await res.json();
      return data;
    },
    [token]
  );

  return { apiFetch };
}
