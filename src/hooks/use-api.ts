// ============================================
// EduBridge AI – API Client Hook
// ============================================

"use client";

import { useCallback } from "react";

export function useApi() {
  const apiFetch = useCallback(
    async <T = unknown>(
      url: string,
      options?: RequestInit
    ): Promise<{ success: boolean; data?: T; error?: string; message?: string }> => {
      // Read token directly from localStorage to avoid stale closure issues
      const token = localStorage.getItem("edubridge_token");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options?.headers as Record<string, string>),
      };

      try {
        const res = await fetch(url, {
          ...options,
          headers,
        });

        const data = await res.json();
        return data;
      } catch (err) {
        console.error("[useApi] fetch error:", url, err);
        return { success: false, error: "Network error. Please try again." };
      }
    },
    []
  );

  return { apiFetch };
}
