import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      database: true,
      version: process.env.APP_VERSION ?? "5.1.0",
      environment: process.env.NODE_ENV ?? "development",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString()
    });
  } catch {
    return NextResponse.json({
      ok: false,
      database: false,
      version: process.env.APP_VERSION ?? "5.1.0",
      timestamp: new Date().toISOString(),
      error: "Base de données indisponible"
    }, { status: 503 });
  }
}
