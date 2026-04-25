import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

import type { NextRequest } from "next/server";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

const DEFAULT_SECRET = "demo-jwt-secret-change-me-before-production";
const TOKEN_TTL_SEC = 60 * 60 * 24 * 7;

function getSecret(): string {
  return process.env.JWT_SECRET ?? DEFAULT_SECRET;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export function createToken(userId: string, email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthTokenPayload = {
    sub: userId,
    email,
    iat: now,
    exp: now + TOKEN_TTL_SEC,
  };
  const header = { alg: "HS256", typ: "JWT" };
  const headerPart = base64UrlEncode(JSON.stringify(header));
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", getSecret())
    .update(`${headerPart}.${payloadPart}`)
    .digest("base64url");
  return `${headerPart}.${payloadPart}.${signature}`;
}

export function verifyToken(token: string): AuthTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signature] = parts;
  const expectedSignature = createHmac("sha256", getSecret())
    .update(`${headerPart}.${payloadPart}`)
    .digest("base64url");
  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as AuthTokenPayload;
    if (!payload.sub || !payload.email || !payload.exp || !payload.iat) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAuthTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export function getAuthPayloadFromRequest(
  request: NextRequest
): AuthTokenPayload | null {
  const token = getAuthTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}
