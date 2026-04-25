import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET_RAW = process.env.JWT_SECRET;

if (!JWT_SECRET_RAW) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is not set. " +
    "The application cannot start without a secure JWT secret."
  );
}

const JWT_SECRET: string = JWT_SECRET_RAW;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; email: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
}

export function generateVerificationToken(): string {
  return crypto.randomUUID();
}
