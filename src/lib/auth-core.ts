import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "thanhhoa_admin_session";
export const ADMIN_SESSION_TTL_DAYS = 7;

function getSecret() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error(
      "SESSION_SECRET must contain at least 32 characters for admin authentication.",
    );
  }
  return new TextEncoder().encode(sessionSecret);
}

export async function signAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_TTL_DAYS}d`)
    .sign(getSecret());
}

export async function verifyAdminSession(token?: string) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
