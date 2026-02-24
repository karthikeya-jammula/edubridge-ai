// ============================================
// EduBridge AI – JWT Authentication Utilities
// ============================================

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-do-not-use";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export function signToken(payload: JwtPayload): string {
  const raw = process.env.JWT_EXPIRES_IN?.trim();
  // Default to 7 days, ensure it's a valid timespan string
  const expiresIn: string = raw && raw.length > 0 ? raw : "7d";
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
