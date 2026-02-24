// ============================================
// EduBridge AI – AI Cache Service
// ============================================

import crypto from "crypto";
import prisma from "@/lib/prisma";

export function generateCacheKey(prompt: string, params: Record<string, unknown>): string {
  const raw = JSON.stringify({ prompt, params });
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function getCachedResponse(cacheKey: string): Promise<string | null> {
  const cached = await prisma.aiCache.findUnique({
    where: { cacheKey },
  });

  if (!cached) return null;
  if (cached.expiresAt < new Date()) {
    // Expired – clean up
    await prisma.aiCache.delete({ where: { cacheKey } }).catch(() => {});
    return null;
  }

  return cached.response;
}

export async function setCachedResponse(
  cacheKey: string,
  response: string,
  model: string,
  ttlHours = 24
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  await prisma.aiCache.upsert({
    where: { cacheKey },
    update: { response, expiresAt },
    create: { cacheKey, response, model, expiresAt },
  });
}
