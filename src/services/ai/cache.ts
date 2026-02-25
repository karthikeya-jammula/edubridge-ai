// ============================================
// EduBridge AI – AI Cache Service (MVP Optimized)
// In-memory fallback for fast demos
// ============================================

import crypto from "crypto";
import prisma from "@/lib/prisma";

// In-memory cache for hackathon speed
const memoryCache = new Map<string, { response: string; expiresAt: number }>();

export function generateCacheKey(prompt: string, params: Record<string, unknown>): string {
  const raw = JSON.stringify({ prompt, params });
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function getCachedResponse(cacheKey: string): Promise<string | null> {
  // Try memory cache first (faster for demos)
  const memCached = memoryCache.get(cacheKey);
  if (memCached && memCached.expiresAt > Date.now()) {
    return memCached.response;
  }
  
  try {
    const cached = await prisma.aiCache.findUnique({
      where: { cacheKey },
    });

    if (!cached) return null;
    if (cached.expiresAt < new Date()) {
      await prisma.aiCache.delete({ where: { cacheKey } }).catch(() => {});
      return null;
    }

    // Store in memory for faster subsequent access
    memoryCache.set(cacheKey, { response: cached.response, expiresAt: cached.expiresAt.getTime() });
    return cached.response;
  } catch {
    return null;
  }
}

export async function setCachedResponse(
  cacheKey: string,
  response: string,
  model: string,
  ttlHours = 24
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  
  // Always store in memory (fast access)
  memoryCache.set(cacheKey, { response, expiresAt: expiresAt.getTime() });
  
  // Try DB cache (may fail if schema mismatch, that's okay for MVP)
  try {
    await prisma.aiCache.upsert({
      where: { cacheKey },
      update: { response, expiresAt },
      create: { cacheKey, response, model, expiresAt },
    });
  } catch {
    // DB cache failed, memory cache still works
  }
}
