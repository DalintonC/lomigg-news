import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: "connected" | "disconnected";
      responseTime?: number;
      error?: string;
    };
    sentry: {
      status: "configured" | "disabled";
    };
    ai: {
      status: "configured" | "disabled";
      model?: string;
    };
  };
  metadata: {
    version: string;
    environment: string;
    newsCount?: number;
  };
}

export async function GET() {
  const startTime = Date.now();

  const health: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: "disconnected",
      },
      sentry: {
        status: process.env.NEXT_PUBLIC_SENTRY_DSN ? "configured" : "disabled",
      },
      ai: {
        status:
          process.env.GROQ_API_KEY ||
          process.env.OPENAI_API_KEY ||
          process.env.ANTHROPIC_API_KEY
            ? "configured"
            : "disabled",
        model: process.env.AI_MODEL || "groq",
      },
    },
    metadata: {
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    },
  };

  try {
    const dbStartTime = Date.now();

    if (!supabase) throw new Error("Supabase client not initialized");

    const { count, error } = await supabase
      .from("news")
      .select("*", { count: "exact", head: true })
      .limit(1);

    if (error) throw error;

    const dbResponseTime = Date.now() - dbStartTime;

    health.services.database = {
      status: "connected",
      responseTime: dbResponseTime,
    };

    health.metadata.newsCount = count || 0;
  } catch (error) {
    health.status = "degraded";
    health.services.database = {
      status: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  if (health.services.database.status === "disconnected") {
    health.status = "unhealthy";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;
  const totalResponseTime = Date.now() - startTime;

  return NextResponse.json(
    {
      ...health,
      responseTime: totalResponseTime,
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
