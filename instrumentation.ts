import * as Sentry from "@sentry/nextjs";

export async function register() {
  const isProduction = process.env.NODE_ENV === "production";

  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || "development",
      release: `lomigg-news@1.0.0`,
      tracesSampleRate: isProduction ? 0.1 : 1.0,
      debug: false,
    });
  }
}
