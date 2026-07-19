import { ethers } from "ethers";

const JWT_SECRET = process.env.JWT_SECRET || "tap-dev-secret-change-in-production";

export interface User {
  address: string;
  createdAt: string;
  lastLogin: string;
}

function base64UrlEncode(data: string): string {
  return Buffer.from(data).toString("base64url");
}

function base64UrlDecode(data: string): string {
  return Buffer.from(data, "base64url").toString();
}

export function signJWT(payload: Record<string, unknown>): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify({ ...payload, iat: Date.now() }));
  const data = `${header}.${body}`;
  const sig = base64UrlEncode(ethers.id(data).slice(0, 32));
  return `${data}.${sig}`;
}

export function verifyJWT(token: string): Record<string, unknown> | null {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return null;
    const data = `${header}.${body}`;
    const expectedSig = base64UrlEncode(ethers.id(data).slice(0, 32));
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(base64UrlDecode(body));
    if (Date.now() - payload.iat > 7 * 24 * 60 * 60 * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

const SIGN_MESSAGE = "Sign in to Tap — Pay-Per-Use AI API Marketplace";

export function getSignMessage(): string {
  return SIGN_MESSAGE;
}

export function recoverAddress(message: string, signature: string): string | null {
  try {
    return ethers.verifyMessage(message, signature);
  } catch {
    return null;
  }
}

export function getAddressFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const payload = verifyJWT(token);
  if (!payload || typeof payload.address !== "string") return null;
  return payload.address;
}
