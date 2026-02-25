// ============================================
// EduBridge AI – Database Seed Script
// Run: npx prisma db seed
// ============================================

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const config: { url: string; authToken?: string } = { url };
  if (authToken) config.authToken = authToken;
  const adapter = new PrismaLibSql(config);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Seeding database for hackathon demo...\n");

  // Create demo users
  const passwordHash = await hashPassword("demo123");

  const student = await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      email: "student@demo.com",
      name: "Demo Student",
      passwordHash,
      role: "STUDENT",
      preferredLang: "en",
    },
  });

  await prisma.user.upsert({
    where: { email: "teacher@demo.com" },
    update: {},
    create: {
      email: "teacher@demo.com",
      name: "Demo Teacher",
      passwordHash,
      role: "TEACHER",
      preferredLang: "en",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      name: "Demo Admin",
      passwordHash,
      role: "ADMIN",
      preferredLang: "en",
    },
  });

  // Create subjects
  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"];
  
  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name, description: `Learn ${name} with AI assistance` },
    });
  }

  // Create student profile
  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      learningStyle: "visual",
      currentDifficulty: "BEGINNER",
      totalQuizzesTaken: 5,
      averageScore: 75.5,
      streakDays: 3,
    },
  });

  console.log("✅ Demo users created:");
  console.log("   📧 student@demo.com / demo123");
  console.log("   📧 teacher@demo.com / demo123");
  console.log("   📧 admin@demo.com / demo123\n");
  console.log("✅ Subjects seeded:", subjects.join(", "));
  console.log("\n🚀 Database ready for demo!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
