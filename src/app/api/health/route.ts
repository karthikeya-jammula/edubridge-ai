import { NextResponse } from "next/server";

export async function GET() {
  const hasTursoUrl = !!process.env.TURSO_DATABASE_URL;
  const hasTursoToken = !!process.env.TURSO_AUTH_TOKEN;
  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasJwtSecret = !!process.env.JWT_SECRET;
  const tursoUrlPrefix = process.env.TURSO_DATABASE_URL?.substring(0, 30) || "not set";

  // Try connecting to database
  let dbStatus = "not tested";
  let dbError = "";
  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.user.count();
    dbStatus = `connected (${count} users)`;
  } catch (e: unknown) {
    dbStatus = "error";
    dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    env: {
      TURSO_DATABASE_URL: hasTursoUrl,
      TURSO_AUTH_TOKEN: hasTursoToken,
      DATABASE_URL: hasDbUrl,
      JWT_SECRET: hasJwtSecret,
      tursoUrlPrefix,
      NODE_ENV: process.env.NODE_ENV,
    },
    database: {
      status: dbStatus,
      error: dbError || undefined,
    },
  });
}
