import { NextResponse } from "next/server";

export async function GET() {
  const hasTursoUrl = !!process.env.TURSO_DATABASE_URL;
  const hasTursoToken = !!process.env.TURSO_AUTH_TOKEN;
  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasJwtSecret = !!process.env.JWT_SECRET;
  const tursoUrlPrefix = process.env.TURSO_DATABASE_URL?.substring(0, 30) || "not set";
  const dbUrlPrefix = process.env.DATABASE_URL?.substring(0, 30) || "not set";

  // Try connecting to database
  let dbStatus = "not tested";
  let dbError = "";
  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.user.count();
    dbStatus = `connected (${count} users)`;
  } catch (e: unknown) {
    dbStatus = "error";
    dbError = e instanceof Error ? e.stack || e.message : String(e);
  }

  // Try auth functions
  let authStatus = "not tested";
  let authError = "";
  try {
    const { hashPassword, signToken } = await import("@/lib/auth");
    const hash = await hashPassword("test123");
    authStatus = hash ? "hashPassword works" : "hashPassword returned empty";
    const token = signToken({ userId: "test", email: "t@t.com", role: "STUDENT", name: "T" });
    authStatus += token ? ", signToken works" : ", signToken failed";
  } catch (e: unknown) {
    authStatus = "error";
    authError = e instanceof Error ? e.stack || e.message : String(e);
  }

  // Try validation
  let validationStatus = "not tested";
  let validationError = "";
  try {
    const { registerSchema } = await import("@/lib/validations");
    const parsed = registerSchema.safeParse({
      name: "Test",
      email: "test@test.com",
      password: "Password123!",
      role: "STUDENT",
    });
    validationStatus = parsed.success ? "valid" : `invalid: ${parsed.error.issues[0].message}`;
  } catch (e: unknown) {
    validationStatus = "error";
    validationError = e instanceof Error ? e.stack || e.message : String(e);
  }

  return NextResponse.json({
    env: {
      TURSO_DATABASE_URL: hasTursoUrl,
      TURSO_AUTH_TOKEN: hasTursoToken,
      DATABASE_URL: hasDbUrl,
      JWT_SECRET: hasJwtSecret,
      tursoUrlPrefix,
      dbUrlPrefix,
      NODE_ENV: process.env.NODE_ENV,
    },
    database: { status: dbStatus, error: dbError || undefined },
    auth: { status: authStatus, error: authError || undefined },
    validation: { status: validationStatus, error: validationError || undefined },
  });
}
