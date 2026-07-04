function requireJwtSecretInProduction() {
  const secret = process.env.JWT_SECRET;
  const env = process.env.NODE_ENV ?? "development";
  if (env === "production") {
    if (!secret || secret.length < 16) {
      throw new Error(
        "JWT_SECRET must be set to a strong value (min 16 chars) in production",
      );
    }
    return secret;
  }
  return secret ?? "dev-only-change-me";
}

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  mongoUri:
    process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/server_dashboard",
  appName: process.env.APP_NAME ?? "server-dashboard",
  logLevel:
    process.env.LOG_LEVEL ??
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  jwtSecret: requireJwtSecretInProduction(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 300),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 30),
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 30_000),
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL ?? "no-reply@example.com",
  brevoSenderName: process.env.BREVO_SENDER_NAME ?? "Server Dashboard",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  uploadsDir: process.env.UPLOADS_DIR ?? "uploads/partner-payments",
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 5),
  vpsPingIntervalMs: Number(
    process.env.VPS_PING_INTERVAL_MS ?? 6 * 60 * 60 * 1000,
  ),
  subscriptionWarningDays: Number(process.env.SUBSCRIPTION_WARNING_DAYS ?? 5),
};
