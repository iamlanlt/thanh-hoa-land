const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function requireEnvironmentValue(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

export function getPublicSiteUrl() {
  const value = requireEnvironmentValue("NEXT_PUBLIC_SITE_URL");
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
  }
  if (isProduction()) {
    if (parsed.protocol !== "https:" || LOCAL_HOSTS.has(parsed.hostname)) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL must use HTTPS and must not point to localhost in production.",
      );
    }
  }

  return parsed.toString().replace(/\/$/, "");
}
