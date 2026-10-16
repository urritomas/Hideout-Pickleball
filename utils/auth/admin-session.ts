const SESSION_COOKIE = "hideout_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  exp: number;
};

function toBase64Url(value: Uint8Array | string): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export function hasAdminConfiguration(): boolean {
  return Boolean(process.env.LORICO_ADMIN_USERNAME && process.env.LORICO_ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

export async function createAdminSessionToken(): Promise<string | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;

  const payload: SessionPayload = { exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = await sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return false;

  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload))) as SessionPayload;
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return false;

    const expectedSignature = await sign(encodedPayload, secret);
    return expectedSignature === providedSignature;
  } catch {
    return false;
  }
}

export const ADMIN_SESSION_TTL_SECONDS = SESSION_TTL_SECONDS;
