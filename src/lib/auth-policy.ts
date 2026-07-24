export function canUseEnvironmentAdminFallback(
  nodeEnv: string | undefined,
  databaseConfigured: boolean,
) {
  return nodeEnv !== "production" && !databaseConfigured;
}
