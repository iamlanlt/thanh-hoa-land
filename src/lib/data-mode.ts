export function assertPublicDataAvailable(
  nodeEnv = process.env.NODE_ENV,
  databaseConfigured = Boolean(process.env.DATABASE_URL),
) {
  if (nodeEnv === "production" && !databaseConfigured) {
    throw new Error("DATABASE_URL is required for public production data.");
  }
}
